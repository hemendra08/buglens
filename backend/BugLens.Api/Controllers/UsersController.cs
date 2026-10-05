using BugLens.Api.Data;
using BugLens.Api.DTOs.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BugLens.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly BugLensDbContext _context;

        public UsersController(BugLensDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserSummary>>> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new UserSummary
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role.ToString()
                })
                .OrderBy(u => u.Name)
                .ToListAsync();

            return Ok(users);
        }
    }
}
