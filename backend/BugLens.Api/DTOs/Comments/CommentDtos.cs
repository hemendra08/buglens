namespace BugLens.Api.DTOs.Comments
{
    public class AddCommentRequest
    {
        public required string Body { get; set; }
    }

    public class CommentResponse
    {
        public Guid Id { get; set; }
        public required string Body { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid AuthorId { get; set; }
        public string? AuthorName { get; set; }
    }
}
