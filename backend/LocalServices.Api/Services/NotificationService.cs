using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Hubs;
using LocalServices.Api.Models;
using Microsoft.AspNetCore.SignalR;

namespace LocalServices.Api.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            AppDbContext context,
            IHubContext<NotificationHub> hubContext,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendNotificationAsync(
            int userId,
            string type,
            string title,
            string message,
            string? link = null)
        {
            try
            {
                // 1. Save to database
                var notification = new Notification
                {
                    UserId = userId,
                    Type = type,
                    Title = title,
                    Message = message,
                    Link = link,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                // 2. Send real-time notification via SignalR
                var dto = new NotificationDto
                {
                    Id = notification.Id,
                    Type = notification.Type,
                    Title = notification.Title,
                    Message = notification.Message,
                    Link = notification.Link,
                    IsRead = notification.IsRead,
                    CreatedAt = notification.CreatedAt
                };

                await _hubContext.Clients.Group($"user_{userId}")
                    .SendAsync("ReceiveNotification", dto);

                _logger.LogInformation("Notification sent to user {UserId}: {Title}", userId, title);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
                // Don't throw — notification failure shouldn't break the main flow
            }
        }
    }
}