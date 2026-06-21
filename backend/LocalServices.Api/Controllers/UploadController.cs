using LocalServices.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly CloudinaryService _cloudinaryService;

        public UploadController(CloudinaryService cloudinaryService)
        {
            _cloudinaryService = cloudinaryService;
        }

        // POST: api/upload/image
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            try
            {
                var imageUrl = await _cloudinaryService.UploadImageAsync(file, "local-services/listings");
                return Ok(new { url = imageUrl });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Upload failed", error = ex.Message });
            }
        }

        // POST: api/upload/multiple
        [HttpPost("multiple")]
        public async Task<IActionResult> UploadMultiple(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest(new { message = "No files uploaded" });

            if (files.Count > 5)
                return BadRequest(new { message = "Maximum 5 images allowed per upload" });

            var urls = new List<string>();
            var errors = new List<string>();

            foreach (var file in files)
            {
                try
                {
                    var url = await _cloudinaryService.UploadImageAsync(file, "local-services/listings");
                    urls.Add(url);
                }
                catch (Exception ex)
                {
                    errors.Add($"{file.FileName}: {ex.Message}");
                }
            }

            return Ok(new { urls, errors });
        }
    }
}