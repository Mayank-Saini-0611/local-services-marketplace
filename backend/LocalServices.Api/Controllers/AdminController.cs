using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
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
                    TotalBookings = u.Bookings.Count
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
                    ProviderPhone = l.Provider.Phone,
                    CategoryId = l.CategoryId,
                    CategoryName = l.Category!.Name
                })
                .ToListAsync();

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
    }
}