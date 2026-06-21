using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class ListingUpdateDto
    {
        [Required(ErrorMessage = "Category is required")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [MaxLength(150)]
        [MinLength(5)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        [MinLength(20)]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price is required")]
        [Range(0, 1000000)]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Location is required")]
        [MaxLength(150)]
        public string Location { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;


        public List<string>? ImageUrls { get; set; }
    }
}