using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VNEB.Models;
using VNEB.Repository.LeaveRequests;
using VNEB.Responses;

namespace VNEB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly ILeaveRequestRepository _leaveRepo;

        public LeaveRequestsController(ILeaveRequestRepository leaveRepo)
        {
            _leaveRepo = leaveRepo;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] LeaveRequest request)
        {
            if (request == null) return BadRequest(new Response { Code = 400, Message = "Dữ liệu không hợp lệ" });

            var res = await _leaveRepo.Create(request);
            return Ok(res);
        }

        [HttpPost("approve")]
        public async Task<IActionResult> Approve(int requestId, string approverRole)
        {
            var res = await _leaveRepo.Approve(requestId,  approverRole);
            return Ok(res);
        }

        [HttpGet("get-approvals")]
        public async Task<IActionResult> GetForApprover()
        {
  
            var res = await _leaveRepo.GetForApprover();
            return Ok(res);
        }

        [HttpGet("my-requests")]
        public async Task<IActionResult> GetByUser()
        {
            var res = await _leaveRepo.GetByUser();
            return Ok(res);
        }

        [HttpGet("statistical")]
        public async Task<IActionResult> GetStatistical([FromQuery] string? company, [FromQuery] int? deptId)
        {
            var res = await _leaveRepo.GetStatisticalForHR(company, deptId);
            return Ok(res);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var res = await _leaveRepo.Delete(id);
            return Ok(res);
        }
    }
}