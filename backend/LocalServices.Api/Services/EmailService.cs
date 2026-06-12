using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace LocalServices.Api.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");
                var senderEmail = emailSettings["SenderEmail"];
                var senderPassword = emailSettings["SenderPassword"];
                var senderName = emailSettings["SenderName"];
                var smtpServer = emailSettings["SmtpServer"];
                var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");

                if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderPassword))
                {
                    _logger.LogWarning("Email settings not configured. Skipping email to {Email}", toEmail);
                    return;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName, senderEmail));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;

                message.Body = new TextPart("html")
                {
                    Text = htmlBody
                };

                using var client = new SmtpClient();
                await client.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, senderPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                // Don't throw — we don't want email failure to break the booking
            }
        }

        // ============================================
        // EMAIL TEMPLATES
        // ============================================

        public string BuildNewBookingEmail(string providerName, string customerName, string customerEmail,
            string customerPhone, string listingTitle, string message, DateTime? preferredDate)
        {
            var dateInfo = preferredDate.HasValue
                ? $"<p><strong>Preferred Date:</strong> {preferredDate.Value:dddd, dd MMMM yyyy}</p>"
                : "";

            var phoneInfo = !string.IsNullOrEmpty(customerPhone)
                ? $"<p><strong>Phone:</strong> +91 {customerPhone}</p>"
                : "";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>New Booking Request</title>
</head>
<body style='margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f5f5f5;'>
    <div style='max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);'>
        
        <!-- Header -->
        <div style='background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;'>
            <div style='display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; line-height: 60px; font-size: 32px;'>📩</div>
            <h1 style='color: #ffffff; margin: 16px 0 8px; font-size: 24px;'>New Booking Request!</h1>
            <p style='color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;'>You received a new inquiry on Local Services Marketplace</p>
        </div>

        <!-- Body -->
        <div style='padding: 30px;'>
            <p style='color: #1e293b; font-size: 16px; margin: 0 0 20px;'>Hi <strong>{providerName}</strong>,</p>
            <p style='color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;'>
                Great news! A customer is interested in your service. Here are the details:
            </p>

            <!-- Service Info -->
            <div style='background: #f5f3ff; border-left: 4px solid #8b5cf6; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;'>
                <p style='color: #6d28d9; margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>SERVICE BOOKED</p>
                <p style='color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;'>{listingTitle}</p>
            </div>

            <!-- Customer Info -->
            <div style='background: #fafafa; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin-bottom: 20px;'>
                <p style='color: #1e293b; margin: 0 0 12px; font-size: 14px; font-weight: 600;'>Customer Details</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Name:</strong> {customerName}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Email:</strong> <a href='mailto:{customerEmail}' style='color: #8b5cf6;'>{customerEmail}</a></p>
                {phoneInfo}
                {dateInfo}
            </div>

            <!-- Message -->
            <div style='background: #fffbeb; border: 1px solid #fde68a; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px;'>
                <p style='color: #92400e; margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>CUSTOMER MESSAGE</p>
                <p style='color: #1e293b; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-line;'>{message}</p>
            </div>

            <!-- CTA -->
            <div style='text-align: center; margin: 30px 0;'>
                <a href='http://localhost:5173/dashboard/bookings' 
                   style='display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px;'>
                    View Booking & Respond
                </a>
            </div>

            <p style='color: #64748b; font-size: 12px; line-height: 1.6; text-align: center; margin: 24px 0 0;'>
                Respond quickly to maintain your fast-response badge! ⚡
            </p>
        </div>

        <!-- Footer -->
        <div style='background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;'>
            <p style='color: #94a3b8; font-size: 12px; margin: 0;'>
                © 2026 Local Services Marketplace. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>";
        }

        public string BuildCustomerConfirmationEmail(string customerName, string providerName, string listingTitle,
            decimal price, string location, string message, DateTime? preferredDate)
        {
            var dateInfo = preferredDate.HasValue
                ? $"<p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Preferred Date:</strong> {preferredDate.Value:dddd, dd MMMM yyyy}</p>"
                : "";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Booking Confirmed</title>
</head>
<body style='margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f5f5f5;'>
    <div style='max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);'>
        
        <!-- Header -->
        <div style='background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;'>
            <div style='display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; line-height: 60px; font-size: 32px;'>✓</div>
            <h1 style='color: #ffffff; margin: 16px 0 8px; font-size: 24px;'>Booking Submitted!</h1>
            <p style='color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;'>Your service request has been sent successfully</p>
        </div>

        <!-- Body -->
        <div style='padding: 30px;'>
            <p style='color: #1e293b; font-size: 16px; margin: 0 0 20px;'>Hi <strong>{customerName}</strong>,</p>
            <p style='color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;'>
                Thank you for booking through Local Services Marketplace! Your request has been sent to the service provider.
            </p>

            <!-- Booking Details -->
            <div style='background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 12px; margin-bottom: 20px;'>
                <p style='color: #047857; margin: 0 0 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>BOOKING DETAILS</p>
                <p style='color: #1e293b; margin: 4px 0; font-size: 16px; font-weight: 600;'>{listingTitle}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Provider:</strong> {providerName}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Starting Price:</strong> ₹{price}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Location:</strong> {location}</p>
                {dateInfo}
            </div>

            <!-- Your Message -->
            <div style='background: #fafafa; border: 1px solid #e5e7eb; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px;'>
                <p style='color: #64748b; margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>YOUR MESSAGE</p>
                <p style='color: #1e293b; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-line;'>{message}</p>
            </div>

            <!-- What Next -->
            <div style='background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;'>
                <p style='color: #1e40af; margin: 0 0 8px; font-size: 14px; font-weight: 600;'>What happens next?</p>
                <p style='color: #1e3a8a; margin: 0; font-size: 13px; line-height: 1.6;'>
                    The provider will review your request and respond within 24 hours. You'll receive an email update when they respond.
                </p>
            </div>

            <!-- CTA -->
            <div style='text-align: center; margin: 30px 0;'>
                <a href='http://localhost:5173/dashboard/bookings' 
                   style='display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px;'>
                    View My Bookings
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style='background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;'>
            <p style='color: #94a3b8; font-size: 12px; margin: 0;'>
                © 2026 Local Services Marketplace. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>";
        }

        public string BuildPasswordResetEmail(string userName, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f5f5f5;'>
    <div style='max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);'>
        
        <div style='background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;'>
            <div style='display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; line-height: 60px; font-size: 32px;'>🔐</div>
            <h1 style='color: #ffffff; margin: 16px 0 8px; font-size: 24px;'>Reset Your Password</h1>
            <p style='color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;'>We received a request to reset your password</p>
        </div>

        <div style='padding: 30px;'>
            <p style='color: #1e293b; font-size: 16px; margin: 0 0 20px;'>Hi <strong>{userName}</strong>,</p>
            <p style='color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;'>
                Someone (hopefully you!) requested a password reset for your Local Services Marketplace account.
                Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
            </p>

            <div style='text-align: center; margin: 32px 0;'>
                <a href='{resetLink}' 
                   style='display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 15px;'>
                    Reset Password
                </a>
            </div>

            <div style='background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 24px 0;'>
                <p style='color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;'>
                    <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
            </div>

            <p style='color: #64748b; font-size: 12px; line-height: 1.6; margin: 24px 0 0;'>
                If the button above doesn't work, copy and paste this link into your browser:
            </p>
            <p style='color: #8b5cf6; font-size: 12px; word-break: break-all; margin: 8px 0 0;'>
                {resetLink}
            </p>
        </div>

        <div style='background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;'>
            <p style='color: #94a3b8; font-size: 12px; margin: 0;'>
                © 2026 Local Services Marketplace. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>";
        }






        public string BuildStatusUpdateEmail(string customerName, string providerName, string listingTitle, string newStatus)
        {
            var statusColor = newStatus switch
            {
                "accepted" => "#10b981",
                "rejected" => "#ef4444",
                "completed" => "#3b82f6",
                _ => "#8b5cf6"
            };

            var statusIcon = newStatus switch
            {
                "accepted" => "✓",
                "rejected" => "✗",
                "completed" => "🎉",
                _ => "📩"
            };

            var statusMessage = newStatus switch
            {
                "accepted" => "Great news! Your booking has been accepted.",
                "rejected" => "Unfortunately, the provider could not accept your booking at this time.",
                "completed" => "Your service has been completed. Hope you had a great experience!",
                _ => "Your booking status has been updated."
            };

            return $@"
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'></head>
<body style='margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f5f5f5;'>
    <div style='max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);'>
        <div style='background: {statusColor}; padding: 40px 30px; text-align: center;'>
            <div style='display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; line-height: 60px; font-size: 32px;'>{statusIcon}</div>
            <h1 style='color: #ffffff; margin: 16px 0 8px; font-size: 24px; text-transform: capitalize;'>Booking {newStatus}</h1>
        </div>
        <div style='padding: 30px;'>
            <p style='color: #1e293b; font-size: 16px;'>Hi <strong>{customerName}</strong>,</p>
            <p style='color: #475569; font-size: 14px; line-height: 1.6;'>{statusMessage}</p>
            <div style='background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px 20px; border-radius: 12px; margin: 20px 0;'>
                <p style='color: #1e293b; margin: 4px 0; font-size: 14px;'><strong>Service:</strong> {listingTitle}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Provider:</strong> {providerName}</p>
            </div>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='http://localhost:5173/dashboard/bookings' style='display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px;'>View Booking</a>
            </div>
        </div>
        <div style='background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;'>
            <p style='color: #94a3b8; font-size: 12px; margin: 0;'>© 2026 Local Services Marketplace</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}