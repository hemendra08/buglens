using BugLens.Api.Data;
using BugLens.Api.DTOs.Projects;
using BugLens.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BugLens.Api.Services
{
    public class ProjectService : IProjectService
    {
        private readonly BugLensDbContext _context;

        public ProjectService(BugLensDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProjectResponse>> GetAllProjectsAsync()
        {
            return await _context.Projects
                .Include(p => p.Owner)
                .Select(p => new ProjectResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    OwnerId = p.OwnerId,
                    OwnerName = p.Owner != null ? p.Owner.Name : null
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<ProjectResponse?> GetProjectByIdAsync(Guid id)
        {
            var p = await _context.Projects
                .Include(proj => proj.Owner)
                .FirstOrDefaultAsync(proj => proj.Id == id);

            if (p == null) return null;

            return new ProjectResponse
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                OwnerId = p.OwnerId,
                OwnerName = p.Owner?.Name
            };
        }

        public async Task<ProjectResponse> CreateProjectAsync(CreateProjectRequest request, Guid ownerId)
        {
            var project = new Project
            {
                Name = request.Name,
                Description = request.Description,
                OwnerId = ownerId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return await GetProjectByIdAsync(project.Id) ?? throw new Exception("Failed to retrieve created project.");
        }

        public async Task<bool> DeleteProjectAsync(Guid id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return false;

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
