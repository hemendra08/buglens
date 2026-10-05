using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BugLens.Api.Models
{
    public class Comment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public required string Body { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Keys
        [Required]
        public Guid BugId { get; set; }

        [Required]
        public Guid AuthorId { get; set; }

        // Navigation
        [ForeignKey(nameof(BugId))]
        public Bug? Bug { get; set; }

        [ForeignKey(nameof(AuthorId))]
        public User? Author { get; set; }
    }
}
