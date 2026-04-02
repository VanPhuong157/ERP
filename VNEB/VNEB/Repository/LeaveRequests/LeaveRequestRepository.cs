using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VNEB.Models;
using VNEB.Responses;

namespace VNEB.Repository.LeaveRequests
{
    public class LeaveRequestRepository : ILeaveRequestRepository
    {
        private readonly VnebContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public LeaveRequestRepository(VnebContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        private string GetCurrentUserId() =>
        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        public async Task<Response> Create(LeaveRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return new Response { Code = 404, Message = "User not found" };
                request.UserId = userId;
                string role = user.Role?.ToUpper() ?? "STAFF";

                request.Status = 0;

                if (role == "STAFF")
                    request.CurrentApproverRole = "MANAGER";
                else if (role == "MANAGER" || role == "TP")
                    request.CurrentApproverRole = "BOD";
                else if (role == "BOD")
                    request.CurrentApproverRole = "CHAIRMAN";
                else if (role == "CHAIRMAN" || role == "ADMIN")
                {
                    request.Status = 1;
                    request.ApprovedDate = DateTime.Now;
                    request.ApprovedBy = "Hệ thống";
                }
                else
                {
                    request.CurrentApproverRole = "Manager";
                }

                _context.LeaveRequests.Add(request);
                await _context.SaveChangesAsync();

                return new Response { Code = 200, Data = request, Message = "Tạo đơn thành công" };
            }
            catch (Exception ex)
            {
                return new Response { Code = 500, Message = ex.Message };
            }
        }

        public async Task<Response> Approve(int requestId, string approverRole)
        {
            try
            {
                var req = await _context.LeaveRequests
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(x => x.Id == requestId);

                if (req == null) return new Response { Code = 404, Message = "Đơn không tồn tại" };

                var approverId = GetCurrentUserId();
                var approver = await _context.Users.FindAsync(approverId);
                if (approver == null) return new Response { Code = 401, Message = "Unauthorized" };


                if (req.CurrentApproverRole?.ToUpper() != approverRole?.ToUpper())
                {
                    return new Response { Code = 403, Message = "Đơn này hiện không chờ cấp của bạn duyệt" };
                }

                if (approverRole.ToUpper() == "MANAGER" && req.User.DepartmentId != approver.DepartmentId)
                {
                    return new Response { Code = 403, Message = "Trưởng phòng chỉ được duyệt đơn của phòng mình" };
                }

                string roleUp = approverRole.ToUpper();
                if (roleUp == "MANAGER" || roleUp == "BOD" || roleUp == "CHAIRMAN" || roleUp == "ADMIN" || roleUp == "TP")
                {
                    req.Status = 1; 
                    req.CurrentApproverRole = "Done";
                    req.ApprovedBy = approver.FullName;
                    req.ApprovedDate = DateTime.Now;
                }

                await _context.SaveChangesAsync();

                return new Response
                {
                    Code = 200,
                    Message = "Phê duyệt đơn nghỉ phép thành công!",
                    Data = req
                };
            }
            catch (Exception ex)
            {
                return new Response { Code = 500, Message = ex.Message };
            }
        }
        // 1. Cập nhật hàm cho Người duyệt (Manager/BOD/Chairman)
        public async Task<Response> GetForApprover()
        {
            var currentUserId = GetCurrentUserId();
            var currentUser = await _context.Users.FindAsync(currentUserId);
            if (currentUser == null) return new Response { Code = 401 };

            var query = _context.LeaveRequests.Include(r => r.User).AsQueryable();
            query = query.Where(r => r.User.Company == currentUser.Company);

            string role = currentUser.Role?.ToUpper();
            if (role == "MANAGER" || role == "TP")
                query = query.Where(r => r.User.DepartmentId == currentUser.DepartmentId && r.CurrentApproverRole == "MANAGER");
            else if (role == "BOD")
                query = query.Where(r => r.CurrentApproverRole == "BOD");
            else if (role == "CHAIRMAN")
                query = query.Where(r => r.CurrentApproverRole == "CHAIRMAN");

            var data = await query.OrderByDescending(r => r.RequestDate)
                .Select(r => new {
                    r.Id,
                    r.UserId, // Bổ sung UserId
                    FullName = r.User.FullName,
                    DepartmentName = r.User.Department.Name,
                    r.ConfirmationType,
                    r.RequestDate,
                    r.FromTime,
                    r.ToTime,
                    r.Reason,
                    r.Status,
                    r.CurrentApproverRole,
                    r.ApprovedBy,    // Bổ sung Người duyệt
                    r.ApprovedDate   // Bổ sung Ngày duyệt
                }).ToListAsync();

            return new Response { Code = 200, Data = data };
        }
        public async Task<Response> GetStatisticalForHR(string? companyFilter, int? deptId)
        {
            try
            {
                var query = _context.LeaveRequests.Include(r => r.User).AsQueryable();

                if (!string.IsNullOrEmpty(companyFilter))
                    query = query.Where(r => r.User.Company == companyFilter);

                if (deptId.HasValue && deptId.Value > 0)
                    query = query.Where(r => r.User.DepartmentId == deptId);

                var data = await query
                    .OrderByDescending(r => r.RequestDate)
                    .Select(r => new {
                        r.Id,
                        r.UserId,
                        FullName = r.User.FullName,
                        Company = r.User.Company,
                        DepartmentId = r.User.DepartmentId,
                        DepartmentName = r.User.Department != null ? r.User.Department.Name : "N/A",
                        r.ConfirmationType,
                        r.RequestDate,
                        r.FromTime,
                        r.ToTime,
                        r.Reason,
                        r.Status,
                        r.CurrentApproverRole,
                        r.ApprovedBy,    
                        r.ApprovedDate 
                    })
                    .ToListAsync();

                return new Response { Code = 200, Data = data, Message = "Thành công" };
            }
            catch (Exception ex) { return new Response { Code = 500, Message = ex.Message }; }
        }

        public async Task<Response> GetUserLeaveQuotaReport(string? companyFilter, int? deptId)
        {
            try
            {
                var query = _context.UserLeaveQuotas
                    .Include(q => q.User).ThenInclude(u => u.Department)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(companyFilter))
                    query = query.Where(q => q.User.Company == companyFilter);
                if (deptId.HasValue && deptId > 0)
                    query = query.Where(q => q.User.DepartmentId == deptId);

                var data = await query.Select(q => new {
                    q.UserId,
                    FullName = q.User.FullName,
                    DepartmentName = q.User.Department != null ? q.User.Department.Name : "N/A",
                    q.RemainingLastYear,
                    q.NewQuota,
                    TotalQuota = q.RemainingLastYear + q.NewQuota,

                    UsedPaidLeave = _context.LeaveRequests
                        .Where(r => r.UserId == q.UserId && r.Status == 1 && r.ConfirmationType == "Nghỉ phép")
                        .AsEnumerable()
                        .Sum(r => (r.EndDate - r.RequestDate).Days + 1),

                    q.LateEarlyCount,

                    UnpaidLeave = _context.LeaveRequests
                        .Where(r => r.UserId == q.UserId && r.Status == 1 && r.ConfirmationType == "Nghỉ không lương")
                        .AsEnumerable()
                        .Sum(r => (r.EndDate - r.RequestDate).Days + 1),

                    q.SpecialLeave
                }).ToListAsync();

                return new Response { Code = 200, Data = data, Message = "Thành công" };
            }
            catch (Exception ex) { return new Response { Code = 500, Message = ex.Message }; }
        }
        public async Task<Response> GetByUser()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (string.IsNullOrEmpty(currentUserId))
                    return new Response { Code = 401, Message = "Unauthorized" };

                var data = await _context.LeaveRequests
                    .Where(r => r.UserId == currentUserId)
                    .OrderByDescending(r => r.RequestDate)
                    .Select(r => new {
                        r.Id,
                        r.ConfirmationType,
                        r.RequestDate,
                        r.FromTime,
                        r.ToTime,
                        r.Reason,
                        r.Status,
                        r.CurrentApproverRole,
                        r.ApprovedBy,
                        r.ApprovedDate
                    })
                    .ToListAsync();

                return new Response { Code = 200, Data = data, Message = "Success" };
            }
            catch (Exception ex)
            {
                return new Response { Code = 500, Message = ex.Message };
            }
        }

        public async Task<Response> UpdateLeaveQuota(UserLeaveQuota quota)
        {
            try
            {
                var existing = await _context.UserLeaveQuotas
                    .FirstOrDefaultAsync(x => x.UserId == quota.UserId);

                if (existing == null)
                {
                    _context.UserLeaveQuotas.Add(quota);
                }
                else
                {
                    existing.RemainingLastYear = quota.RemainingLastYear;
                    existing.NewQuota = quota.NewQuota;
                    existing.LateEarlyCount = quota.LateEarlyCount;
                    existing.SpecialLeave = quota.SpecialLeave;
                    // Không update UsedPaidLeave và UnpaidLeave vì cái này tính từ đơn nghỉ
                }

                await _context.SaveChangesAsync();
                return new Response { Code = 200, Message = "Cập nhật định mức thành công" };
            }
            catch (Exception ex) { return new Response { Code = 500, Message = ex.Message }; }
        }

        public async Task<Response> Delete(int id)
        {
            try
            {
                var item = await _context.LeaveRequests.FindAsync(id);
                if (item == null) return new Response { Code = 404, Message = "Không tìm thấy đơn" };

                _context.LeaveRequests.Remove(item);
                await _context.SaveChangesAsync();

                return new Response { Code = 200, Message = "Xóa đơn thành công" };
            }
            catch (Exception ex)
            {
                return new Response { Code = 500, Message = ex.Message };
            }
        }
    }
}