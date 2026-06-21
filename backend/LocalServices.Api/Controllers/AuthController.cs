using BCrypt.Net;
using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Models;
using LocalServices.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;
        private readonly EmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly NotificationService _notificationService;

        public AuthController(AppDbContext context, JwtService jwtService, EmailService emailService, IConfiguration configuration, NotificationService notificationService)
        {
            _context = context;
            _jwtService = jwtService;
            _emailService = emailService;
            _configuration = configuration;
            _notificationService = notificationService;
        }



        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == registerDto.Email);

            if (emailExists)
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            var newUser = new User
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                Phone = registerDto.Phone,
                Role = registerDto.Role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Notify all admins of new registration
            var admins = await _context.Users.Where(u => u.Role == "admin").ToListAsync();
            foreach (var admin in admins)
            {
                await _notificationService.SendNotificationAsync(
                    userId: admin.Id,
                    type: "user_registered",
                    title: "New User Registered 👤",
                    message: $"{newUser.FullName} joined as {newUser.Role}",
                    link: "/admin/users"
                );
            }

            // Generate JWT token for the newly registered user
            var token = _jwtService.GenerateToken(newUser);

            return Ok(new AuthResponseDto
            {
                UserId = newUser.Id,
                FullName = newUser.FullName,
                Email = newUser.Email,
                Role = newUser.Role,
                Token = token
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }

        // GET: api/auth/me — Returns current logged-in user info
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new
            {
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role,
                phone = user.Phone,
                createdAt = user.CreatedAt
            });
        }

        // ============================================
        // POST: api/auth/forgot-password
        // ============================================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            // Security: Don't reveal if email exists (prevent email enumeration attacks)
            if (user == null)
            {
                return Ok(new { message = "If an account exists with this email, you'll receive a password reset link shortly." });
            }

            // Generate cryptographically secure random token (64 chars)
            var tokenBytes = new byte[48];
            RandomNumberGenerator.Fill(tokenBytes);
            var rawToken = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");

            // Hash the token before storing (so DB breach doesn't leak tokens)
            var tokenHash = BCrypt.Net.BCrypt.HashPassword(rawToken);

            // Invalidate any existing unused tokens for this user
            var existingTokens = await _context.PasswordResetTokens
                .Where(t => t.UserId == user.Id && !t.Used && t.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();
            foreach (var t in existingTokens)
            {
                t.Used = true;
            }

            // Create new token (expires in 1 hour)
            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                Used = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            // Build reset link
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var resetLink = $"{frontendUrl}/reset-password?token={rawToken}";

            // Send email asynchronously
            _ = Task.Run(async () =>
            {
                var emailBody = _emailService.BuildPasswordResetEmail(user.FullName, resetLink);
                await _emailService.SendEmailAsync(
                    user.Email,
                    user.FullName,
                    "🔐 Reset Your Password - Local Services Marketplace",
                    emailBody
                );
            });

            return Ok(new { message = "If an account exists with this email, you'll receive a password reset link shortly." });
        }

        // ============================================
        // POST: api/auth/reset-password
        // ============================================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Get all non-expired, unused tokens
            var validTokens = await _context.PasswordResetTokens
                .Include(t => t.User)
                .Where(t => !t.Used && t.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

            // Find the token by checking each hash (BCrypt verify is one-way)
            PasswordResetToken? matchingToken = null;
            foreach (var token in validTokens)
            {
                if (BCrypt.Net.BCrypt.Verify(dto.Token, token.TokenHash))
                {
                    matchingToken = token;
                    break;
                }
            }

            if (matchingToken == null)
            {
                return BadRequest(new { message = "Invalid or expired reset token. Please request a new password reset." });
            }

            // Update user password
            matchingToken.User!.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            matchingToken.User.UpdatedAt = DateTime.UtcNow;

            // Mark token as used (one-time use)
            matchingToken.Used = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully! You can now log in with your new password." });
        }






        // ============================================
        // PUT: api/auth/profile
        // ============================================
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.FullName = dto.FullName.Trim();
            user.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully",
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                role = user.Role
            });
        }

        // ============================================
        // PUT: api/auth/change-password
        // ============================================
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect." });

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully." });
        }

        // ============================================
        // DELETE: api/auth/account
        // ============================================
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpDelete("account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account deleted successfully." });
        }
    }
}