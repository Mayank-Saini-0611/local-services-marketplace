using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LocalServices.Api.Models
{
    [Table("coupons")]
    public class Coupon
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("code")]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("discount_type")]
        public string DiscountType { get; set; } = "flat"; // "flat" or "percent"

        [Required]
        [Column("discount_value", TypeName = "decimal(10,2)")]
        public decimal DiscountValue { get; set; }

        [Column("min_booking_amount", TypeName = "decimal(10,2)")]
        public decimal MinBookingAmount { get; set; } = 0;

        [Column("max_discount_amount", TypeName = "decimal(10,2)")]
        public decimal? MaxDiscountAmount { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("expiry_date")]
        public DateTime? ExpiryDate { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}