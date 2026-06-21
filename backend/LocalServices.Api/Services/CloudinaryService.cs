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
                throw new InvalidOperationException("Cloudinary credentials not configured");
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder = "local-services")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                throw new ArgumentException("Invalid file type. Only JPG, PNG, WEBP allowed.");

            // Validate file size (5 MB max)
            if (file.Length > 5 * 1024 * 1024)
                throw new ArgumentException("File too large. Max 5 MB.");

            using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
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
                _logger.LogError("Cloudinary upload error: {Error}", result.Error.Message);
                throw new Exception($"Upload failed: {result.Error.Message}");
            }

            return result.SecureUrl.ToString();
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                // Extract public_id from URL
                // URL format: https://res.cloudinary.com/{cloud}/image/upload/v123/folder/filename.jpg
                var uri = new Uri(imageUrl);
                var pathSegments = uri.AbsolutePath.Split('/');
                var uploadIndex = Array.IndexOf(pathSegments, "upload");
                if (uploadIndex < 0 || uploadIndex + 2 >= pathSegments.Length) return false;

                var publicIdWithExt = string.Join('/', pathSegments.Skip(uploadIndex + 2));
                var publicId = Path.ChangeExtension(publicIdWithExt, null);

                var deleteParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deleteParams);

                return result.Result == "ok";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete image: {Url}", imageUrl);
                return false;
            }
        }
    }
}