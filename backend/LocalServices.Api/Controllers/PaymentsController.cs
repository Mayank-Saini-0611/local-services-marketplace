using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Models;
using LocalServices.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly NotificationService _notificationService;

        public PaymentsController(
            AppDbContext context,
            IConfiguration configuration,
            NotificationService notificationService)
        {
            _context = context;
            _configuration = configuration;
            _notificationService = notificationService;
        }

        // ============================================
        // POST: api/payments/create-order
        // Create Razorpay Order ID for a booking
        // ============================================
        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequestDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var booking = await _context.Bookings
                .Include(b => b.Listing)
                .Include(b => b.Customer)
                .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            if (booking.CustomerId != userId.Value)
                return Forbid();

            var keyId = _configuration["Razorpay:KeyId"];
            var keySecret = _configuration["Razorpay:KeySecret"];

            if (string.IsNullOrEmpty(keyId) || string.IsNullOrEmpty(keySecret))
                return BadRequest(new { message = "Razorpay credentials not configured on backend." });

            var client = new RazorpayClient(keyId, keySecret);

            // Amount in paise (Razorpay handles integers: 500 INR = 50000 paise)
            int amountInPaise = (int)Math.Round(booking.Listing!.Price * 100);

            var options = new Dictionary<string, object>
            {
                { "amount", amountInPaise },
                { "currency", "INR" },
                { "receipt", $"receipt_booking_{booking.Id}" },
                { "payment_capture", 1 } // Auto capture payment
            };

            Razorpay.Api.Order order = client.Order.Create(options);
            string razorpayOrderId = order["id"].ToString();

            // Save or update payment record in DB
            var existingPayment = await _context.Payments.FirstOrDefaultAsync(p => p.BookingId == booking.Id);
            if (existingPayment != null)
            {
                existingPayment.RazorpayOrderId = razorpayOrderId;
                existingPayment.Amount = booking.Listing.Price;
                existingPayment.Status = "created";
                existingPayment.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var payment = new LocalServices.Api.Models.Payment
                {
                    BookingId = booking.Id,
                    RazorpayOrderId = razorpayOrderId,
                    Amount = booking.Listing.Price,
                    Currency = "INR",
                    Status = "created",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Payments.Add(payment);
            }

            await _context.SaveChangesAsync();

            return Ok(new CreateOrderResponseDto
            {
                OrderId = razorpayOrderId,
                Amount = booking.Listing.Price,
                Currency = "INR",
                KeyId = keyId,
                CustomerName = booking.Customer!.FullName,
                CustomerEmail = booking.Customer.Email,
                CustomerPhone = booking.Customer.Phone,
                ListingTitle = booking.Listing.Title
            });
        }

        // ============================================
        // POST: api/payments/verify
        // Verify Razorpay HMAC SHA256 Signature
        // ============================================
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var keySecret = _configuration["Razorpay:KeySecret"];
            if (string.IsNullOrEmpty(keySecret))
                return BadRequest(new { message = "Razorpay secret key not configured." });

            // Verify Signature using HMAC SHA256
            string payload = $"{dto.RazorpayOrderId}|{dto.RazorpayPaymentId}";
            string generatedSignature = ComputeHmacSha256(payload, keySecret);

            if (generatedSignature.Equals(dto.RazorpaySignature, StringComparison.OrdinalIgnoreCase))
            {
                // Signature Valid! Update Payment Record
                var payment = await _context.Payments.FirstOrDefaultAsync(p => p.RazorpayOrderId == dto.RazorpayOrderId);
                if (payment != null)
                {
                    payment.RazorpayPaymentId = dto.RazorpayPaymentId;
                    payment.RazorpaySignature = dto.RazorpaySignature;
                    payment.Status = "captured";
                    payment.UpdatedAt = DateTime.UtcNow;
                }

                // Update Booking Status to Accepted/Paid
                var booking = await _context.Bookings
                    .Include(b => b.Listing)
                    .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

                if (booking != null)
                {
                    booking.Status = "accepted"; // Paid bookings automatically become accepted
                    booking.UpdatedAt = DateTime.UtcNow;

                    // Send real-time notification to Provider
                    await _notificationService.SendNotificationAsync(
                        userId: booking.Listing!.ProviderId,
                        type: "booking_paid",
                        title: "Payment Received! 💳",
                        message: $"Payment of ₹{payment?.Amount} received for '{booking.Listing.Title}'",
                        link: "/dashboard/bookings"
                    );
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Payment verified and booking confirmed successfully!" });
            }
            else
            {
                return BadRequest(new { message = "Invalid payment signature. Verification failed." });
            }
        }

        private static string ComputeHmacSha256(string data, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;
            return int.TryParse(userIdClaim, out int userId) ? userId : null;
        }
    }
}