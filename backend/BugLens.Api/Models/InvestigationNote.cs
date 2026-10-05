namespace BugLens.Api.Models
{
    public class InvestigationNote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Title { get; set; }
        public required string Content { get; set; }
        public bool IsRootCause { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public Guid BugId { get; set; }
        public Bug? Bug { get; set; }

        public Guid AuthorId { get; set; }
        public User? Author { get; set; }
    }
}
