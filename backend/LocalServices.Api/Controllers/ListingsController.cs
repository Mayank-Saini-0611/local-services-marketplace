using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ListingsController(AppDbContext context)
        {
            _context = context;
        }

        // ============================================
        // GET: api/listings
        // Public - Get all active listings with filters & pagination
        // ============================================
        [HttpGet]
        public async Task<IActionResult> GetAllListings(
            [FromQuery] int? categoryId,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? location,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Validate pagination
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;

            // Build base query
            var query = _context.Listings
                .Include(l => l.Provider)
                .Include(l => l.Category)
                .Where(l => l.IsActive)
                .AsQueryable();

            // Apply filters
            if (categoryId.HasValue)
                query = query.Where(l => l.CategoryId == categoryId.Value);

            if (minPrice.HasValue)
                query = query.Where(l => l.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(l => l.Price <= maxPrice.Value);

            if (!string.IsNullOrWhiteSpace(location))
                query = query.Where(l => l.Location.ToLower().Contains(location.ToLower()));

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(l =>
                    l.Title.ToLower().Contains(search.ToLower()) ||
                    l.Description.ToLower().Contains(search.ToLower()));

            // Get total count BEFORE pagination
            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Apply pagination
            var listings = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new ListingResponseDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Description = l.Description,
                    Price = l.Price,
                    Location = l.Location,
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

            // Return with pagination metadata
            return Ok(new
            {
                data = listings,
                pagination = new
                {
                    currentPage = page,
                    pageSize = pageSize,
                    totalCount = totalCount,
                    totalPages = totalPages,
                    hasPrevious = page > 1,
                    hasNext = page < totalPages
                }
            });
        }

        // ============================================
        // GET: api/listings/{id}
        // Public - Get single listing by ID
        // ============================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetListingById(int id)
        {
            var listing = await _context.Listings
                .Include(l => l.Provider)
                .Include(l => l.Category)
                .Where(l => l.Id == id)
                .Select(l => new ListingResponseDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Description = l.Description,
                    Price = l.Price,
                    Location = l.Location,
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
                .FirstOrDefaultAsync();

            if (listing == null)
                return NotFound(new { message = $"Listing with ID {id} not found." });

            return Ok(listing);
        }

        // ============================================
        // GET: api/listings/my-listings
        // Authenticated Providers Only - Get own listings
        // ============================================
        [HttpGet("my-listings")]
        [Authorize]
        public async Task<IActionResult> GetMyListings()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var listings = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.Provider)
                .Where(l => l.ProviderId == userId.Value)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new ListingResponseDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Description = l.Description,
                    Price = l.Price,
                    Location = l.Location,
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
        // POST: api/listings
        // Authenticated Providers Only - Create new listing
        // ============================================
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateListing([FromBody] ListingCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var userRole = GetCurrentUserRole();
            if (userRole != "provider")
                return Forbid();

            // Verify category exists
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
                return BadRequest(new { message = $"Category with ID {dto.CategoryId} does not exist." });

            var newListing = new Listing
            {
                ProviderId = userId.Value,
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Location = dto.Location,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Listings.Add(newListing);
            await _context.SaveChangesAsync();

            // Reload with relations to return complete response
            var createdListing = await _context.Listings
                .Include(l => l.Provider)
                .Include(l => l.Category)
                .Where(l => l.Id == newListing.Id)
                .Select(l => new ListingResponseDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Description = l.Description,
                    Price = l.Price,
                    Location = l.Location,
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
                .FirstAsync();

            return CreatedAtAction(nameof(GetListingById), new { id = newListing.Id }, createdListing);
        }

        // ============================================
        // PUT: api/listings/{id}
        // Authenticated Provider Only - Update OWN listing
        // ============================================
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateListing(int id, [FromBody] ListingUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var listing = await _context.Listings.FindAsync(id);
            if (listing == null)
                return NotFound(new { message = $"Listing with ID {id} not found." });

            // Ownership check - provider can only edit their own listings
            if (listing.ProviderId != userId.Value)
                return Forbid();

            // Verify new category exists
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
                return BadRequest(new { message = $"Category with ID {dto.CategoryId} does not exist." });

            // Update fields
            listing.CategoryId = dto.CategoryId;
            listing.Title = dto.Title;
            listing.Description = dto.Description;
            listing.Price = dto.Price;
            listing.Location = dto.Location;
            listing.IsActive = dto.IsActive;
            listing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Listing updated successfully.", id = listing.Id });
        }

        // ============================================
        // DELETE: api/listings/{id}
        // Authenticated Provider Only - Soft-delete OWN listing
        // ============================================
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token." });

            var listing = await _context.Listings.FindAsync(id);
            if (listing == null)
                return NotFound(new { message = $"Listing with ID {id} not found." });

            // Ownership check
            if (listing.ProviderId != userId.Value)
                return Forbid();

            // Soft delete - just mark as inactive
            listing.IsActive = false;
            listing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Listing deleted successfully." });
        }

        // ============================================
        // HELPER METHODS
        // ============================================
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;

            if (int.TryParse(userIdClaim, out int userId)) return userId;
            return null;
        }

        private string? GetCurrentUserRole()
        {
            return User.FindFirst("role")?.Value;
        }
    }
}