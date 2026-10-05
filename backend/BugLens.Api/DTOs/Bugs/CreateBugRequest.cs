using BugLens.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace BugLens.Api.DTOs.Bugs
{
    public class CreateBugRequest
    {
        [Required]
        [MaxLength(200)]
        public required string Title { get; set; }

        [Required]
        public required string Description { get; set; }

        public BugPriority Priority { get; set; } = BugPriority.Medium;
        public Guid? AssignedToId { get; set; }
    }
}
