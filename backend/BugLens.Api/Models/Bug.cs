using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BugLens.Api.Models
{
    public class Bug
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public required string Title { get; set; }

        [Required]
        public required string Description { get; set; }

        public BugStatus Status { get; set; } = BugStatus.Open;

        public BugPriority Priority { get; set; } = BugPriority.Medium;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Foreign Keys
        [Required]
        public Guid CreatedById { get; set; }

        public Guid? AssignedToId { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(CreatedById))]
        public User? CreatedBy { get; set; }

        [ForeignKey(nameof(AssignedToId))]
        public User? AssignedTo { get; set; }
    }
}
