using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class CreateOrderRequestDto
    {
        [Required]
        public int BookingId { get; set; }
    }

    public class CreateOrderResponseDto
    {
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string KeyId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public string ListingTitle { get; set; } = string.Empty;
    }

    public class VerifyPaymentDto
    {
        [Required]
        public int BookingId { get; set; }

        [Required]
        public string RazorpayOrderId { get; set; } = string.Empty;

        [Required]
        public string RazorpayPaymentId { get; set; } = string.Empty;

        [Required]
        public string RazorpaySignature { get; set; } = string.Empty;
    }
}