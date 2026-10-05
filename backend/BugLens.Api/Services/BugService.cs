using BugLens.Api.Data;
using BugLens.Api.DTOs.Bugs;
using BugLens.Api.DTOs.Comments;
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
                ProjectId = request.ProjectId,
                CorrelationId = request.CorrelationId,
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
                    AssignedToName = b.AssignedTo != null ? b.AssignedTo.Name : null,
                    ProjectId = b.ProjectId,
                    CorrelationId = b.CorrelationId
                })
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<BugResponse?> GetBugByIdAsync(Guid id)
        {
            var b = await _context.Bugs
                .Include(bug => bug.CreatedBy)
                .Include(bug => bug.AssignedTo)
                .Include(bug => bug.Comments)
                    .ThenInclude(c => c.Author)
                .Include(bug => bug.Evidences)
                    .ThenInclude(e => e.UploadedBy)
                .Include(bug => bug.InvestigationNotes)
                    .ThenInclude(n => n.Author)
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
                AssignedToName = b.AssignedTo?.Name,
                ProjectId = b.ProjectId,
                CorrelationId = b.CorrelationId,
                Comments = b.Comments.OrderBy(c => c.CreatedAt).Select(c => new CommentResponse
                {
                    Id = c.Id,
                    Body = c.Body,
                    CreatedAt = c.CreatedAt,
                    AuthorId = c.AuthorId,
                    AuthorName = c.Author?.Name
                }).ToList(),
                Evidences = b.Evidences.OrderBy(e => e.CreatedAt).Select(e => new BugLens.Api.DTOs.Investigation.EvidenceResponse
                {
                    Id = e.Id,
                    Type = e.Type,
                    Title = e.Title,
                    Content = e.Content,
                    CreatedAt = e.CreatedAt,
                    UploadedById = e.UploadedById,
                    UploadedByName = e.UploadedBy?.Name
                }).ToList(),
                InvestigationNotes = b.InvestigationNotes.OrderBy(n => n.CreatedAt).Select(n => new BugLens.Api.DTOs.Investigation.InvestigationNoteResponse
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = n.Content,
                    IsRootCause = n.IsRootCause,
                    CreatedAt = n.CreatedAt,
                    AuthorId = n.AuthorId,
                    AuthorName = n.Author?.Name
                }).ToList()
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

        public async Task<CommentResponse?> AddCommentAsync(Guid bugId, AddCommentRequest request, Guid authorId)
        {
            var bug = await _context.Bugs.FindAsync(bugId);
            if (bug == null) return null;

            var comment = new Comment
            {
                Body = request.Body,
                BugId = bugId,
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var author = await _context.Users.FindAsync(authorId);

            return new CommentResponse
            {
                Id = comment.Id,
                Body = comment.Body,
                CreatedAt = comment.CreatedAt,
                AuthorId = comment.AuthorId,
                AuthorName = author?.Name
            };
        }

        public async Task<BugLens.Api.DTOs.Investigation.EvidenceResponse?> AddEvidenceAsync(Guid bugId, BugLens.Api.DTOs.Investigation.AddEvidenceRequest request, Guid uploadedById)
        {
            var bug = await _context.Bugs.FindAsync(bugId);
            if (bug == null) return null;

            var evidence = new Evidence
            {
                Type = request.Type,
                Title = request.Title,
                Content = request.Content,
                BugId = bugId,
                UploadedById = uploadedById,
                CreatedAt = DateTime.UtcNow
            };

            _context.Evidences.Add(evidence);
            await _context.SaveChangesAsync();

            var uploader = await _context.Users.FindAsync(uploadedById);

            return new BugLens.Api.DTOs.Investigation.EvidenceResponse
            {
                Id = evidence.Id,
                Type = evidence.Type,
                Title = evidence.Title,
                Content = evidence.Content,
                CreatedAt = evidence.CreatedAt,
                UploadedById = evidence.UploadedById,
                UploadedByName = uploader?.Name
            };
        }

        public async Task<BugLens.Api.DTOs.Investigation.InvestigationNoteResponse?> AddInvestigationNoteAsync(Guid bugId, BugLens.Api.DTOs.Investigation.AddInvestigationNoteRequest request, Guid authorId)
        {
            var bug = await _context.Bugs.FindAsync(bugId);
            if (bug == null) return null;

            var note = new InvestigationNote
            {
                Title = request.Title,
                Content = request.Content,
                IsRootCause = request.IsRootCause,
                BugId = bugId,
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow
            };

            _context.InvestigationNotes.Add(note);
            await _context.SaveChangesAsync();

            var author = await _context.Users.FindAsync(authorId);

            return new BugLens.Api.DTOs.Investigation.InvestigationNoteResponse
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                IsRootCause = note.IsRootCause,
                CreatedAt = note.CreatedAt,
                AuthorId = note.AuthorId,
                AuthorName = author?.Name
            };
        }
    }
}
