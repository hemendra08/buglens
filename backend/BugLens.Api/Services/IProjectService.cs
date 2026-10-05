using BugLens.Api.DTOs.Projects;

namespace BugLens.Api.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectResponse>> GetAllProjectsAsync();
        Task<ProjectResponse?> GetProjectByIdAsync(Guid id);
        Task<ProjectResponse> CreateProjectAsync(CreateProjectRequest request, Guid ownerId);
        Task<bool> DeleteProjectAsync(Guid id);
    }
}
