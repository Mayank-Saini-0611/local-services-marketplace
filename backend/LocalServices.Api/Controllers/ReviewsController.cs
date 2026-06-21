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
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly NotificationService _notificationService;

        public ReviewsController(AppDbContext context, NotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        // ============================================
        // POST: api/reviews
        // Customer creates review for completed booking
        // ============================================
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var booking = await _context.Bookings
                .Include(b => b.Listing)
                .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            if (booking.CustomerId != userId.Value)
                return Forbid();

            if (booking.Status != "completed")
                return BadRequest(new { message = "You can only review completed bookings." });

            var alreadyReviewed = await _context.Reviews.AnyAsync(r => r.BookingId == dto.BookingId);
            if (alreadyReviewed)
                return BadRequest(new { message = "You have already reviewed this booking." });

            var review = new Review
            {
                BookingId = dto.BookingId,
                ListingId = booking.ListingId,
                CustomerId = userId.Value,
                ProviderId = booking.Listing!.ProviderId,
                Rating = dto.Rating,
                Comment = dto.Comment?.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Send real-time notification to provider
            var customer = await _context.Users.FindAsync(userId.Value);
            var starsEmoji = string.Concat(Enumerable.Repeat("⭐", dto.Rating));

            await _notificationService.SendNotificationAsync(
                userId: booking.Listing!.ProviderId,
                type: "review_received",
                title: $"New Review {starsEmoji}",
                message: $"{customer?.FullName ?? "A customer"} rated '{booking.Listing.Title}' {dto.Rating}/5",
                link: $"/dashboard/listing/{booking.ListingId}"
            );

            return Ok(new { message = "Review submitted successfully!", reviewId = review.Id });
        }
        

        // ============================================
        // GET: api/reviews/listing/{listingId}
        // Get all reviews for a listing (public)
        // ============================================
        [HttpGet("listing/{listingId}")]
        public async Task<IActionResult> GetListingReviews(int listingId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Provider)
                .Include(r => r.Listing)
                .Where(r => r.ListingId == listingId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponseDto
                {
                    Id = r.Id,
                    BookingId = r.BookingId,
                    ListingId = r.ListingId,
                    ListingTitle = r.Listing!.Title,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    CustomerId = r.CustomerId,
                    CustomerName = r.Customer!.FullName,
                    ProviderId = r.ProviderId,
                    ProviderName = r.Provider!.FullName
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // ============================================
        // GET: api/reviews/listing/{listingId}/stats
        // Get rating statistics for a listing (public)
        // ============================================
        [HttpGet("listing/{listingId}/stats")]
        public async Task<IActionResult> GetListingStats(int listingId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ListingId == listingId)
                .ToListAsync();

            var stats = new ListingRatingStatsDto
            {
                TotalReviews = reviews.Count,
                AverageRating = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0,
                FiveStars = reviews.Count(r => r.Rating == 5),
                FourStars = reviews.Count(r => r.Rating == 4),
                ThreeStars = reviews.Count(r => r.Rating == 3),
                TwoStars = reviews.Count(r => r.Rating == 2),
                OneStar = reviews.Count(r => r.Rating == 1)
            };

            return Ok(stats);
        }

        // ============================================
        // GET: api/reviews/my-reviews
        // Get current user's reviews
        // ============================================
        [HttpGet("my-reviews")]
        [Authorize]
        public async Task<IActionResult> GetMyReviews()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var reviews = await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Provider)
                .Include(r => r.Listing)
                .Where(r => r.CustomerId == userId.Value)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponseDto
                {
                    Id = r.Id,
                    BookingId = r.BookingId,
                    ListingId = r.ListingId,
                    ListingTitle = r.Listing!.Title,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    CustomerId = r.CustomerId,
                    CustomerName = r.Customer!.FullName,
                    ProviderId = r.ProviderId,
                    ProviderName = r.Provider!.FullName
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // ============================================
        // PUT: api/reviews/{id}
        // ============================================
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] ReviewUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound(new { message = "Review not found." });

            if (review.CustomerId != userId.Value) return Forbid();

            review.Rating = dto.Rating;
            review.Comment = dto.Comment?.Trim();
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Review updated successfully." });
        }

        // ============================================
        // DELETE: api/reviews/{id}
        // Customer can delete own review; admin can delete any
        // ============================================
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();
            if (userId == null) return Unauthorized();

            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound(new { message = "Review not found." });

            // Customer can delete own OR admin can delete any
            if (review.CustomerId != userId.Value && userRole != "admin")
                return Forbid();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Review deleted successfully." });
        }

        // ============================================
        // GET: api/reviews/can-review/{bookingId}
        // Check if user can review this booking
        // ============================================
        [HttpGet("can-review/{bookingId}")]
        [Authorize]
        public async Task<IActionResult> CanReview(int bookingId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return Ok(new { canReview = false, reason = "Booking not found" });
            if (booking.CustomerId != userId.Value) return Ok(new { canReview = false, reason = "Not your booking" });
            if (booking.Status != "completed") return Ok(new { canReview = false, reason = "Booking not completed" });

            var alreadyReviewed = await _context.Reviews.AnyAsync(r => r.BookingId == bookingId);
            if (alreadyReviewed) return Ok(new { canReview = false, reason = "Already reviewed", alreadyReviewed = true });

            return Ok(new { canReview = true });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;
            return int.TryParse(userIdClaim, out int userId) ? userId : null;
        }

        private string? GetCurrentUserRole() => User.FindFirst("role")?.Value;
    }
}