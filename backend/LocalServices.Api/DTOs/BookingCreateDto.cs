using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class BookingCreateDto
    {
        [Required(ErrorMessage = "Listing ID is required")]
        public int ListingId { get; set; }

        [Required(ErrorMessage = "Message is required")]
        [MinLength(10, ErrorMessage = "Message must be at least 10 characters")]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public DateTime? PreferredDate { get; set; }
    }
}