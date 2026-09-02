using BCrypt.Net;
using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Models;
using LocalServices.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Google.Apis.Auth;

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

        // ============================================
        // POST: api/auth/register
        // ============================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var emailExists = await _context.Users.AnyAsync(u => u.Email == registerDto.Email);
            if (emailExists)
                return BadRequest(new { message = "Email is already registered." });

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

            // Generate email verification token
            var verificationToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-").Replace("/", "_").Replace("=", "");

            newUser.EmailVerificationToken = verificationToken;
            newUser.EmailVerified = false;

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Send verification email
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var verifyLink = $"{frontendUrl}/verify-email?token={verificationToken}";

            _ = Task.Run(async () =>
            {
                var emailBody = _emailService.BuildEmailVerificationEmail(newUser.FullName, verifyLink);
                await _emailService.SendEmailAsync(
                    newUser.Email,
                    newUser.FullName,
                    "📧 Verify Your Email - Local Services Marketplace",
                    emailBody
                );
            });

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
            var token = _jwtService.GenerateToken(newUser, false);

            return Ok(new AuthResponseDto
            {
                UserId = newUser.Id,
                FullName = newUser.FullName,
                Email = newUser.Email,
                Role = newUser.Role,
                Token = token
            });
        }

        // ============================================
        // POST: api/auth/login
        // ============================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);

            if (!isPasswordValid)
                return Unauthorized(new { message = "Invalid email or password." });

            // Generate JWT token (30 days if RememberMe, otherwise 24 hours)
            var token = _jwtService.GenerateToken(user, loginDto.RememberMe);

            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }

        // ============================================
        // POST: api/auth/google-login
        // Sign in or Register using Google OAuth 2.0
        // ============================================
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthDto dto)
        {
            var clientId = _configuration["GoogleAuth:ClientId"];
            if (string.IsNullOrEmpty(clientId))
                return BadRequest(new { message = "Google Auth is not configured on the server." });

            try
            {
                // 1. Validate the Google JWT Token cryptographically
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string>() { clientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);

                if (payload == null)
                    return BadRequest(new { message = "Invalid Google token." });

                // 2. Check if user already exists
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

                // 3. If user doesn't exist, create a new one (Auto-Registration)
                if (user == null)
                {
                    user = new User
                    {
                        FullName = payload.Name ?? "Google User",
                        Email = payload.Email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Random unguessable password
                        Role = string.IsNullOrEmpty(dto.Role) ? "customer" : dto.Role,
                        EmailVerified = payload.EmailVerified,
                        KycStatus = "unverified",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    // Notify Admins
                    var admins = await _context.Users.Where(u => u.Role == "admin").ToListAsync();
                    foreach (var admin in admins)
                    {
                        await _notificationService.SendNotificationAsync(
                            userId: admin.Id,
                            type: "user_registered",
                            title: "New Google User 👤",
                            message: $"{user.FullName} joined via Google",
                            link: "/admin/users"
                        );
                    }
                }

                // 4. Generate standard application JWT (valid for 30 days for convenience)
                var token = _jwtService.GenerateToken(user, true);

                return Ok(new AuthResponseDto
                {
                    UserId = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    Token = token
                });
            }
            catch (InvalidJwtException)
            {
                return BadRequest(new { message = "Google token validation failed or expired." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Google authentication failed.", error = ex.Message });
            }
        }

        // ============================================
        // GET: api/auth/me
        // ============================================
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(new
            {
                kycStatus = user.KycStatus,
                avatarUrl = user.AvatarUrl, // <-- ADD THIS
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role,
                phone = user.Phone,
                createdAt = user.CreatedAt
            });
        }







        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar([FromBody] SubmitKycDto dto)
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdClaim));
            if (user == null) return NotFound();

            user.AvatarUrl = dto.DocumentUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Avatar updated", avatarUrl = user.AvatarUrl });
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

            if (user == null)
                return Ok(new { message = "If an account exists with this email, you'll receive a password reset link shortly." });

            var tokenBytes = new byte[48];
            RandomNumberGenerator.Fill(tokenBytes);
            var rawToken = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
            var tokenHash = BCrypt.Net.BCrypt.HashPassword(rawToken);

            var existingTokens = await _context.PasswordResetTokens
                .Where(t => t.UserId == user.Id && !t.Used && t.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();
            foreach (var t in existingTokens) { t.Used = true; }

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

            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var resetLink = $"{frontendUrl}/reset-password?token={rawToken}";

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

            var validTokens = await _context.PasswordResetTokens
                .Include(t => t.User)
                .Where(t => !t.Used && t.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

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
                return BadRequest(new { message = "Invalid or expired reset token. Please request a new password reset." });

            matchingToken.User!.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            matchingToken.User.UpdatedAt = DateTime.UtcNow;
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
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            user.FullName = dto.FullName.Trim();
            user.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
            if (!string.IsNullOrEmpty(dto.AvatarUrl))
            {
                user.AvatarUrl = dto.AvatarUrl; // <-- ADD THIS
            }
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully",
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                role = user.Role,
                avatarUrl = user.AvatarUrl
            });
        }

        // ============================================
        // PUT: api/auth/change-password
        // ============================================
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully." });
        }

        // ============================================
        // POST: api/auth/submit-kyc
        // ============================================
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "provider")]
        [HttpPost("submit-kyc")]
        public async Task<IActionResult> SubmitKyc([FromBody] SubmitKycDto dto)
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdClaim));
            if (user == null) return NotFound();

            user.KycDocumentUrl = dto.DocumentUrl;
            user.KycStatus = "pending";
            user.KycSubmittedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "KYC document submitted successfully. Pending admin approval.", status = user.KycStatus });
        }

        // ============================================
        // DELETE: api/auth/account
        // ============================================
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpDelete("account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account deleted successfully." });
        }

        // ============================================
        // GET: api/auth/my-stats
        // ============================================
        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("my-stats")]
        public async Task<IActionResult> GetMyStats()
        {
            var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (user.Role == "provider")
            {
                var listings = await _context.Listings.Where(l => l.ProviderId == userId).ToListAsync();
                var receivedBookings = await _context.Bookings
                    .Include(b => b.Listing)
                    .Where(b => b.Listing!.ProviderId == userId)
                    .ToListAsync();

                var reviewsReceived = await _context.Reviews
                    .Where(r => r.ProviderId == userId)
                    .ToListAsync();

                return Ok(new
                {
                    role = "provider",
                    totalListings = listings.Count,
                    activeListings = listings.Count(l => l.IsActive),
                    pausedListings = listings.Count(l => !l.IsActive),
                    totalBookings = receivedBookings.Count,
                    pendingBookings = receivedBookings.Count(b => b.Status == "pending"),
                    completedBookings = receivedBookings.Count(b => b.Status == "completed"),
                    averageRating = reviewsReceived.Any() ? Math.Round(reviewsReceived.Average(r => r.Rating), 1) : 0.0,
                    totalReviews = reviewsReceived.Count
                });
            }
            else if (user.Role == "customer")
            {
                var bookings = await _context.Bookings.Where(b => b.CustomerId == userId).ToListAsync();
                var reviewsGiven = await _context.Reviews.Where(r => r.CustomerId == userId).ToListAsync();

                return Ok(new
                {
                    role = "customer",
                    totalBookings = bookings.Count,
                    pendingBookings = bookings.Count(b => b.Status == "pending"),
                    acceptedBookings = bookings.Count(b => b.Status == "accepted"),
                    completedBookings = bookings.Count(b => b.Status == "completed"),
                    rejectedBookings = bookings.Count(b => b.Status == "rejected"),
                    totalReviewsGiven = reviewsGiven.Count
                });
            }
            else
            {
                return Ok(new
                {
                    role = "admin",
                    totalUsers = await _context.Users.CountAsync(),
                    totalListings = await _context.Listings.CountAsync(),
                    totalBookings = await _context.Bookings.CountAsync(),
                    totalReviews = await _context.Reviews.CountAsync()
                });
            }
        }

        // ============================================
        // GET: api/auth/verify-email?token=xxx
        // ============================================
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest(new { message = "Verification token is required." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

            if (user == null)
                return BadRequest(new { message = "Invalid or expired verification token." });

            user.EmailVerified = true;
            user.EmailVerificationToken = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Email verified successfully! You can now use all features." });
        }
    }
}