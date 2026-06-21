using System.ComponentModel.DataAnnotations;

namespace LocalServices.Api.DTOs
{
    public class ListingCreateDto
    {
        [Required(ErrorMessage = "Category is required")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [MaxLength(150, ErrorMessage = "Title cannot exceed 150 characters")]
        [MinLength(5, ErrorMessage = "Title must be at least 5 characters")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        [MinLength(20, ErrorMessage = "Description must be at least 20 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price is required")]
        [Range(0, 1000000, ErrorMessage = "Price must be between 0 and 10,00,000")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Location is required")]
        [MaxLength(150)]
        public string Location { get; set; } = string.Empty;


        public List<string>? ImageUrls { get; set; }
    }
}