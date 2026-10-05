namespace BugLens.Api.DTOs.Auth
{
    public class AuthResponse
    {
        public required string Token { get; set; }
        public required string Email { get; set; }
        public required string Name { get; set; }
        public required string Role { get; set; }
    }
}
