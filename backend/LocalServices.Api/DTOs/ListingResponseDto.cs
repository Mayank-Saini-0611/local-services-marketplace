namespace LocalServices.Api.DTOs
{
    public class ListingResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Location { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Provider info (embedded)
        public int ProviderId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public string ProviderEmail { get; set; } = string.Empty;
        public string? ProviderPhone { get; set; }

        // Category info (embedded)
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;



        public List<string> ImageUrls { get; set; } = new List<string>();

        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
    }
}