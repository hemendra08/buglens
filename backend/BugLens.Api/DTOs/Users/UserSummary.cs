namespace BugLens.Api.DTOs.Users
{
    public class UserSummary
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
    }
}
