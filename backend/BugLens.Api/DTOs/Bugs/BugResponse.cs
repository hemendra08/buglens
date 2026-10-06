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

        public Guid ProjectId { get; set; }
        public string? CorrelationId { get; set; }
        public string? BranchName { get; set; }
        public string? PullRequestUrl { get; set; }
        public string? Environment { get; set; }
        
        public List<BugLens.Api.DTOs.Comments.CommentResponse> Comments { get; set; } = new();
        public List<BugLens.Api.DTOs.Investigation.EvidenceResponse> Evidences { get; set; } = new();
        public List<BugLens.Api.DTOs.Investigation.InvestigationNoteResponse> InvestigationNotes { get; set; } = new();
    }
}
