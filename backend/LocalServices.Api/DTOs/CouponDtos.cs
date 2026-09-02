using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class CreateCouponDto
    {
        [Required(ErrorMessage = "Coupon code is required")]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(flat|percent)$", ErrorMessage = "DiscountType must be 'flat' or 'percent'")]
        public string DiscountType { get; set; } = "flat";

        [Required]
        [Range(0.01, 100000, ErrorMessage = "Discount value must be greater than 0")]
        public decimal DiscountValue { get; set; }

        public decimal MinBookingAmount { get; set; } = 0;
        public decimal? MaxDiscountAmount { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class ApplyCouponDto
    {
        [Required(ErrorMessage = "Coupon code is required")]
        public string Code { get; set; } = string.Empty;

        [Required]
        public decimal BookingAmount { get; set; }
    }

    public class ApplyCouponResponseDto
    {
        public bool IsValid { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
    }
}