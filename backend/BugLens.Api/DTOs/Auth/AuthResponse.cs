namespace BugLens.Api.DTOs.Auth
{
    public class AuthUserInfo
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
    }

    public class AuthResponse
    {
        public required string Token { get; set; }
        public required AuthUserInfo User { get; set; }
    }
}
