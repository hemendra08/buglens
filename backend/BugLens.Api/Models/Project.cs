namespace BugLens.Api.Models
{
    public class Project
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationships
        public Guid OwnerId { get; set; }
        public User? Owner { get; set; }

        public ICollection<Bug> Bugs { get; set; } = new List<Bug>();
    }
}
