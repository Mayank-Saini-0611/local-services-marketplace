using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class GoogleAuthDto
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;

        // Passed from frontend during registration. If null, assumes 'customer'
        public string? Role { get; set; }
    }
}