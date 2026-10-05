using BugLens.Api.Models;

namespace BugLens.Api.DTOs.Bugs
{
    public class BugResponse
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        public Guid CreatedById { get; set; }
        public string? CreatedByName { get; set; }

        public Guid? AssignedToId { get; set; }
        public string? AssignedToName { get; set; }
    }
}
