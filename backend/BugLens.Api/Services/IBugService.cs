using BugLens.Api.DTOs.Bugs;
using BugLens.Api.DTOs.Comments;

namespace BugLens.Api.Services
{
    public interface IBugService
    {
        Task<BugResponse> CreateBugAsync(CreateBugRequest request, Guid createdById);
        Task<IEnumerable<BugResponse>> GetAllBugsAsync();
        Task<BugResponse?> GetBugByIdAsync(Guid id);
        Task<BugResponse?> UpdateBugAsync(Guid id, UpdateBugRequest request);
        Task<bool> DeleteBugAsync(Guid id);
        Task<CommentResponse?> AddCommentAsync(Guid bugId, AddCommentRequest request, Guid authorId);
        Task<BugLens.Api.DTOs.Investigation.EvidenceResponse?> AddEvidenceAsync(Guid bugId, BugLens.Api.DTOs.Investigation.AddEvidenceRequest request, Guid uploadedById);
        Task<BugLens.Api.DTOs.Investigation.InvestigationNoteResponse?> AddInvestigationNoteAsync(Guid bugId, BugLens.Api.DTOs.Investigation.AddInvestigationNoteRequest request, Guid authorId);
    }
}
