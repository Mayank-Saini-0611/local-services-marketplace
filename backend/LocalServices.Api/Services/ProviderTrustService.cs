using LocalServices.Api.Data;
using LocalServices.Api.DTOs;
using LocalServices.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LocalServices.Api.Services
{
    /// <summary>
    /// Builds the public trust summary for providers from verifiable account data.
    /// Manual checks (phone, background, and business) are controlled by admins;
    /// activity badges are calculated from completed work and published reviews.
    /// </summary>
    public class ProviderTrustService
    {
        private readonly AppDbContext _context;

        public ProviderTrustService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProviderVerificationDto> GetForProviderAsync(int providerId)
        {
            var results = await GetForProvidersAsync(new[] { providerId });
            return results.TryGetValue(providerId, out var verification)
                ? verification
                : new ProviderVerificationDto();
        }

        public async Task<Dictionary<int, ProviderVerificationDto>> GetForProvidersAsync(IEnumerable<int> providerIds)
        {
            var ids = providerIds.Distinct().ToList();
            if (ids.Count == 0)
                return new Dictionary<int, ProviderVerificationDto>();

            var providers = await _context.Users
                .AsNoTracking()
                .Where(u => ids.Contains(u.Id) && u.Role == "provider")
                .ToDictionaryAsync(u => u.Id);

            var bookingStatuses = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.Listing != null && ids.Contains(b.Listing.ProviderId))
                .Select(b => new { ProviderId = b.Listing!.ProviderId, b.Status })
                .ToListAsync();

            // Hidden reviews must never affect public trust badges or ratings.
            var ratings = await _context.Reviews
                .AsNoTracking()
                .Where(r => ids.Contains(r.ProviderId) && r.ModerationStatus == "published")
                .Select(r => new { r.ProviderId, r.Rating })
                .ToListAsync();

            var result = new Dictionary<int, ProviderVerificationDto>();
            foreach (var provider in providers.Values)
            {
                var statuses = bookingStatuses
                    .Where(b => b.ProviderId == provider.Id)
                    .Select(b => b.Status)
                    .ToList();
                var providerRatings = ratings
                    .Where(r => r.ProviderId == provider.Id)
                    .Select(r => r.Rating)
                    .ToList();

                result[provider.Id] = Build(provider, statuses, providerRatings);
            }

            return result;
        }

        private static ProviderVerificationDto Build(
            User provider,
            IReadOnlyCollection<string> bookingStatuses,
            IReadOnlyCollection<int> ratings)
        {
            var completedJobs = bookingStatuses.Count(status => status == "completed");
            var totalReviews = ratings.Count;
            var averageRating = totalReviews == 0 ? 0 : Math.Round(ratings.Average(), 1);
            var identityVerified = string.Equals(provider.KycStatus, "verified", StringComparison.OrdinalIgnoreCase);
            var topRated = totalReviews >= 3 && averageRating >= 4.5;
            var reliable = bookingStatuses.Count >= 3 &&
                           completedJobs >= 3 &&
                           (double)completedJobs / bookingStatuses.Count >= 0.8;

            var verification = new ProviderVerificationDto
            {
                // The existing blue verified behavior is retained: approved identity is the core badge.
                IsVerified = identityVerified,
                EmailVerified = provider.EmailVerified,
                PhoneVerified = provider.PhoneVerified,
                IdentityVerified = identityVerified,
                BackgroundChecked = provider.BackgroundChecked,
                BusinessVerified = provider.BusinessVerified,
                TopRated = topRated,
                Reliable = reliable,
                CompletedJobs = completedJobs,
                TotalReviews = totalReviews,
                AverageRating = averageRating
            };

            if (verification.EmailVerified) verification.Badges.Add("email_verified");
            if (verification.PhoneVerified) verification.Badges.Add("phone_verified");
            if (verification.IdentityVerified) verification.Badges.Add("identity_verified");
            if (verification.BackgroundChecked) verification.Badges.Add("background_checked");
            if (verification.BusinessVerified) verification.Badges.Add("business_verified");
            if (verification.TopRated) verification.Badges.Add("top_rated");
            if (verification.Reliable) verification.Badges.Add("reliable");

            return verification;
        }
    }
}
