namespace BugLens.Api.Models
{
    public class Evidence
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Type { get; set; } // "Screenshot", "NetworkLog", "StackTrace", "Custom"
        public required string Title { get; set; }
        public required string Content { get; set; } // URL for images, JSON/Text for logs
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public Guid BugId { get; set; }
        public Bug? Bug { get; set; }

        public Guid UploadedById { get; set; }
        public User? UploadedBy { get; set; }
    }
}
