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
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        // ============================================
        // GET: api/favorites
        // Get all user's favorite listings
        // ============================================
        [HttpGet]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var favorites = await _context.Favorites
                .Include(f => f.Listing!).ThenInclude(l => l.Provider)
                .Include(f => f.Listing!).ThenInclude(l => l.Category)
                .Where(f => f.UserId == userId.Value && f.Listing!.IsActive)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new ListingResponseDto
                {
                    Id = f.Listing!.Id,
                    Title = f.Listing.Title,
                    Description = f.Listing.Description,
                    Price = f.Listing.Price,
                    Location = f.Listing.Location,
                    ImageUrls = !string.IsNullOrEmpty(f.Listing.ImageUrls)
                        ? f.Listing.ImageUrls.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                        : new List<string>(),
                    IsActive = f.Listing.IsActive,
                    CreatedAt = f.Listing.CreatedAt,
                    UpdatedAt = f.Listing.UpdatedAt,
                    ProviderId = f.Listing.ProviderId,
                    ProviderName = f.Listing.Provider!.FullName,
                    ProviderEmail = f.Listing.Provider.Email,
                    ProviderPhone = f.Listing.Provider.Phone,
                    CategoryId = f.Listing.CategoryId,
                    CategoryName = f.Listing.Category!.Name
                })
                .ToListAsync();

            // Add ratings
            var listingIds = favorites.Select(l => l.Id).ToList();
            var ratingsData = await _context.Reviews
                .Where(r => listingIds.Contains(r.ListingId))
                .GroupBy(r => r.ListingId)
                .Select(g => new { ListingId = g.Key, Avg = g.Average(r => r.Rating), Count = g.Count() })
                .ToListAsync();

            foreach (var listing in favorites)
            {
                var rating = ratingsData.FirstOrDefault(r => r.ListingId == listing.Id);
                listing.AverageRating = rating != null ? Math.Round(rating.Avg, 1) : 0;
                listing.ReviewCount = rating?.Count ?? 0;
            }

            return Ok(favorites);
        }

        // ============================================
        // GET: api/favorites/ids
        // Get just the listing IDs (for heart icon state)
        // ============================================
        [HttpGet("ids")]
        public async Task<IActionResult> GetFavoriteIds()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var ids = await _context.Favorites
                .Where(f => f.UserId == userId.Value)
                .Select(f => f.ListingId)
                .ToListAsync();

            return Ok(ids);
        }

        // ============================================
        // POST: api/favorites/{listingId}
        // Add a listing to favorites
        // ============================================
        [HttpPost("{listingId}")]
        public async Task<IActionResult> AddFavorite(int listingId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var listing = await _context.Listings.FindAsync(listingId);
            if (listing == null) return NotFound(new { message = "Listing not found." });

            var exists = await _context.Favorites
                .AnyAsync(f => f.UserId == userId.Value && f.ListingId == listingId);

            if (exists)
                return Ok(new { message = "Already in favorites" });

            var favorite = new Favorite
            {
                UserId = userId.Value,
                ListingId = listingId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Added to favorites", favoriteId = favorite.Id });
        }

        // ============================================
        // DELETE: api/favorites/{listingId}
        // Remove a listing from favorites
        // ============================================
        [HttpDelete("{listingId}")]
        public async Task<IActionResult> RemoveFavorite(int listingId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId.Value && f.ListingId == listingId);

            if (favorite == null)
                return NotFound(new { message = "Not in favorites" });

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Removed from favorites" });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;
            return int.TryParse(userIdClaim, out int userId) ? userId : null;
        }
    }
}