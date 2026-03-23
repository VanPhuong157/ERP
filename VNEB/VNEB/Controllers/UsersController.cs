using Microsoft.AspNetCore.Mvc;
using VNEB.DTO.UserDTO;
using VNEB.Repository.Users;
using VNEB.Responses;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VNEB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepo;

        public UsersController(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            var result = await _userRepo.Login(loginDto);

            if (result.Code == 200)
                return Ok(result);

            return BadRequest(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] NewUserDTO newUserDto)
        {
            var res = await _userRepo.Create(newUserDto);
            if (res.Code == 400 || res.Code == 404) return BadRequest(res);
            return Ok(res);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _userRepo.GetById(id);

            if (result.Code == 200)
                return Ok(result);

            return NotFound(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _userRepo.DeleteUser(id);

            if (result.Code == 200)
                return Ok(result);

            return BadRequest(result);
        }

        [HttpGet("department/{departmentId}")]
        public async Task<IActionResult> GetUsersByDepartment(string departmentId)
        {
            var result = await _userRepo.GetUsersByDepartment(departmentId);

            if (result.Code == 200)
                return Ok(result);

            return BadRequest(result);
        }

        [HttpPost("auth/change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO model)
        {
            var result = await _userRepo.ChangePassword(model);

            if (result.Code == 200)
                return Ok(result);

            return BadRequest(result);
        }
    }
}
