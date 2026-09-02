using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LocalServices.Api.Models
{
    [Table("user_blocks")]
    public class UserBlock
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("blocker_id")]
        public int BlockerId { get; set; }

        [Column("blocked_user_id")]
        public int BlockedUserId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? Blocker { get; set; }
        public User? BlockedUser { get; set; }
    }
}
