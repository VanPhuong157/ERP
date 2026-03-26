using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VNEB.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } // Mã nhân viên (Primary Key)
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; 
        public string FullName { get; set; } = string.Empty; // Họ và tên
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } // Vai trò hệ thống
        public string Company { get; set; } = string.Empty; // Pháp nhân ký HĐLĐ

        // --- Thông tin định danh & Liên hệ ---
        public string? Gender { get; set; } // Giới tính
        public DateTime? Birthday { get; set; } // Ngày tháng năm sinh
        public string? IdCardNumber { get; set; } // Số CMTND
        public DateTime? IdCardIssuedDate { get; set; } // Cấp ngày
        public string? IdCardIssuedPlace { get; set; } // Nơi cấp
        public string? PermanentAddress { get; set; } // Hộ khẩu thường trú
        public string? Ethnic { get; set; } // Dân tộc
        public string? PhoneNumber { get; set; } // ĐT Di động

        // --- Trình độ & Chuyên môn ---
        public string? EducationLevel { get; set; } // Trình độ
        public string? School { get; set; } // Trường
        public string? Major { get; set; } // Chuyên ngành

        // --- Thông tin công việc ---
        public string? Position { get; set; } // Chức danh
        public string? DepartmentName { get; set; } // Bộ phận (Dạng text)
        public DateTime? JoinDate { get; set; } // Ngày vào
        public DateTime? ProbationStartDate { get; set; } // Thử việc từ ngày
        public DateTime? ProbationEndDate { get; set; } // Thử việc đến ngày

        // --- Quản lý Hợp đồng (Dạng File Path) ---
        public string? ContractType { get; set; } // Loại hợp đồng
        public string? OfficialContractFile1 { get; set; } // File HĐ chính thức lần 1 (Path)
        public string? OfficialContractFile2 { get; set; } // File HĐ chính thức lần 2 (Path)
        public string? OfficialContractFile3 { get; set; } // File HĐ chính thức lần 3 (Path)
        
        // --- Ngày ký HĐ (Dùng để quản lý thời hạn/gia hạn) ---
        public DateTime? OfficialContractDate1 { get; set; } // Ngày ký HĐ lần 1
        public DateTime? OfficialContractDate2 { get; set; } // Ngày ký HĐ lần 2
        public DateTime? OfficialContractDate3 { get; set; } // Ngày ký HĐ lần 3

        // --- Mã số thuế & Bảo hiểm ---
        public string? TaxCode { get; set; } // Mã số thuế
        public string? InsuranceCode { get; set; } // Mã số BHXH
        public decimal? InsuranceSalaryStart { get; set; } // Mức lương đóng BHXH khởi điểm
        public decimal? InsuranceSalaryCurrent { get; set; } // Mức lương đóng BHXH hiện tại

        // --- Lương & Ngân hàng ---
        public decimal? ProbationSalary { get; set; } // Mức lương Thử việc
        public decimal? OfficialSalary { get; set; }
        public string? BankAccountNumber { get; set; } // Tài khoản ngân hàng
        public string? BankName { get; set; } // Tên ngân hàng

        // --- JWT Authentication Fields ---
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        // --- Relationships ---
        public int DepartmentId { get; set; } // ID Phòng ban
        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }
    }
}