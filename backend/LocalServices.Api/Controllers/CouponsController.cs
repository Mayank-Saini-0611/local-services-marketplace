using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CouponsController(AppDbContext context)
        {
            _context = context;
        }

        // ============================================
        // POST: api/coupons/apply
        // Public/Customer - Validate and calculate discount
        // ============================================
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyCoupon([FromBody] ApplyCouponDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == dto.Code.Trim().ToUpper() && c.IsActive);

            if (coupon == null)
            {
                return BadRequest(new ApplyCouponResponseDto
                {
                    IsValid = false,
                    Message = "Invalid or expired coupon code."
                });
            }

            if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate.Value < DateTime.UtcNow)
            {
                return BadRequest(new ApplyCouponResponseDto
                {
                    IsValid = false,
                    Message = "This coupon code has expired."
                });
            }

            if (dto.BookingAmount < coupon.MinBookingAmount)
            {
                return BadRequest(new ApplyCouponResponseDto
                {
                    IsValid = false,
                    Message = $"Minimum booking amount of ₹{coupon.MinBookingAmount} required for this coupon."
                });
            }

            decimal discount = 0;
            if (coupon.DiscountType == "flat")
            {
                discount = coupon.DiscountValue;
            }
            else if (coupon.DiscountType == "percent")
            {
                discount = Math.Round((dto.BookingAmount * coupon.DiscountValue) / 100m, 2);
                if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount.Value)
                {
                    discount = coupon.MaxDiscountAmount.Value;
                }
            }

            // Cap discount so total doesn't go below 0
            if (discount > dto.BookingAmount) discount = dto.BookingAmount;

            decimal finalAmount = dto.BookingAmount - discount;

            return Ok(new ApplyCouponResponseDto
            {
                IsValid = true,
                Code = coupon.Code,
                DiscountAmount = discount,
                FinalAmount = finalAmount,
                Message = $"Coupon '{coupon.Code}' applied successfully! You saved ₹{discount}."
            });
        }

        // ============================================
        // GET: api/coupons
        // Admin Only - List all coupons
        // ============================================
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllCoupons()
        {
            var coupons = await _context.Coupons
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
            return Ok(coupons);
        }

        // ============================================
        // POST: api/coupons
        // Admin Only - Create new coupon
        // ============================================
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _context.Coupons.AnyAsync(c => c.Code.ToUpper() == dto.Code.Trim().ToUpper());
            if (exists) return BadRequest(new { message = "Coupon code already exists." });

            var coupon = new Coupon
            {
                Code = dto.Code.Trim().ToUpper(),
                DiscountType = dto.DiscountType.ToLower(),
                DiscountValue = dto.DiscountValue,
                MinBookingAmount = dto.MinBookingAmount,
                MaxDiscountAmount = dto.MaxDiscountAmount,
                ExpiryDate = dto.ExpiryDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            return Ok(coupon);
        }

        // ============================================
        // DELETE: api/coupons/{id}
        // Admin Only - Delete coupon
        // ============================================
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCoupon(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound();

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Coupon deleted successfully." });
        }
    }
}