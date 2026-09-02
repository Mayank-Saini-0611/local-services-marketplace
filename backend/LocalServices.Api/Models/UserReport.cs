using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LocalServices.Api.Models
{
    [Table("user_reports")]
    public class UserReport
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("reporter_id")]
        public int ReporterId { get; set; }

        [Column("reported_user_id")]
        public int ReportedUserId { get; set; }

        [Column("listing_id")]
        public int? ListingId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        [Column("status")]
        public string Status { get; set; } = "open";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("resolved_at")]
        public DateTime? ResolvedAt { get; set; }

        [Column("resolved_by_id")]
        public int? ResolvedById { get; set; }

        public User? Reporter { get; set; }
        public User? ReportedUser { get; set; }
        public Listing? Listing { get; set; }
    }
}
