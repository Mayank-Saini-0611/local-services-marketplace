using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static LocalServices.Api.DTOs.ProviderProfileDto;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProvidersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ProviderTrustService _providerTrustService;

        public ProvidersController(AppDbContext context, ProviderTrustService providerTrustService)
        {
            _context = context;
            _providerTrustService = providerTrustService;
        }

        // ============================================
        // GET: api/providers/{id}
        // Public - Get Provider Profile & Stats
        // ============================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProviderProfile(int id)
        {
            var provider = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "provider");
            if (provider == null)
                return NotFound(new { message = "Provider not found." });

            var activeListingsCount = await _context.Listings.CountAsync(l => l.ProviderId == id && l.IsActive);

            var completedBookingsCount = await _context.Bookings
                .Include(b => b.Listing)
                .CountAsync(b => b.Listing!.ProviderId == id && b.Status == "completed");

            var reviews = await _context.Reviews
                .Where(r => r.ProviderId == id && r.ModerationStatus == "published")
                .ToListAsync();

            var profile = new ProviderProfileDto
            {
                KycStatus = provider.KycStatus,
                Id = provider.Id,
                FullName = provider.FullName,
                Email = provider.Email,
                Phone = provider.Phone,
                MemberSince = provider.CreatedAt,
                TotalActiveListings = activeListingsCount,
                TotalJobsCompleted = completedBookingsCount,
                TotalReviews = reviews.Count,
                AverageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0,
                Verification = await _providerTrustService.GetForProviderAsync(provider.Id)
            };

            return Ok(profile);
        }

        // ============================================
        // GET: api/providers/{id}/listings
        // Public - Get all active listings by this provider
        // ============================================
        [HttpGet("{id}/listings")]
        public async Task<IActionResult> GetProviderListings(int id)
        {
            var listings = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.Provider)
                .Where(l => l.ProviderId == id && l.IsActive)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new ListingResponseDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Description = l.Description,
                    Price = l.Price,
                    Location = l.Location,
                    ImageUrls = !string.IsNullOrEmpty(l.ImageUrls)
                        ? l.ImageUrls.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                        : new List<string>(),
                    IsActive = l.IsActive,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt,
                    ProviderKycStatus = l.Provider!.KycStatus,
                    ProviderId = l.ProviderId,
                    ProviderName = l.Provider.FullName,
                    ProviderEmail = l.Provider.Email,
                    ProviderPhone = l.Provider.Phone,
                    CategoryId = l.CategoryId,
                    CategoryName = l.Category!.Name
                })
                .ToListAsync();

            // Add ratings to these listings
            var listingIds = listings.Select(l => l.Id).ToList();
            var ratingsData = await _context.Reviews
                .Where(r => listingIds.Contains(r.ListingId) && r.ModerationStatus == "published")
                .GroupBy(r => r.ListingId)
                .Select(g => new { ListingId = g.Key, Avg = g.Average(r => r.Rating), Count = g.Count() })
                .ToListAsync();

            foreach (var listing in listings)
            {
                var rating = ratingsData.FirstOrDefault(r => r.ListingId == listing.Id);
                listing.AverageRating = rating != null ? Math.Round(rating.Avg, 1) : 0;
                listing.ReviewCount = rating?.Count ?? 0;
            }

            var verificationByProvider = await _providerTrustService.GetForProvidersAsync(
                listings.Select(listing => listing.ProviderId));
            foreach (var listing in listings)
            {
                if (verificationByProvider.TryGetValue(listing.ProviderId, out var verification))
                    listing.ProviderVerification = verification;
            }

            return Ok(listings);
        }

        // ============================================
        // GET: api/providers/{id}/reviews
        // Public - Get all reviews across all provider's services
        // ============================================
        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetProviderReviews(int id)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Listing)
                .Where(r => r.ProviderId == id && r.ModerationStatus == "published")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponseDto
                {
                    Id = r.Id,
                    BookingId = r.BookingId,
                    ListingId = r.ListingId,
                    ListingTitle = r.Listing!.Title, // Shows which service was reviewed
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
        // GET: api/providers/earnings
        // Authenticated Provider - Get Financial Stats
        // ============================================
        [HttpGet("earnings")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "provider")]
        public async Task<IActionResult> GetMyEarnings()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            // Get all completed bookings for this provider's listings
            var completedBookings = await _context.Bookings
                .Include(b => b.Listing)
                .Include(b => b.Customer)
                .Where(b => b.Listing!.ProviderId == userId.Value && b.Status == "completed")
                .OrderByDescending(b => b.UpdatedAt)
                .ToListAsync();

            decimal totalRevenue = 0;
            var transactions = new List<TransactionDto>();

            foreach (var booking in completedBookings)
            {
                var amount = booking.Listing!.Price;
                var fee = Math.Round(amount * 0.05m, 2); // 5% platform fee
                var net = amount - fee;

                totalRevenue += amount;

                transactions.Add(new TransactionDto
                {
                    BookingId = booking.Id,
                    ServiceName = booking.Listing.Title,
                    CustomerName = booking.Customer!.FullName,
                    Amount = amount,
                    Fee = fee,
                    Net = net,
                    CompletedAt = booking.UpdatedAt
                });
            }

            var totalFees = Math.Round(totalRevenue * 0.05m, 2);
            var totalNet = totalRevenue - totalFees;

            return Ok(new ProviderEarningsDto
            {
                TotalRevenue = totalRevenue,
                PlatformFees = totalFees,
                NetEarnings = totalNet,
                RecentTransactions = transactions
            });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;
            return int.TryParse(userIdClaim, out int userId) ? userId : null;
        }

    }
}