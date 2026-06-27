using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class CreateChatRoomDto
    {
        [Required]
        public int OtherUserId { get; set; }
        public int? ListingId { get; set; }
    }

    public class SendMessageDto
    {
        [Required]
        public int RoomId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }

    public class ChatRoomDto
    {
        public int Id { get; set; }
        public int OtherUserId { get; set; }
        public string OtherUserName { get; set; } = string.Empty;
        public string OtherUserEmail { get; set; } = string.Empty;
        public string? OtherUserPhone { get; set; }
        public string OtherUserRole { get; set; } = string.Empty;
        public int? ListingId { get; set; }
        public string? ListingTitle { get; set; }
        public string? LastMessage { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ChatMessageDto
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsMine { get; set; }
    }
}