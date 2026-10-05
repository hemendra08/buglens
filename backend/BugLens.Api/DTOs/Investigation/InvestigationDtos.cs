using System.ComponentModel.DataAnnotations;

namespace BugLens.Api.DTOs.Investigation
{
    public class EvidenceResponse
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public Guid UploadedById { get; set; }
        public string? UploadedByName { get; set; }
    }

    public class AddEvidenceRequest
    {
        [Required, MaxLength(50)]
        public string Type { get; set; } = string.Empty; // "Screenshot", "NetworkLog", "StackTrace", "Custom"
        
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
    }

    public class InvestigationNoteResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRootCause { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid AuthorId { get; set; }
        public string? AuthorName { get; set; }
    }

    public class AddInvestigationNoteRequest
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public bool IsRootCause { get; set; }
    }
}
