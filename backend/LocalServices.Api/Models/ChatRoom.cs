using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LocalServices.Api.Models
{
    [Table("chat_rooms")]
    public class ChatRoom
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Required]
        [Column("provider_id")]
        public int ProviderId { get; set; }

        [Column("listing_id")]
        public int? ListingId { get; set; }

        [Column("last_message")]
        public string? LastMessage { get; set; }

        [Column("last_message_at")]
        public DateTime? LastMessageAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CustomerId")]
        public User? Customer { get; set; }

        [ForeignKey("ProviderId")]
        public User? Provider { get; set; }

        [ForeignKey("ListingId")]
        public Listing? Listing { get; set; }

        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}