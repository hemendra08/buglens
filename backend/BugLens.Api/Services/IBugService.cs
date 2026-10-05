using BugLens.Api.DTOs.Bugs;

namespace BugLens.Api.Services
{
    public interface IBugService
    {
        Task<BugResponse> CreateBugAsync(CreateBugRequest request, Guid createdById);
        Task<IEnumerable<BugResponse>> GetAllBugsAsync();
        Task<BugResponse?> GetBugByIdAsync(Guid id);
        Task<BugResponse?> UpdateBugAsync(Guid id, UpdateBugRequest request);
        Task<bool> DeleteBugAsync(Guid id);
    }
}
