using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Models;
using LocalServices.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public BookingsController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // ============================================
        // POST: api/bookings
        // Customer creates a new booking → sends emails to provider + customer
        // ============================================
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customerId = GetCurrentUserId();
            if (customerId == null)
                return Unauthorized(new { message = "Invalid token." });

            // Fetch listing with provider info
            var listing = await _context.Listings
                .Include(l => l.Provider)
                .Include(l => l.Category)
                .FirstOrDefaultAsync(l => l.Id == dto.ListingId);

            if (listing == null)
                return NotFound(new { message = "Listing not found." });

            if (!listing.IsActive)
                return BadRequest(new { message = "This listing is not currently accepting bookings." });

            // Can't book your own listing
            if (listing.ProviderId == customerId.Value)
                return BadRequest(new { message = "You cannot book your own listing." });

            // Fetch customer info
            var customer = await _context.Users.FindAsync(customerId.Value);
            if (customer == null)
                return Unauthorized(new { message = "Customer not found." });

            // Create booking
            var newBooking = new Booking
            {
                ListingId = dto.ListingId,
                CustomerId = customerId.Value,
                Message = dto.Message,
                PreferredDate = dto.PreferredDate.HasValue
         ? DateTime.SpecifyKind(dto.PreferredDate.Value, DateTimeKind.Utc)
         : null,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(newBooking);
            await _context.SaveChangesAsync();

            // Send emails ASYNCHRONOUSLY (fire-and-forget so API returns fast)
            _ = Task.Run(async () =>
            {
                // 1. Email to provider (new booking notification)
                var providerEmail = _emailService.BuildNewBookingEmail(
                    listing.Provider!.FullName,
                    customer.FullName,
                    customer.Email,
                    customer.Phone ?? "",
                    listing.Title,
                    dto.Message,
                    dto.PreferredDate
                );
                await _emailService.SendEmailAsync(
                    listing.Provider.Email,
                    listing.Provider.FullName,
                    $"📩 New Booking: {listing.Title}",
                    providerEmail
                );

                // 2. Email to customer (confirmation)
                var customerEmail = _emailService.BuildCustomerConfirmationEmail(
                    customer.FullName,
                    listing.Provider.FullName,
                    listing.Title,
                    listing.Price,
                    listing.Location,
                    dto.Message,
                    dto.PreferredDate
                );
                await _emailService.SendEmailAsync(
                    customer.Email,
                    customer.FullName,
                    $"✓ Booking Submitted: {listing.Title}",
                    customerEmail
                );
            });

            // Return immediately (don't wait for emails)
            return Ok(new
            {
                message = "Booking submitted successfully! Confirmation email sent.",
                bookingId = newBooking.Id,
                status = newBooking.Status
            });
        }

        // ============================================
        // GET: api/bookings/my-bookings
        // Customer's own bookings (services they booked)
        // ============================================
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var bookings = await _context.Bookings
                .Include(b => b.Listing!).ThenInclude(l => l.Provider)
                .Include(b => b.Listing!).ThenInclude(l => l.Category)
                .Include(b => b.Customer)
                .Where(b => b.CustomerId == userId.Value)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingResponseDto
                {
                    Id = b.Id,
                    Message = b.Message,
                    PreferredDate = b.PreferredDate,
                    Status = b.Status,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt,
                    ListingId = b.ListingId,
                    ListingTitle = b.Listing!.Title,
                    ListingPrice = b.Listing.Price,
                    ListingLocation = b.Listing.Location,
                    CategoryName = b.Listing.Category!.Name,
                    CustomerId = b.CustomerId,
                    CustomerName = b.Customer!.FullName,
                    CustomerEmail = b.Customer.Email,
                    CustomerPhone = b.Customer.Phone,
                    ProviderId = b.Listing.ProviderId,
                    ProviderName = b.Listing.Provider!.FullName,
                    ProviderEmail = b.Listing.Provider.Email,
                    ProviderPhone = b.Listing.Provider.Phone
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // ============================================
        // GET: api/bookings/received
        // Provider sees bookings received on their listings
        // ============================================
        [HttpGet("received")]
        public async Task<IActionResult> GetReceivedBookings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var bookings = await _context.Bookings
                .Include(b => b.Listing!).ThenInclude(l => l.Provider)
                .Include(b => b.Listing!).ThenInclude(l => l.Category)
                .Include(b => b.Customer)
                .Where(b => b.Listing!.ProviderId == userId.Value)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookingResponseDto
                {
                    Id = b.Id,
                    Message = b.Message,
                    PreferredDate = b.PreferredDate,
                    Status = b.Status,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt,
                    ListingId = b.ListingId,
                    ListingTitle = b.Listing!.Title,
                    ListingPrice = b.Listing.Price,
                    ListingLocation = b.Listing.Location,
                    CategoryName = b.Listing.Category!.Name,
                    CustomerId = b.CustomerId,
                    CustomerName = b.Customer!.FullName,
                    CustomerEmail = b.Customer.Email,
                    CustomerPhone = b.Customer.Phone,
                    ProviderId = b.Listing.ProviderId,
                    ProviderName = b.Listing.Provider!.FullName,
                    ProviderEmail = b.Listing.Provider.Email,
                    ProviderPhone = b.Listing.Provider.Phone
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // ============================================
        // GET: api/bookings/{id}
        // View single booking (only if you're the customer or provider)
        // ============================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var booking = await _context.Bookings
                .Include(b => b.Listing!).ThenInclude(l => l.Provider)
                .Include(b => b.Listing!).ThenInclude(l => l.Category)
                .Include(b => b.Customer)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            // Authorization: only customer who booked OR provider who owns listing
            if (booking.CustomerId != userId.Value && booking.Listing!.ProviderId != userId.Value)
                return Forbid();

            var dto = new BookingResponseDto
            {
                Id = booking.Id,
                Message = booking.Message,
                PreferredDate = booking.PreferredDate,
                Status = booking.Status,
                CreatedAt = booking.CreatedAt,
                UpdatedAt = booking.UpdatedAt,
                ListingId = booking.ListingId,
                ListingTitle = booking.Listing!.Title,
                ListingPrice = booking.Listing.Price,
                ListingLocation = booking.Listing.Location,
                CategoryName = booking.Listing.Category!.Name,
                CustomerId = booking.CustomerId,
                CustomerName = booking.Customer!.FullName,
                CustomerEmail = booking.Customer.Email,
                CustomerPhone = booking.Customer.Phone,
                ProviderId = booking.Listing.ProviderId,
                ProviderName = booking.Listing.Provider!.FullName,
                ProviderEmail = booking.Listing.Provider.Email,
                ProviderPhone = booking.Listing.Provider.Phone
            };

            return Ok(dto);
        }

        // ============================================
        // PUT: api/bookings/{id}/status
        // Provider updates booking status (accepted/rejected/completed) → sends email
        // ============================================
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] BookingUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var booking = await _context.Bookings
                .Include(b => b.Listing!).ThenInclude(l => l.Provider)
                .Include(b => b.Customer)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            // Only provider who owns the listing can update status
            if (booking.Listing!.ProviderId != userId.Value)
                return Forbid();

            // Update status
            booking.Status = dto.Status;
            booking.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Send email to customer about status change (fire-and-forget)
            _ = Task.Run(async () =>
            {
                var emailBody = _emailService.BuildStatusUpdateEmail(
                    booking.Customer!.FullName,
                    booking.Listing.Provider!.FullName,
                    booking.Listing.Title,
                    dto.Status
                );

                await _emailService.SendEmailAsync(
                    booking.Customer.Email,
                    booking.Customer.FullName,
                    $"Booking {char.ToUpper(dto.Status[0])}{dto.Status.Substring(1)}: {booking.Listing.Title}",
                    emailBody
                );
            });

            return Ok(new
            {
                message = $"Booking status updated to '{dto.Status}'. Customer notified via email.",
                status = booking.Status
            });
        }

        // ============================================
        // DELETE: api/bookings/{id}
        // Customer cancels their own pending booking
        // ============================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            // Only the customer who booked can cancel
            if (booking.CustomerId != userId.Value)
                return Forbid();

            // Can only cancel pending bookings
            if (booking.Status != "pending")
                return BadRequest(new { message = $"Cannot cancel a booking with status '{booking.Status}'." });

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking cancelled successfully." });
        }

        // ============================================
        // HELPER
        // ============================================
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;

            if (int.TryParse(userIdClaim, out int userId)) return userId;
            return null;
        }
    }
}