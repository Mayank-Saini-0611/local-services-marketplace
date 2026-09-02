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
    [Route("api/safety")]
    [Authorize]
    public class SafetyController : ControllerBase
    {
        private static readonly HashSet<string> ReportCategories = new(StringComparer.OrdinalIgnoreCase)
        {
            "unsafe_behavior",
            "harassment",
            "fraud",
            "inappropriate_content",
            "no_show",
            "other"
        };

        private readonly AppDbContext _context;

        public SafetyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("reports")]
        public async Task<IActionResult> CreateReport([FromBody] UserReportCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var reporterId = GetCurrentUserId();
            if (reporterId == null)
                return Unauthorized(new { message = "Invalid token." });

            if (reporterId.Value == dto.ReportedUserId)
                return BadRequest(new { message = "You cannot report yourself." });

            var reportedUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == dto.ReportedUserId);
            if (reportedUser == null)
                return NotFound(new { message = "Reported user not found." });

            if (reportedUser.Role == "admin")
                return BadRequest(new { message = "This account cannot be reported through the marketplace flow." });

            var category = dto.Category.Trim().ToLowerInvariant();
            if (!ReportCategories.Contains(category))
                return BadRequest(new { message = "Invalid report category." });

            if (dto.ListingId.HasValue)
            {
                var listingMatchesUser = await _context.Listings.AnyAsync(l =>
                    l.Id == dto.ListingId.Value && l.ProviderId == dto.ReportedUserId);
                if (!listingMatchesUser)
                    return BadRequest(new { message = "The selected listing does not belong to the reported user." });
            }

            var sanitizer = new Ganss.Xss.HtmlSanitizer();
            var description = sanitizer.Sanitize(dto.Description).Trim();
            if (string.IsNullOrWhiteSpace(description))
                return BadRequest(new { message = "Report description cannot be empty." });

            var duplicateOpenReport = await _context.UserReports.AnyAsync(r =>
                r.ReporterId == reporterId.Value &&
                r.ReportedUserId == dto.ReportedUserId &&
                r.Category == category &&
                r.Status != "resolved" &&
                r.Status != "rejected");
            if (duplicateOpenReport)
                return Conflict(new { message = "You already have an open report for this user and category." });

            var report = new UserReport
            {
                ReporterId = reporterId.Value,
                ReportedUserId = dto.ReportedUserId,
                ListingId = dto.ListingId,
                Category = category,
                Description = description,
                Status = "open",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserReports.Add(report);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyReports), new { id = report.Id }, new
            {
                message = "Report submitted. Our team will review it.",
                reportId = report.Id,
                status = report.Status
            });
        }

        [HttpGet("reports/mine")]
        public async Task<IActionResult> GetMyReports()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var reports = await _context.UserReports
                .Include(r => r.ReportedUser)
                .Include(r => r.Listing)
                .Where(r => r.ReporterId == userId.Value)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new UserReportResponseDto
                {
                    Id = r.Id,
                    ReporterId = r.ReporterId,
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

        [HttpGet("blocks")]
        public async Task<IActionResult> GetMyBlocks()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized();

            var blocks = await _context.UserBlocks
                .Include(b => b.BlockedUser)
                .Where(b => b.BlockerId == userId.Value)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new UserBlockResponseDto
                {
                    Id = b.Id,
                    UserId = b.BlockedUserId,
                    UserName = b.BlockedUser!.FullName,
                    UserRole = b.BlockedUser.Role,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return Ok(blocks);
        }

        [HttpPost("blocks/{userId}")]
        public async Task<IActionResult> BlockUser(int userId)
        {
            var blockerId = GetCurrentUserId();
            if (blockerId == null)
                return Unauthorized();

            if (blockerId.Value == userId)
                return BadRequest(new { message = "You cannot block yourself." });

            var blockedUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId && u.Role != "admin");
            if (blockedUser == null)
                return NotFound(new { message = "User not found." });

            var existing = await _context.UserBlocks.AnyAsync(b =>
                b.BlockerId == blockerId.Value && b.BlockedUserId == userId);
            if (existing)
                return Ok(new { message = "User is already blocked.", userId });

            _context.UserBlocks.Add(new UserBlock
            {
                BlockerId = blockerId.Value,
                BlockedUserId = userId,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "User blocked. New bookings and messages with this user are disabled.", userId });
        }

        [HttpDelete("blocks/{userId}")]
        public async Task<IActionResult> UnblockUser(int userId)
        {
            var blockerId = GetCurrentUserId();
            if (blockerId == null)
                return Unauthorized();

            var block = await _context.UserBlocks.FirstOrDefaultAsync(b =>
                b.BlockerId == blockerId.Value && b.BlockedUserId == userId);
            if (block == null)
                return NotFound(new { message = "User is not blocked." });

            _context.UserBlocks.Remove(block);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User unblocked.", userId });
        }

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            return int.TryParse(claim, out var userId) ? userId : null;
        }
    }
}
