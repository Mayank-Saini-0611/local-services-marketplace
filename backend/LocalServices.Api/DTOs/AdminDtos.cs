namespace LocalServices.Api.DTOs
{
    public class DashboardStatsDto
    {
        // User stats
        public int TotalUsers { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalProviders { get; set; }
        public int TotalAdmins { get; set; }
        public int NewUsersThisWeek { get; set; }

        // Listing stats
        public int TotalListings { get; set; }
        public int ActiveListings { get; set; }
        public int InactiveListings { get; set; }
        public int NewListingsThisWeek { get; set; }

        // Booking stats
        public int TotalBookings { get; set; }
        public int PendingBookings { get; set; }
        public int AcceptedBookings { get; set; }
        public int RejectedBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int NewBookingsToday { get; set; }

        // Category stats
        public int TotalCategories { get; set; }

        // Revenue (simulated - sum of completed booking listing prices)
        public decimal TotalRevenue { get; set; }
    }

    public class AdminUserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TotalListings { get; set; }
        public int TotalBookings { get; set; }
    }

    public class UpdateUserRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }

    public class GrowthDataDto
    {
        public List<ChartDataPoint> UsersGrowth { get; set; } = new();
        public List<ChartDataPoint> BookingsGrowth { get; set; } = new();
        public List<CategoryStats> CategoryDistribution { get; set; } = new();
    }

    public class ChartDataPoint
    {
        public string Label { get; set; } = string.Empty;
        public int Value { get; set; }
    }

    public class CategoryStats
    {
        public string CategoryName { get; set; } = string.Empty;
        public int ListingsCount { get; set; }
        public int BookingsCount { get; set; }
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } = string.Empty; // "user_registered", "listing_created", "booking_created"
        public string Description { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}