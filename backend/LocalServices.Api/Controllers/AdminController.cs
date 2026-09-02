using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly NotificationService _notificationService;
        private readonly ProviderTrustService _providerTrustService;

        public AdminController(
            AppDbContext context,
            NotificationService notificationService,
            ProviderTrustService providerTrustService)
        {
            _context = context;
            _notificationService = notificationService;
            _providerTrustService = providerTrustService;
        }

        // ============================================
        // GET: api/admin/dashboard-stats
        // ============================================
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var weekAgo = DateTime.UtcNow.AddDays(-7);
            var today = DateTime.UtcNow.Date;

            var stats = new DashboardStatsDto
            {
                // User stats
                TotalUsers = await _context.Users.CountAsync(),
                TotalCustomers = await _context.Users.CountAsync(u => u.Role == "customer"),
                TotalProviders = await _context.Users.CountAsync(u => u.Role == "provider"),
                TotalAdmins = await _context.Users.CountAsync(u => u.Role == "admin"),
                NewUsersThisWeek = await _context.Users.CountAsync(u => u.CreatedAt >= weekAgo),

                // Listing stats
                TotalListings = await _context.Listings.CountAsync(),
                ActiveListings = await _context.Listings.CountAsync(l => l.IsActive),
                InactiveListings = await _context.Listings.CountAsync(l => !l.IsActive),
                NewListingsThisWeek = await _context.Listings.CountAsync(l => l.CreatedAt >= weekAgo),

                // Booking stats
                TotalBookings = await _context.Bookings.CountAsync(),
                PendingBookings = await _context.Bookings.CountAsync(b => b.Status == "pending"),
                AcceptedBookings = await _context.Bookings.CountAsync(b => b.Status == "accepted"),
                RejectedBookings = await _context.Bookings.CountAsync(b => b.Status == "rejected"),
                CompletedBookings = await _context.Bookings.CountAsync(b => b.Status == "completed"),
                NewBookingsToday = await _context.Bookings.CountAsync(b => b.CreatedAt >= today),

                // Category stats
                TotalCategories = await _context.Categories.CountAsync(),

                // Simulated revenue (sum of listing prices for completed bookings)
                TotalRevenue = await _context.Bookings
                    .Where(b => b.Status == "completed")
                    .Include(b => b.Listing)
                    .SumAsync(b => b.Listing!.Price)
            };

            return Ok(stats);
        }

        // ============================================
        // GET: api/admin/users
        // ============================================
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? role, [FromQuery] string? search)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(role) && role != "all")
                query = query.Where(u => u.Role == role);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(search.ToLower()) ||
                    u.Email.ToLower().Contains(search.ToLower()));

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt,
                    TotalListings = u.Listings.Count,
                    TotalBookings = u.Bookings.Count,
                    KycStatus = u.KycStatus,
                    EmailVerified = u.EmailVerified,
                    PhoneVerified = u.PhoneVerified,
                    BackgroundChecked = u.BackgroundChecked,
                    BusinessVerified = u.BusinessVerified
                })
                .ToListAsync();

            return Ok(users);
        }

        // ============================================
        // GET: api/admin/listings
        // ============================================
        [HttpGet("listings")]
        public async Task<IActionResult> GetAllListings([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.Listings
                .Include(l => l.Provider)
                .Include(l => l.Category)
                .AsQueryable();

            if (status == "active")
                query = query.Where(l => l.IsActive);
            else if (status == "inactive")
                query = query.Where(l => !l.IsActive);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(l =>
                    l.Title.ToLower().Contains(search.ToLower()) ||
                    l.Provider!.FullName.ToLower().Contains(search.ToLower()));

            var listings = await query
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
                    ProviderId = l.ProviderId,
                    ProviderName = l.Provider!.FullName,
                    ProviderEmail = l.Provider.Email,
                    ProviderKycStatus = l.Provider.KycStatus,
                    ProviderPhone = l.Provider.Phone,
                    CategoryId = l.CategoryId,
                    CategoryName = l.Category!.Name
                })
                .ToListAsync();

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
        // GET: api/admin/bookings
        // ============================================
        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings([FromQuery] string? status)
        {
            var query = _context.Bookings
                .Include(b => b.Listing!).ThenInclude(l => l.Provider)
                .Include(b => b.Listing!).ThenInclude(l => l.Category)
                .Include(b => b.Customer)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) && status != "all")
                query = query.Where(b => b.Status == status);

            var bookings = await query
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
        // GET: api/admin/recent-activity
        // ============================================
        [HttpGet("recent-activity")]
        public async Task<IActionResult> GetRecentActivity()
        {
            var activities = new List<RecentActivityDto>();

            // Recent users
            var recentUsers = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .Select(u => new RecentActivityDto
                {
                    Type = "user_registered",
                    Description = $"New {u.Role} registered",
                    UserName = u.FullName,
                    Timestamp = u.CreatedAt
                })
                .ToListAsync();

            // Recent listings
            var recentListings = await _context.Listings
                .Include(l => l.Provider)
                .OrderByDescending(l => l.CreatedAt)
                .Take(5)
                .Select(l => new RecentActivityDto
                {
                    Type = "listing_created",
                    Description = $"Created listing: {l.Title}",
                    UserName = l.Provider!.FullName,
                    Timestamp = l.CreatedAt
                })
                .ToListAsync();

            // Recent bookings
            var recentBookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Listing)
                .OrderByDescending(b => b.CreatedAt)
                .Take(5)
                .Select(b => new RecentActivityDto
                {
                    Type = "booking_created",
                    Description = $"Booked: {b.Listing!.Title}",
                    UserName = b.Customer!.FullName,
                    Timestamp = b.CreatedAt
                })
                .ToListAsync();

            activities.AddRange(recentUsers);
            activities.AddRange(recentListings);
            activities.AddRange(recentBookings);

            // Sort all by timestamp, take latest 15
            var sorted = activities.OrderByDescending(a => a.Timestamp).Take(15).ToList();

            return Ok(sorted);
        }

        // ============================================
        // GET: api/admin/analytics/growth
        // ============================================
        [HttpGet("analytics/growth")]
        public async Task<IActionResult> GetGrowthData()
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;
            var growthData = new GrowthDataDto();

            // Users growth (last 7 days)
            var usersData = new List<ChartDataPoint>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i).Date;
                var nextDate = date.AddDays(1);
                var count = await _context.Users.CountAsync(u => u.CreatedAt >= date && u.CreatedAt < nextDate);
                usersData.Add(new ChartDataPoint
                {
                    Label = date.ToString("MMM dd"),
                    Value = count
                });
            }
            growthData.UsersGrowth = usersData;

            // Bookings growth (last 7 days)
            var bookingsData = new List<ChartDataPoint>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i).Date;
                var nextDate = date.AddDays(1);
                var count = await _context.Bookings.CountAsync(b => b.CreatedAt >= date && b.CreatedAt < nextDate);
                bookingsData.Add(new ChartDataPoint
                {
                    Label = date.ToString("MMM dd"),
                    Value = count
                });
            }
            growthData.BookingsGrowth = bookingsData;

            // Category distribution
            var categoryStats = await _context.Categories
                .Select(c => new CategoryStats
                {
                    CategoryName = c.Name,
                    ListingsCount = c.Listings.Count,
                    BookingsCount = c.Listings.SelectMany(l => l.Bookings).Count()
                })
                .OrderByDescending(c => c.ListingsCount)
                .ToListAsync();
            growthData.CategoryDistribution = categoryStats;

            return Ok(growthData);
        }

        // ============================================
        // PUT: api/admin/users/{id}/role
        // ============================================
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            if (!new[] { "customer", "provider", "admin" }.Contains(dto.Role))
                return BadRequest(new { message = "Invalid role. Must be: customer, provider, or admin." });

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.Role = dto.Role;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User role updated to '{dto.Role}'.", userId = user.Id });
        }

        // ============================================
        // DELETE: api/admin/users/{id}
        // ============================================
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Cascade delete will handle listings and bookings
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully." });
        }

        // ============================================
        // DELETE: api/admin/listings/{id}
        // Force delete (hard delete - not soft delete)
        // ============================================
        [HttpDelete("listings/{id}")]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var listing = await _context.Listings.FindAsync(id);
            if (listing == null)
                return NotFound(new { message = "Listing not found." });

            _context.Listings.Remove(listing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Listing permanently deleted." });
        }

        // ============================================
        // PUT: api/admin/listings/{id}/toggle-active
        // ============================================
        [HttpPut("listings/{id}/toggle-active")]
        public async Task<IActionResult> ToggleListingActive(int id)
        {
            var listing = await _context.Listings.FindAsync(id);
            if (listing == null)
                return NotFound(new { message = "Listing not found." });

            listing.IsActive = !listing.IsActive;
            listing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Listing {(listing.IsActive ? "activated" : "deactivated")}.",
                isActive = listing.IsActive
            });
        }






        // ============================================
        // GET: api/admin/kyc-requests
        // ============================================
        [HttpGet("kyc-requests")]
        public async Task<IActionResult> GetKycRequests()
        {
            var requests = await _context.Users
                .Where(u => u.Role == "provider" && u.KycStatus != "unverified")
                .OrderByDescending(u => u.KycSubmittedAt)
                .Select(u => new
                {
                    UserId = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    DocumentUrl = u.KycDocumentUrl,
                    Status = u.KycStatus,
                    SubmittedAt = u.KycSubmittedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        // ============================================
        // PUT: api/admin/kyc-requests/{id}/status
        // ============================================
        [HttpPut("kyc-requests/{id}/status")]
        public async Task<IActionResult> UpdateKycStatus(int id, [FromBody] UpdateKycStatusDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "provider");
            if (user == null) return NotFound(new { message = "Provider not found." });

            user.KycStatus = dto.Status;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Notify Provider
            await _notificationService.SendNotificationAsync(
                userId: user.Id,
                type: $"kyc_{dto.Status}",
                title: dto.Status == "verified" ? "KYC Approved! 🛡️" : "KYC Rejected ❌",
                message: dto.Status == "verified" ? "Your account is now verified." : "Please re-submit your ID document.",
                link: "/dashboard/settings"
            );

            return Ok(new { message = $"Provider KYC marked as {dto.Status}." });
        }

        // ============================================
        // PUT: api/admin/users/{id}/verification
        // Admin-controlled checks that require manual evidence.
        // ============================================
        [HttpPut("users/{id}/verification")]
        public async Task<IActionResult> UpdateProviderVerification(
            int id,
            [FromBody] AdminUpdateVerificationDto dto)
        {
            var provider = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == "provider");
            if (provider == null)
                return NotFound(new { message = "Provider not found." });

            provider.PhoneVerified = dto.PhoneVerified;
            provider.BackgroundChecked = dto.BackgroundChecked;
            provider.BusinessVerified = dto.BusinessVerified;
            provider.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _notificationService.SendNotificationAsync(
                userId: provider.Id,
                type: "verification_updated",
                title: "Trust profile updated",
                message: "An administrator updated your provider verification checks.",
                link: "/dashboard/settings");

            return Ok(new
            {
                message = "Provider verification updated.",
                providerId = provider.Id,
                provider.PhoneVerified,
                provider.BackgroundChecked,
                provider.BusinessVerified
            });
        }

        // ============================================
        // GET: api/admin/reviews
        // ============================================
        [HttpGet("reviews")]
        public async Task<IActionResult> GetReviews([FromQuery] string? status)
        {
            var query = _context.Reviews.AsQueryable();
            if (!string.IsNullOrWhiteSpace(status) && status != "all")
                query = query.Where(r => r.ModerationStatus == status);

            var reviews = await query
                .Include(r => r.Customer)
                .Include(r => r.Provider)
                .Include(r => r.Listing)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new AdminReviewDto
                {
                    Id = r.Id,
                    BookingId = r.BookingId,
                    ListingId = r.ListingId,
                    ListingTitle = r.Listing!.Title,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CustomerId = r.CustomerId,
                    CustomerName = r.Customer!.FullName,
                    ProviderId = r.ProviderId,
                    ProviderName = r.Provider!.FullName,
                    ModerationStatus = r.ModerationStatus,
                    ModerationNote = r.ModerationNote,
                    CreatedAt = r.CreatedAt,
                    ModeratedAt = r.ModeratedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // ============================================
        // PUT: api/admin/reviews/{id}/moderation
        // ============================================
        [HttpPut("reviews/{id}/moderation")]
        public async Task<IActionResult> UpdateReviewModeration(
            int id,
            [FromBody] ReviewModerationUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                return NotFound(new { message = "Review not found." });

            var sanitizer = new Ganss.Xss.HtmlSanitizer();
            review.ModerationStatus = dto.Status;
            review.ModerationNote = string.IsNullOrWhiteSpace(dto.Note)
                ? null
                : sanitizer.Sanitize(dto.Note).Trim();
            review.ModeratedAt = DateTime.UtcNow;
            review.ModeratedById = GetCurrentUserId();
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Review {dto.Status}.",
                reviewId = review.Id,
                status = review.ModerationStatus
            });
        }

        // ============================================
        // GET: api/admin/reports
        // ============================================
        [HttpGet("reports")]
        public async Task<IActionResult> GetReports([FromQuery] string? status)
        {
            var query = _context.UserReports.AsQueryable();
            if (!string.IsNullOrWhiteSpace(status) && status != "all")
                query = query.Where(r => r.Status == status);

            var reports = await query
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.Listing)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new UserReportResponseDto
                {
                    Id = r.Id,
                    ReporterId = r.ReporterId,
                    ReporterName = r.Reporter!.FullName,
                    ReportedUserId = r.ReportedUserId,
                    ReportedUserName = r.ReportedUser!.FullName,
                    ReportedUserRole = r.ReportedUser.Role,
                    ListingId = r.ListingId,
                    ListingTitle = r.Listing == null ? null : r.Listing.Title,
                    Category = r.Category,
                    Description = r.Description,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    ResolvedAt = r.ResolvedAt
                })
                .ToListAsync();

            return Ok(reports);
        }

        // ============================================
        // PUT: api/admin/reports/{id}/status
        // ============================================
        [HttpPut("reports/{id}/status")]
        public async Task<IActionResult> UpdateReportStatus(
            int id,
            [FromBody] UpdateReportStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var report = await _context.UserReports.FindAsync(id);
            if (report == null)
                return NotFound(new { message = "Report not found." });

            report.Status = dto.Status;
            report.UpdatedAt = DateTime.UtcNow;
            report.ResolvedAt = dto.Status is "resolved" or "rejected" ? DateTime.UtcNow : null;
            report.ResolvedById = report.ResolvedAt.HasValue ? GetCurrentUserId() : null;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Report {dto.Status}.", reportId = report.Id, status = report.Status });
        }

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            return int.TryParse(claim, out var userId) ? userId : null;
        }
    }
}