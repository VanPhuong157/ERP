using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VNEB.DTO.TaskDTO;
using VNEB.Repository.Tasks;
using VNEB.Responses;

namespace VNEB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ITaskRepository _taskRepo;

        public TaskController(ITaskRepository taskRepo)
        {
            _taskRepo = taskRepo;
        }

        [HttpGet("{userId}/{month}")]
        public async Task<IActionResult> Get(string userId, string month) => Ok(await _taskRepo.GetTasksAsync(userId, month));

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] SaveTaskRegistrationDTO dto) => Ok(await _taskRepo.SaveTasksAsync(dto));

        [HttpGet("approvals/{bossId}")]
        public async Task<IActionResult> GetApprovals(string bossId, [FromQuery] string month)
        {
            month ??= DateTime.Now.ToString("yyyy-MM");
            return Ok(await _taskRepo.GetSubordinatesTasksAsync(bossId, month));
        }

        [HttpPost("approve-action")]
        public async Task<IActionResult> ApproveAction([FromBody] ApprovalActionDTO dto)
        {
            var userRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value ?? "STAFF";
            return Ok(await _taskRepo.ApproveOrRejectTaskAsync(dto.RegistrationId, dto.Action, userRole));
        }

        [HttpGet("performance/personal")]
        public async Task<IActionResult> GetPersonalStats(
            [FromQuery] string? userId,  
            [FromQuery] int? deptId,     
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            return Ok(await _taskRepo.GetPerformanceStatsAsync(userId, deptId, fromDate, toDate));
        }
    }
}