using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class BookingUpdateDto
    {
        [Required]
        [RegularExpression("^(pending|accepted|rejected|completed)$",
            ErrorMessage = "Status must be: pending, accepted, rejected, or completed")]
        public string Status { get; set; } = "pending";
    }
}