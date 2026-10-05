using BugLens.Api.DTOs.Bugs;
using BugLens.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BugLens.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All bug operations require authentication
    public class BugsController : ControllerBase
    {
        private readonly IBugService _bugService;

        public BugsController(IBugService bugService)
        {
            _bugService = bugService;
        }

        private Guid GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(idClaim, out Guid id))
            {
                return id;
            }
            throw new UnauthorizedAccessException("Invalid User Token.");
        }

        [HttpPost]
        public async Task<ActionResult<BugResponse>> CreateBug([FromBody] CreateBugRequest request)
        {
            var userId = GetCurrentUserId();
            var result = await _bugService.CreateBugAsync(request, userId);
            return CreatedAtAction(nameof(GetBug), new { id = result.Id }, result);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BugResponse>>> GetAllBugs()
        {
            var bugs = await _bugService.GetAllBugsAsync();
            return Ok(bugs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BugResponse>> GetBug(Guid id)
        {
            var bug = await _bugService.GetBugByIdAsync(id);
            if (bug == null) return NotFound();
            return Ok(bug);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<BugResponse>> UpdateBug(Guid id, [FromBody] UpdateBugRequest request)
        {
            var updated = await _bugService.UpdateBugAsync(id, request);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBug(Guid id)
        {
            var success = await _bugService.DeleteBugAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/comments")]
        public async Task<ActionResult<BugLens.Api.DTOs.Comments.CommentResponse>> AddComment(Guid id, [FromBody] BugLens.Api.DTOs.Comments.AddCommentRequest request)
        {
            var userId = GetCurrentUserId();
            var comment = await _bugService.AddCommentAsync(id, request, userId);
            if (comment == null) return NotFound();
            return Ok(comment);
        }

        [HttpPost("{id}/evidence")]
        public async Task<ActionResult<BugLens.Api.DTOs.Investigation.EvidenceResponse>> AddEvidence(Guid id, [FromBody] BugLens.Api.DTOs.Investigation.AddEvidenceRequest request)
        {
            var userId = GetCurrentUserId();
            var evidence = await _bugService.AddEvidenceAsync(id, request, userId);
            if (evidence == null) return NotFound();
            return Ok(evidence);
        }

        [HttpPost("{id}/notes")]
        public async Task<ActionResult<BugLens.Api.DTOs.Investigation.InvestigationNoteResponse>> AddInvestigationNote(Guid id, [FromBody] BugLens.Api.DTOs.Investigation.AddInvestigationNoteRequest request)
        {
            var userId = GetCurrentUserId();
            var note = await _bugService.AddInvestigationNoteAsync(id, request, userId);
            if (note == null) return NotFound();
            return Ok(note);
        }
    }
}
