using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Hubs;
using LocalServices.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ChatHub> _chatHub;

        public ChatController(AppDbContext context, IHubContext<ChatHub> chatHub)
        {
            _context = context;
            _chatHub = chatHub;
        }

        // ============================================
        // GET: api/chat/rooms
        // ============================================
        [HttpGet("rooms")]
        public async Task<IActionResult> GetMyRooms()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var rooms = await _context.ChatRooms
                .Include(r => r.Customer)
                .Include(r => r.Provider)
                .Include(r => r.Listing)
                .Where(r => r.CustomerId == userId.Value || r.ProviderId == userId.Value)
                .OrderByDescending(r => r.LastMessageAt ?? r.CreatedAt)
                .ToListAsync();

            var dtos = new List<ChatRoomDto>();
            foreach (var room in rooms)
            {
                var isCustomer = room.CustomerId == userId.Value;
                var other = isCustomer ? room.Provider! : room.Customer!;
                var unread = await _context.ChatMessages
                    .CountAsync(m => m.RoomId == room.Id && m.SenderId != userId.Value && !m.IsRead);

                dtos.Add(new ChatRoomDto
                {
                    Id = room.Id,
                    OtherUserId = other.Id,
                    OtherUserName = other.FullName,
                    OtherUserEmail = other.Email,
                    OtherUserPhone = other.Phone,
                    OtherUserRole = other.Role,
                    ListingId = room.ListingId,
                    ListingTitle = room.Listing?.Title,
                    LastMessage = room.LastMessage,
                    LastMessageAt = room.LastMessageAt,
                    UnreadCount = unread,
                    CreatedAt = room.CreatedAt
                });
            }

            return Ok(dtos);
        }

        // ============================================
        // POST: api/chat/rooms
        // Get or create a chat room
        // ============================================
        [HttpPost("rooms")]
        public async Task<IActionResult> GetOrCreateRoom([FromBody] CreateChatRoomDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var me = await _context.Users.FindAsync(userId.Value);
            var other = await _context.Users.FindAsync(dto.OtherUserId);
            if (me == null || other == null)
                return NotFound(new { message = "User not found" });

            if (me.Id == other.Id)
                return BadRequest(new { message = "Cannot chat with yourself" });

            // Determine who is customer and who is provider
            int customerId, providerId;
            if (me.Role == "customer" && other.Role == "provider")
            {
                customerId = me.Id; providerId = other.Id;
            }
            else if (me.Role == "provider" && other.Role == "customer")
            {
                customerId = other.Id; providerId = me.Id;
            }
            else
            {
                // Fallback: treat me as customer
                customerId = me.Id; providerId = other.Id;
            }

            var existing = await _context.ChatRooms
                .FirstOrDefaultAsync(r =>
                    r.CustomerId == customerId &&
                    r.ProviderId == providerId &&
                    r.ListingId == dto.ListingId);

            if (existing != null)
                return Ok(new { roomId = existing.Id, isNew = false });

            var room = new ChatRoom
            {
                CustomerId = customerId,
                ProviderId = providerId,
                ListingId = dto.ListingId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.ChatRooms.Add(room);
            await _context.SaveChangesAsync();

            return Ok(new { roomId = room.Id, isNew = true });
        }

        // ============================================
        // GET: api/chat/rooms/{roomId}/messages
        // ============================================
        [HttpGet("rooms/{roomId}/messages")]
        public async Task<IActionResult> GetMessages(int roomId)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var room = await _context.ChatRooms.FindAsync(roomId);
            if (room == null) return NotFound();
            if (room.CustomerId != userId.Value && room.ProviderId != userId.Value)
                return Forbid();

            // Mark unread messages as read
            var unread = await _context.ChatMessages
                .Where(m => m.RoomId == roomId && m.SenderId != userId.Value && !m.IsRead)
                .ToListAsync();
            foreach (var m in unread) m.IsRead = true;
            if (unread.Any()) await _context.SaveChangesAsync();

            var messages = await _context.ChatMessages
                .Include(m => m.Sender)
                .Where(m => m.RoomId == roomId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    RoomId = m.RoomId,
                    SenderId = m.SenderId,
                    SenderName = m.Sender!.FullName,
                    Content = m.Content,
                    IsRead = m.IsRead,
                    CreatedAt = m.CreatedAt,
                    IsMine = m.SenderId == userId.Value
                })
                .ToListAsync();

            return Ok(messages);
        }

        // ============================================
        // POST: api/chat/messages
        // Send a new message
        // ============================================
        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var room = await _context.ChatRooms.FindAsync(dto.RoomId);
            if (room == null) return NotFound(new { message = "Room not found" });
            if (room.CustomerId != userId.Value && room.ProviderId != userId.Value)
                return Forbid();

            var me = await _context.Users.FindAsync(userId.Value);

            var message = new ChatMessage
            {
                RoomId = dto.RoomId,
                SenderId = userId.Value,
                Content = dto.Content.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.ChatMessages.Add(message);

            // Update room's last message
            room.LastMessage = message.Content.Length > 100 ? message.Content.Substring(0, 100) : message.Content;
            room.LastMessageAt = message.CreatedAt;
            room.UpdatedAt = message.CreatedAt;

            await _context.SaveChangesAsync();

            var messageDto = new ChatMessageDto
            {
                Id = message.Id,
                RoomId = message.RoomId,
                SenderId = message.SenderId,
                SenderName = me!.FullName,
                Content = message.Content,
                IsRead = false,
                CreatedAt = message.CreatedAt,
                IsMine = false
            };

            // Send real-time to other user
            var otherUserId = room.CustomerId == userId.Value ? room.ProviderId : room.CustomerId;
            await _chatHub.Clients.Group($"chat_user_{otherUserId}")
                .SendAsync("ReceiveMessage", messageDto);

            // Also send back to sender (for multi-tab sync)
            messageDto.IsMine = true;
            await _chatHub.Clients.Group($"chat_user_{userId.Value}")
                .SendAsync("ReceiveMessage", messageDto);

            return Ok(messageDto);
        }

        // ============================================
        // GET: api/chat/unread-count
        // ============================================
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var count = await _context.ChatMessages
                .Include(m => m.Room)
                .CountAsync(m =>
                    m.SenderId != userId.Value &&
                    !m.IsRead &&
                    (m.Room!.CustomerId == userId.Value || m.Room.ProviderId == userId.Value));

            return Ok(new { count });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return null;
            return int.TryParse(userIdClaim, out int userId) ? userId : null;
        }
    }
}