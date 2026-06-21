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
                ? $"<p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Preferred Date:</strong> {preferredDate.Value:dddd, dd MMMM yyyy}</p>"
                : "";

            var phoneInfo = !string.IsNullOrEmpty(customerPhone)
                ? $"<p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Phone:</strong> +91 {customerPhone}</p>"
                : "";

            return BuildEmailWrapper(
                headerColor: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                headerIcon: "📩",
                headerTitle: "New Booking Request!",
                headerSubtitle: "You received a new inquiry on Local Services Marketplace",
                bodyContent: $@"
            <p style='color: #1e293b; font-size: 16px; margin: 0 0 20px;'>Hi <strong>{providerName}</strong>,</p>
            <p style='color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;'>
                Great news! A customer is interested in your service. Here are the details:
            </p>

            <div style='background: #f5f3ff; border-left: 4px solid #8b5cf6; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;'>
                <p style='color: #6d28d9; margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>SERVICE BOOKED</p>
                <p style='color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;'>{listingTitle}</p>
            </div>

            <div style='background: #fafafa; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin-bottom: 20px;'>
                <p style='color: #1e293b; margin: 0 0 12px; font-size: 14px; font-weight: 600;'>Customer Details</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Name:</strong> {customerName}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Email:</strong> <a href='mailto:{customerEmail}' style='color: #8b5cf6;'>{customerEmail}</a></p>
                {phoneInfo}
                {dateInfo}
            </div>

            <div style='background: #fffbeb; border: 1px solid #fde68a; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px;'>
                <p style='color: #92400e; margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>CUSTOMER MESSAGE</p>
                <p style='color: #1e293b; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-line;'>{message}</p>
            </div>",
                ctaText: "View Booking & Respond",
                ctaLink: "http://localhost:5173/dashboard/bookings",
                footerNote: "Respond quickly to maintain your fast-response badge! ⚡"
            );
        }

        public string BuildCustomerConfirmationEmail(string customerName, string providerName, string listingTitle,
       decimal price, string location, string message, DateTime? preferredDate)
        {
            var dateInfo = preferredDate.HasValue
                ? $"<p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Preferred Date:</strong> {preferredDate.Value:dddd, dd MMMM yyyy}</p>"
                : "";

            return BuildEmailWrapper(
                headerColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                headerIcon: "✓",
                headerTitle: "Booking Submitted!",
                headerSubtitle: "Your service request has been sent successfully",
                bodyContent: $@"
            <p style='color: #1e293b; font-size: 16px; margin: 0 0 20px;'>Hi <strong>{customerName}</strong>,</p>
            <p style='color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;'>
                Thank you for booking through Local Services Marketplace! Your request has been sent to the service provider.
            </p>

            <div style='background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 12px; margin-bottom: 20px;'>
                <p style='color: #047857; margin: 0 0 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>BOOKING DETAILS</p>
                <p style='color: #1e293b; margin: 4px 0; font-size: 16px; font-weight: 600;'>{listingTitle}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Provider:</strong> {providerName}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Starting Price:</strong> ₹{price}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Location:</strong> {location}</p>
                {dateInfo}
            </div>

            <div style='background: #fafafa; border: 1px solid #e5e7eb; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px;'>
                <p style='color: #64748b; margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>YOUR MESSAGE</p>
                <p style='color: #1e293b; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-line;'>{message}</p>
            </div>

            <div style='background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;'>
                <p style='color: #1e40af; margin: 0 0 8px; font-size: 14px; font-weight: 600;'>What happens next?</p>
                <p style='color: #1e3a8a; margin: 0; font-size: 13px; line-height: 1.6;'>
                    The provider will review your request and respond within 24 hours. You'll receive an email update when they respond.
                </p>
            </div>",
                ctaText: "View My Bookings",
                ctaLink: "http://localhost:5173/dashboard/bookings",
                footerNote: null
            );
        }

        public string BuildPasswordResetEmail(string userName, string resetLink)
        {
            return BuildEmailWrapper(
                headerColor: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                headerIcon: "🔐",
                headerTitle: "Reset Your Password",
                headerSubtitle: "We received a request to reset your password",
                bodyContent: $@"
            <p style='color: #1e293b; font-size: 16px; margin: 0 0 20px;'>Hi <strong>{userName}</strong>,</p>
            <p style='color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;'>
                Someone (hopefully you!) requested a password reset for your Local Services Marketplace account.
                Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
            </p>

            <div style='background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 24px 0;'>
                <p style='color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;'>
                    <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
            </div>

            <p style='color: #64748b; font-size: 12px; line-height: 1.6; margin: 24px 0 8px;'>
                If the button above doesn't work, copy and paste this link into your browser:
            </p>
            <p style='color: #8b5cf6; font-size: 12px; word-break: break-all;'>
                {resetLink}
            </p>",
                ctaText: "Reset Password",
                ctaLink: resetLink,
                footerNote: null
            );
        }





        public string BuildStatusUpdateEmail(string customerName, string providerName, string listingTitle, string newStatus)
        {
            var statusColor = newStatus switch
            {
                "accepted" => "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                "rejected" => "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                "completed" => "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                _ => "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
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
                "accepted" => "Great news! Your booking has been accepted by the provider.",
                "rejected" => "Unfortunately, the provider could not accept your booking at this time. Don't worry — there are many other providers available!",
                "completed" => "Your service has been completed. We hope you had a great experience! Don't forget to leave a review.",
                _ => "Your booking status has been updated."
            };

            var capitalizedStatus = char.ToUpper(newStatus[0]) + newStatus.Substring(1);

            return BuildEmailWrapper(
                headerColor: statusColor,
                headerIcon: statusIcon,
                headerTitle: $"Booking {capitalizedStatus}",
                headerSubtitle: "Your booking status has been updated",
                bodyContent: $@"
            <p style='color: #1e293b; font-size: 16px; margin: 0 0 20px;'>Hi <strong>{customerName}</strong>,</p>
            <p style='color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;'>{statusMessage}</p>
            
            <div style='background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px 20px; border-radius: 12px; margin: 20px 0;'>
                <p style='color: #1e293b; margin: 4px 0; font-size: 14px;'><strong>Service:</strong> {listingTitle}</p>
                <p style='color: #475569; margin: 4px 0; font-size: 14px;'><strong>Provider:</strong> {providerName}</p>
            </div>",
                ctaText: "View Booking",
                ctaLink: "http://localhost:5173/dashboard/bookings",
                footerNote: newStatus == "completed" ? "Share your experience by leaving a review! ⭐" : null
            );
        }



        // ============================================
        // SHARED EMAIL WRAPPER (Branded Template)
        // ============================================
        private string BuildEmailWrapper(string headerColor, string headerIcon, string headerTitle,
            string headerSubtitle, string bodyContent, string ctaText, string ctaLink, string? footerNote)
        {
            var ctaButton = !string.IsNullOrEmpty(ctaText) && !string.IsNullOrEmpty(ctaLink)
                ? $@"
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{ctaLink}' 
                   style='display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);'>
                    {ctaText} →
                </a>
            </div>"
                : "";

            var footerNoteHtml = !string.IsNullOrEmpty(footerNote)
                ? $@"<p style='color: #64748b; font-size: 12px; line-height: 1.6; text-align: center; margin: 24px 0 0;'>{footerNote}</p>"
                : "";

            return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Local Services Marketplace</title>
</head>
<body style='margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9;'>
    
    <!-- Email Wrapper -->
    <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background: #f1f5f9; padding: 30px 16px;'>
        <tr>
            <td align='center'>
                
                <!-- Logo Header (Outside main card) -->
                <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width: 600px; margin: 0 auto 20px;'>
                    <tr>
                        <td align='center' style='padding: 0 0 16px;'>
                            <table role='presentation' cellpadding='0' cellspacing='0'>
                                <tr>
                                    <td style='vertical-align: middle; padding-right: 10px;'>
                                        <div style='width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; text-align: center; line-height: 40px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);'>
                                            <span style='font-size: 22px; color: white;'>✨</span>
                                        </div>
                                    </td>
                                    <td style='vertical-align: middle;'>
                                        <span style='color: #1e293b; font-size: 18px; font-weight: 700;'>LocalServices</span>
                                        <span style='color: #64748b; font-size: 12px; display: block; margin-top: -2px;'>Marketplace</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Main Email Card -->
                <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);'>
                    
                    <!-- Colored Header -->
                    <tr>
                        <td style='background: {headerColor}; padding: 40px 30px; text-align: center;'>
                            <div style='display: inline-block; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 16px; line-height: 60px; font-size: 32px; backdrop-filter: blur(10px);'>{headerIcon}</div>
                            <h1 style='color: #ffffff; margin: 16px 0 8px; font-size: 24px; font-weight: 700;'>{headerTitle}</h1>
                            <p style='color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;'>{headerSubtitle}</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style='padding: 30px;'>
                            {bodyContent}
                            {ctaButton}
                            {footerNoteHtml}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style='background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;'>
                            
                            <!-- Brand -->
                            <div style='margin-bottom: 16px;'>
                                <div style='display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px; text-align: center; line-height: 32px; margin-bottom: 8px;'>
                                    <span style='font-size: 16px; color: white;'>✨</span>
                                </div>
                                <p style='color: #1e293b; font-size: 14px; font-weight: 600; margin: 0;'>Local Services Marketplace</p>
                                <p style='color: #64748b; font-size: 12px; margin: 4px 0 0;'>Your trusted local services partner</p>
                            </div>

                            <!-- Quick Links -->
                            <div style='margin: 20px 0;'>
                                <a href='http://localhost:5173/dashboard' style='color: #8b5cf6; font-size: 12px; text-decoration: none; margin: 0 8px;'>Dashboard</a>
                                <span style='color: #cbd5e1;'>•</span>
                                <a href='http://localhost:5173/dashboard/browse' style='color: #8b5cf6; font-size: 12px; text-decoration: none; margin: 0 8px;'>Browse Services</a>
                                <span style='color: #cbd5e1;'>•</span>
                                <a href='http://localhost:5173/dashboard/settings' style='color: #8b5cf6; font-size: 12px; text-decoration: none; margin: 0 8px;'>Settings</a>
                            </div>

                            <!-- Address & Copyright -->
                            <p style='color: #94a3b8; font-size: 11px; margin: 16px 0 4px;'>
                                © 2026 Local Services Marketplace. All rights reserved.
                            </p>
                            <p style='color: #94a3b8; font-size: 11px; margin: 0;'>
                                Made with 💜 in India
                            </p>
                            
                            <!-- Unsubscribe -->
                            <p style='color: #cbd5e1; font-size: 11px; margin: 16px 0 0;'>
                                You're receiving this email because you have an account on Local Services Marketplace.<br>
                                <a href='http://localhost:5173/dashboard/settings' style='color: #94a3b8; text-decoration: underline;'>Manage email preferences</a>
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>";
        }
    }

}