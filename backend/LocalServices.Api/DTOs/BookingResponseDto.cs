namespace LocalServices.Api.DTOs
{
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime? PreferredDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Listing info
        public int ListingId { get; set; }
        public string ListingTitle { get; set; } = string.Empty;
        public decimal ListingPrice { get; set; }
        public string ListingLocation { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;

        // Customer info (for providers viewing their bookings)
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }

        // Provider info (for customers viewing their bookings)
        public int ProviderId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public string ProviderEmail { get; set; } = string.Empty;
        public string? ProviderPhone { get; set; }
    }
}