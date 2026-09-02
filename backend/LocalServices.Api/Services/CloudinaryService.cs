using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace LocalServices.Api.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryService> _logger;

        public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
        {
            _logger = logger;

            var cloudName = configuration["Cloudinary:CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"];

            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                _logger.LogWarning("Cloudinary credentials are not fully configured.");
                var fallbackAccount = new Account("demo", "demo", "demo");
                _cloudinary = new Cloudinary(fallbackAccount);
                return;
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder = "local-services")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Uploaded file is empty");

            if (file.Length > 10 * 1024 * 1024)
                throw new ArgumentException("File size exceeds 10 MB limit.");

            // Use MemoryStream to avoid locked stream pointers
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, memoryStream),
                Folder = folder,
                Transformation = new Transformation()
                    .Width(1200)
                    .Height(800)
                    .Crop("limit")
                    .Quality("auto")
                    .FetchFormat("auto"),
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
            {
                _logger.LogError("Cloudinary Error: {Message}", result.Error.Message);
                throw new Exception($"Cloudinary upload failed: {result.Error.Message}");
            }

            return result.SecureUrl?.ToString() ?? result.Url?.ToString() ?? string.Empty;
        }
    }
}