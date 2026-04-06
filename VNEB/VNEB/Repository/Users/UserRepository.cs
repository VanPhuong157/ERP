using Microsoft.AspNetCore.Hosting;
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
        private readonly IWebHostEnvironment _webHostEnvironment;

        public UserRepository(VnebContext context, IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _configuration = configuration;
            _webHostEnvironment = webHostEnvironment;
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
            var deptName = user.Department?.Name ?? "";
            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim("FullName", user.FullName),
        new Claim("Company", user.Company), // VNEB / VHS
        new Claim("DeptId", user.DepartmentId.ToString()),
        new Claim("DeptName", deptName),
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
                    DepartmentId = user.DepartmentId,
                    DeptName = user.Department?.Name ?? ""
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

        public async Task<Response> GetAllUsers()
        {
            // Lấy toàn bộ thông tin bao gồm cả phòng ban
            var users = await _context.Users.Include(u => u.Department).ToListAsync();
            return new Response { Code = 200, Data = users };
        }

        public async Task<Response> UpdateUserInfo(User model)
        {
            try
            {
                var user = await _context.Users.FindAsync(model.Id);
                if (user == null) return new Response { Code = 404, Message = "Không tìm thấy nhân viên." };

                user.FullName = model.FullName;
                user.Gender = model.Gender;
                user.Birthday = model.Birthday;
                user.IdCardNumber = model.IdCardNumber;
                user.IdCardIssuedDate = model.IdCardIssuedDate;
                user.IdCardIssuedPlace = model.IdCardIssuedPlace;
                user.PermanentAddress = model.PermanentAddress;
                user.Ethnic = model.Ethnic;
                user.PhoneNumber = model.PhoneNumber;

                user.Position = model.Position;
                user.EducationLevel = model.EducationLevel;
                user.School = model.School;
                user.Major = model.Major;
                user.DepartmentId = model.DepartmentId;
                user.JoinDate = model.JoinDate;
                user.ProbationStartDate = model.ProbationStartDate;
                user.ProbationEndDate = model.ProbationEndDate;

                user.ProbationSalary = model.ProbationSalary;
                user.OfficialSalary = model.OfficialSalary;
                user.InsuranceSalaryStart = model.InsuranceSalaryStart;
                user.InsuranceSalaryCurrent = model.InsuranceSalaryCurrent;
                user.TaxCode = model.TaxCode;
                user.InsuranceCode = model.InsuranceCode;
                user.BankAccountNumber = model.BankAccountNumber;
                user.BankName = model.BankName;

                if (!string.IsNullOrEmpty(model.OfficialContractFile1)) user.OfficialContractFile1 = model.OfficialContractFile1;
                if (!string.IsNullOrEmpty(model.OfficialContractFile2)) user.OfficialContractFile2 = model.OfficialContractFile2;
                if (!string.IsNullOrEmpty(model.OfficialContractFile3)) user.OfficialContractFile3 = model.OfficialContractFile3;
                if (!string.IsNullOrEmpty(model.AvatarPath)) user.AvatarPath = model.AvatarPath;

                await _context.SaveChangesAsync();
                return new Response { Code = 200, Message = "Cập nhật thông tin nhân sự thành công." };
            }
            catch (Exception ex)
            {
                return new Response { Code = 500, Message = $"Lỗi cập nhật: {ex.Message}" };
            }
        }

        public async Task<string> UploadAvatar(IFormFile file, string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new Exception("User không tồn tại");

            // Tạo thư mục riêng cho Avatar
            string folderPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "avatars");
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            // Xóa ảnh cũ nếu đã tồn tại
            if (!string.IsNullOrEmpty(user.AvatarPath))
            {
                var oldPath = Path.Combine(_webHostEnvironment.WebRootPath, user.AvatarPath.TrimStart('/'));
                if (System.IO.File.Exists(oldPath))
                {
                    try { System.IO.File.Delete(oldPath); } catch { /* ignore */ }
                }
            }

            // Tạo tên file mới: avatar_userId_guid.jpg
            string fileName = $"avatar_{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            string relativePath = Path.Combine("uploads", "avatars", fileName).Replace("\\", "/");
            string fullPath = Path.Combine(_webHostEnvironment.WebRootPath, relativePath);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Cập nhật database
            user.AvatarPath = relativePath;
            await _context.SaveChangesAsync();

            return relativePath;
        }

        public async Task<string> UploadContractFile(IFormFile file, string userId, string type)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new Exception("User không tồn tại");

            string folderPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "contracts");
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            string oldRelativePath = type switch
            {
                "1" => user.OfficialContractFile1,
                "2" => user.OfficialContractFile2,
                "3" => user.OfficialContractFile3,
                _ => null
            };

            if (!string.IsNullOrEmpty(oldRelativePath))
            {
                var fullOldPath = Path.Combine(_webHostEnvironment.WebRootPath, oldRelativePath.TrimStart('/'));

                if (System.IO.File.Exists(fullOldPath))
                {
                    try
                    {
                        System.IO.File.Delete(fullOldPath);
                    }
                    catch (Exception) {  }
                }
            }

            string fileName = $"{userId}_{type}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            string relativePath = Path.Combine("uploads", "contracts", fileName).Replace("\\", "/");
            string fullPath = Path.Combine(_webHostEnvironment.WebRootPath, relativePath);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            if (type == "1") user.OfficialContractFile1 = relativePath;
            else if (type == "2") user.OfficialContractFile2 = relativePath;
            else if (type == "3") user.OfficialContractFile3 = relativePath;

            await _context.SaveChangesAsync();
            return relativePath;
        }

        // --- Helper Methods ---
        public async Task<(byte[] Bytes, string ContentType, string FileName)> DownloadContractFile(string filePath)
        {
            var cleanPath = filePath.Replace("\\", "/").TrimStart('/');
            var absolutePath = Path.Combine(_webHostEnvironment.WebRootPath, cleanPath);

            if (!System.IO.File.Exists(absolutePath))
            {
                throw new FileNotFoundException("Không tìm thấy file trên server.");
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(absolutePath);

            var extension = Path.GetExtension(cleanPath).ToLower();
            var fileName = Path.GetFileName(cleanPath);

            string contentType = extension switch
            {
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".doc" => "application/msword",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xls" => "application/vnd.ms-excel",
                ".pdf" => "application/pdf",
                _ => "application/octet-stream"
            };

            return (bytes, contentType, fileName);
        }
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

        public async Task<Response> ChangePassword(ChangePasswordDTO model)
        {
            var user = await _context.Users.FindAsync(model.UserId);
            if (user == null)
                return new Response { Code = 404, Message = "Người dùng không tồn tại." };

            // 1. Kiểm tra mật khẩu cũ
            if (!VerifyPassword(model.OldPassword, user.PasswordHash))
            {
                return new Response { Code = 400, Message = "Mật khẩu cũ không chính xác." };
            }

            // 2. Cập nhật mật khẩu mới
            user.PasswordHash = HashPassword(model.NewPassword);
            await _context.SaveChangesAsync();

            return new Response { Code = 200, Message = "Đổi mật khẩu thành công." };
        }
    }
}
