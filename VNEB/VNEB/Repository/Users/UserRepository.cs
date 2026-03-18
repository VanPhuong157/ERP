using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using VNEB.DTO.UserDTO;
using VNEB.Models;
using VNEB.Responses;

namespace VNEB.Repository.Users
{
    public class UserRepository : IUserRepository
    {
        private readonly VnebContext _context;
        private readonly IConfiguration _configuration;

        public UserRepository(VnebContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<Response> Login(LoginDTO login)
        {
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Username == login.Username);

            // Lưu ý: Trong thực tế hãy dùng VerifyPassword(login.Password, user.PasswordHash)
            if (user == null || !VerifyPassword(login.Password, user.PasswordHash))
            {
                return new Response { Code = 400, Message = "Tên đăng nhập hoặc mật khẩu không đúng." };
            }

            // 2. Tạo Claims phong phú hơn
            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim("FullName", user.FullName),
        new Claim("Company", user.Company), // VNEB / VHS
        new Claim("DeptId", user.DepartmentId.ToString()),
        new Claim("DeptName", user.Department?.Name ?? "")
    };

            var token = GenerateJwtToken(claims);

            return new Response
            {
                Code = 200,
                Message = "Login successful",
                Data = new
                {
                    Token = token,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    Company = user.Company,
                    DepartmentId = user.DepartmentId
                }
            };
        }

        public async Task<Response> Create(NewUserDTO newUser)
        {
            try
            {
                // 1. Kiểm tra trùng username
                if (await _context.Users.AnyAsync(u => u.Username == newUser.Username))
                    return new Response { Code = 400, Message = "Tên đăng nhập đã tồn tại." };

                // 2. Tạo Model từ DTO
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = newUser.Username,
                    FullName = newUser.FullName,
                    Email = newUser.Email,
                    Role = newUser.Role,
                    Company = newUser.Company, // Bổ sung Company
                    DepartmentId = newUser.DepartmentId,
                    PasswordHash = HashPassword(newUser.Password) // Mã hóa mật khẩu
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return new Response { Code = 200, Message = "Tạo tài khoản thành công." };
            }
            catch (Exception ex)
            {
                return new Response { Code = 500, Message = $"Lỗi hệ thống: {ex.Message}" };
            }
        }

        public async Task<Response> GetUsersByDepartment(string departmentId)
        {
            var users = await _context.Users
                .Where(u => u.DepartmentId.ToString() == departmentId)
                .Select(u => new { u.Id, u.FullName }) 
                .ToListAsync();

            return new Response { Code = 200, Data = users };
        }

        public async Task<Response> GetById(string id)
        {
            var user = await _context.Users.Include(u => u.Department).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return new Response { Code = 404, Message = "User not found" };
            return new Response { Code = 200, Data = user };
        }

        public async Task<Response> DeleteUser(string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return new Response { Code = 404, Message = "User not found" };

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return new Response { Code = 200, Message = "Deleted successfully" };
        }

        // --- Helper Methods ---

        private string HashPassword(string password)
        {
            // Sử dụng SHA256 đơn giản (không salt)
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            return HashPassword(password) == storedHash;
        }

        private string GenerateJwtToken(IEnumerable<Claim> claims)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
