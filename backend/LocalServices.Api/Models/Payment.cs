using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LocalServices.Api.Models
{
    [Table("payments")]
    public class Payment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("booking_id")]
        public int BookingId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("razorpay_order_id")]
        public string RazorpayOrderId { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("razorpay_payment_id")]
        public string? RazorpayPaymentId { get; set; }

        [MaxLength(255)]
        [Column("razorpay_signature")]
        public string? RazorpaySignature { get; set; }

        [Required]
        [Column("amount", TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [MaxLength(10)]
        [Column("currency")]
        public string Currency { get; set; } = "INR";

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "created";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("BookingId")]
        public Booking? Booking { get; set; }
    }
}