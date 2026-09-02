using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class ProviderVerificationDto
    {
        public bool IsVerified { get; set; }
        public bool EmailVerified { get; set; }
        public bool PhoneVerified { get; set; }
        public bool IdentityVerified { get; set; }
        public bool BackgroundChecked { get; set; }
        public bool BusinessVerified { get; set; }
        public bool TopRated { get; set; }
        public bool Reliable { get; set; }
        public int CompletedJobs { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public List<string> Badges { get; set; } = new();
    }

    public class AdminUpdateVerificationDto
    {
        public bool PhoneVerified { get; set; }
        public bool BackgroundChecked { get; set; }
        public bool BusinessVerified { get; set; }
    }

    public class UserReportCreateDto
    {
        [Required]
        public int ReportedUserId { get; set; }

        public int? ListingId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [MinLength(10)]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;
    }

    public class UserReportResponseDto
    {
        public int Id { get; set; }
        public int ReporterId { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public int ReportedUserId { get; set; }
        public string ReportedUserName { get; set; } = string.Empty;
        public string ReportedUserRole { get; set; } = string.Empty;
        public int? ListingId { get; set; }
        public string? ListingTitle { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    public class UpdateReportStatusDto
    {
        [Required]
        [RegularExpression("^(open|under_review|resolved|rejected)$",
            ErrorMessage = "Status must be open, under_review, resolved, or rejected.")]
        public string Status { get; set; } = "open";
    }

    public class UserBlockResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class ReviewModerationUpdateDto
    {
        [Required]
        [RegularExpression("^(published|hidden)$",
            ErrorMessage = "Moderation status must be published or hidden.")]
        public string Status { get; set; } = "published";

        [MaxLength(500)]
        public string? Note { get; set; }
    }

    public class AdminReviewDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int ListingId { get; set; }
        public string ListingTitle { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int ProviderId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public string ModerationStatus { get; set; } = "published";
        public string? ModerationNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModeratedAt { get; set; }
    }
}
