namespace LocalServices.Api.DTOs
{
    public class ProviderProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public DateTime MemberSince { get; set; }

        // Aggregated Stats
        public int TotalActiveListings { get; set; }
        public int TotalJobsCompleted { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public string KycStatus { get; set; } = string.Empty;


        public class ProviderEarningsDto
        {
            public decimal TotalRevenue { get; set; }
            public decimal PlatformFees { get; set; }
            public decimal NetEarnings { get; set; }
            public List<TransactionDto> RecentTransactions { get; set; } = new();
        }

        public class TransactionDto
        {
            public int BookingId { get; set; }
            public string ServiceName { get; set; } = string.Empty;
            public string CustomerName { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public decimal Fee { get; set; }
            public decimal Net { get; set; }
            public DateTime CompletedAt { get; set; }
        }



    }
}