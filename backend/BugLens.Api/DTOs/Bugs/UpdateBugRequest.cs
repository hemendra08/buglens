using BugLens.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace BugLens.Api.DTOs.Bugs
{
    public class UpdateBugRequest
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }
        
        public BugStatus? Status { get; set; }
        
        public BugPriority? Priority { get; set; }
        
        public Guid? AssignedToId { get; set; }
    }
}
