using BugLens.Api.Data;
using BugLens.Api.DTOs.Bugs;
using BugLens.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BugLens.Api.Services
{
    public class BugService : IBugService
    {
        private readonly BugLensDbContext _context;

        public BugService(BugLensDbContext context)
        {
            _context = context;
        }

        public async Task<BugResponse> CreateBugAsync(CreateBugRequest request, Guid createdById)
        {
            var bug = new Bug
            {
                Title = request.Title,
                Description = request.Description,
                Priority = request.Priority,
                AssignedToId = request.AssignedToId,
                CreatedById = createdById,
                Status = BugStatus.Open,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bugs.Add(bug);
            await _context.SaveChangesAsync();

            return await GetBugByIdAsync(bug.Id) ?? throw new Exception("Failed to retrieve created bug.");
        }

        public async Task<IEnumerable<BugResponse>> GetAllBugsAsync()
        {
            return await _context.Bugs
                .Include(b => b.CreatedBy)
                .Include(b => b.AssignedTo)
                .Select(b => new BugResponse
                {
                    Id = b.Id,
                    Title = b.Title,
                    Description = b.Description,
                    Status = b.Status.ToString(),
                    Priority = b.Priority.ToString(),
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt,
                    CreatedById = b.CreatedById,
                    CreatedByName = b.CreatedBy != null ? b.CreatedBy.Name : null,
                    AssignedToId = b.AssignedToId,
                    AssignedToName = b.AssignedTo != null ? b.AssignedTo.Name : null
                })
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<BugResponse?> GetBugByIdAsync(Guid id)
        {
            var b = await _context.Bugs
                .Include(bug => bug.CreatedBy)
                .Include(bug => bug.AssignedTo)
                .FirstOrDefaultAsync(bug => bug.Id == id);

            if (b == null) return null;

            return new BugResponse
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                Status = b.Status.ToString(),
                Priority = b.Priority.ToString(),
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt,
                CreatedById = b.CreatedById,
                CreatedByName = b.CreatedBy?.Name,
                AssignedToId = b.AssignedToId,
                AssignedToName = b.AssignedTo?.Name
            };
        }

        public async Task<BugResponse?> UpdateBugAsync(Guid id, UpdateBugRequest request)
        {
            var bug = await _context.Bugs.FindAsync(id);
            if (bug == null) return null;

            if (request.Title != null) bug.Title = request.Title;
            if (request.Description != null) bug.Description = request.Description;
            if (request.Status.HasValue) bug.Status = request.Status.Value;
            if (request.Priority.HasValue) bug.Priority = request.Priority.Value;
            
            // Allow unassigning by passing empty GUID in frontend, but here we just check if it's explicitly updated
            // For now, if AssignedToId is passed, we update it.
            if (request.AssignedToId.HasValue) 
            {
                 bug.AssignedToId = request.AssignedToId.Value == Guid.Empty ? null : request.AssignedToId.Value;
            }

            bug.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetBugByIdAsync(bug.Id);
        }

        public async Task<bool> DeleteBugAsync(Guid id)
        {
            var bug = await _context.Bugs.FindAsync(id);
            if (bug == null) return false;

            _context.Bugs.Remove(bug);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
