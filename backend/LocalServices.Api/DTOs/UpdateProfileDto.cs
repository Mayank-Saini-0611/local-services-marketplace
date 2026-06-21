using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Full name is required")]
        [MaxLength(100)]
        [MinLength(3)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Current password is required")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "New password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string NewPassword { get; set; } = string.Empty;
    }
}