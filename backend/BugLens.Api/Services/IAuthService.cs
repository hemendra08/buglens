using BugLens.Api.DTOs.Auth;
using System.Threading.Tasks;

namespace BugLens.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
    }
}
