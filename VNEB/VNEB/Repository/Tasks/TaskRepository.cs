using Microsoft.EntityFrameworkCore;
using VNEB.DTO.TaskDTO;
using VNEB.Models;
using VNEB.Responses;

namespace VNEB.Repository.Tasks
{
    public class TaskRepository : ITaskRepository
    {
        private readonly VnebContext _context;

        public TaskRepository(VnebContext context)
        {
            _context = context;
        }

        public async Task<Response> GetSubordinatesTasksAsync(string bossId, string month)
        {
            try
            {
                var boss = await _context.Users
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.Id == bossId);

                if (boss == null) return new Response { Code = 404, Message = "Không tìm thấy người dùng" };

                var role = boss.Role.ToUpper();
                IQueryable<User> subordinatesQuery = _context.Users.Include(u => u.Department);

                if (role == "ADMIN" || role == "CHAIRMAN")
                {
                    subordinatesQuery = subordinatesQuery.Where(u => u.Id != bossId);
                }
                else if (role == "BOD")
                {
                    subordinatesQuery = subordinatesQuery.Where(u => u.Id != bossId &&
                        (u.Role.ToUpper() == "MANAGER" || u.Role.ToUpper() == "STAFF"));
                }
                else if (role == "MANAGER")
                {
                    var departmentIds = await GetChildDepartmentIds(boss.DepartmentId);
                    subordinatesQuery = subordinatesQuery.Where(u =>
                        departmentIds.Contains(u.DepartmentId) &&
                        u.Id != bossId &&
                        u.Role.ToUpper() == "STAFF");
                }
                else
                {
                    return new Response { Code = 200, Data = new List<TaskApprovalDto>() };
                }

                var subordinateList = await subordinatesQuery.ToListAsync();
                var subordinateIds = subordinateList.Select(s => s.Id).ToList();

                var tasks = await _context.TaskRegistrations
                    .Where(t => subordinateIds.Contains(t.UserId) && t.Month == month)
                    .ToListAsync();

                var result = subordinateList.Select(s => new TaskApprovalDto
                {
                    UserId = s.Id,
                    FullName = s.FullName,
                    Role = s.Role,
                    DepartmentId = s.DepartmentId,
                    DepartmentName = s.Department?.Name ?? "N/A",
                    CompanyName = s.Company ?? "VHS Group",
                    Month = month,
                    Status = tasks.FirstOrDefault(t => t.UserId == s.Id)?.Status ?? "NOT_STARTED"
                }).ToList();

                return new Response { Code = 200, Data = result };
            }
            catch (Exception ex)
            {
                return new Response { Code = 500, Message = ex.Message };
            }
        }

        private async Task<List<int>> GetChildDepartmentIds(int parentId)
        {
            var allDepts = await _context.Departments.ToListAsync();
            var result = new List<int> { parentId };
            GetChildRecursive(parentId, allDepts, result);
            return result;
        }

        private void GetChildRecursive(int parentId, List<Department> allDepts, List<int> result)
        {
            var children = allDepts.Where(d => d.ParentId == parentId).Select(d => d.Id).ToList();
            foreach (var childId in children)
            {
                result.Add(childId);
                GetChildRecursive(childId, allDepts, result);
            }
        }

        public async Task<Response> GetTasksAsync(string userId, string month)
        {
            var registration = await _context.TaskRegistrations
                .Include(r => r.User)
                .Include(r => r.TaskSections)
                    .ThenInclude(s => s.TaskItems)
                .FirstOrDefaultAsync(r => r.UserId == userId && r.Month == month);

            if (registration == null)
            {
                var user = await _context.Users.FindAsync(userId);
                return new Response
                {
                    Code = 200,
                    Data = new
                    {
                        userId,
                        month,
                        fullName = user?.FullName,
                        status = "DRAFT",
                        taskSections = new List<TaskSection>()
                    }
                };
            }

            return new Response { Code = 200, Data = registration };
        }

        public async Task<Response> SaveTasksAsync(SaveTaskRegistrationDTO dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var existingReg = await _context.TaskRegistrations
                    .Include(r => r.TaskSections)
                        .ThenInclude(s => s.TaskItems)
                    .FirstOrDefaultAsync(r => r.UserId == dto.UserId && r.Month == dto.Month);

                if (existingReg == null)
                {
                    existingReg = new TaskRegistration { UserId = dto.UserId, Month = dto.Month, Status = dto.Status };
                    _context.TaskRegistrations.Add(existingReg);
                }
                else
                {
                    existingReg.Status = dto.Status;
                    if (existingReg.TaskSections != null)
                        _context.TaskSections.RemoveRange(existingReg.TaskSections);
                }

                await _context.SaveChangesAsync();

                if (dto.TaskSections != null && dto.TaskSections.Any())
                {
                    foreach (var secDto in dto.TaskSections)
                    {
                        var newSection = new TaskSection
                        {
                            RegistrationId = existingReg.Id,
                            Category = secDto.Category,
                            SectionName = secDto.SectionName,
                            PersonalWeight = secDto.PersonalWeight,
                            ManagerWeight = secDto.ManagerWeight,
                            TaskItems = (secDto.TaskItems ?? new List<TaskItemDTO>()).Select(t => new TaskItem
                            {
                                TaskDescription = t.TaskDescription,
                                StartDate = t.StartDate,
                                EndDate = t.EndDate,
                                PersonalTarget = t.PersonalTarget,
                                ManagerTarget = t.ManagerTarget,
                                PersonalResult = t.PersonalResult,
                                ManagerResult = t.ManagerResult,
                                PersonalPriority = t.PersonalPriority,
                                ManagerPriority = t.ManagerPriority,
                                PersonalComplexity = t.PersonalComplexity,
                                ManagerComplexity = t.ManagerComplexity
                            }).ToList()
                        };
                        _context.TaskSections.Add(newSection);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new Response { Code = 200, Message = "Lưu thành công", Data = existingReg.Id };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new Response { Code = 500, Message = "Lỗi: " + (ex.InnerException?.Message ?? ex.Message) };
            }
        }

        public async Task<Response> ApproveOrRejectTaskAsync(string registrationId, string action, string bossRole)
        {
            try
            {
                var task = await _context.TaskRegistrations.FindAsync(registrationId);
                if (task == null) return new Response { Code = 404, Message = "Không tìm thấy bản đăng ký" };

                if (action.ToUpper() == "REJECT") task.Status = "REJECTED";
                else if (action.ToUpper() == "APPROVE") task.Status = "APPROVED";

                await _context.SaveChangesAsync();
                return new Response { Code = 200, Message = $"Đã {(action == "APPROVE" ? "duyệt" : "trả lại")} thành công", Data = task.Status };
            }
            catch (Exception ex) { return new Response { Code = 500, Message = "Lỗi xử lý: " + ex.Message }; }
        }


        public async Task<Response> GetPerformanceStatsAsync(string? userId, int? deptId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                var query = _context.TaskItems
                    .Include(ti => ti.TaskSection)
                        .ThenInclude(ts => ts.TaskRegistration)
                            .ThenInclude(tr => tr.User)
                    .AsQueryable();

                // LOGIC LỌC: Ưu tiên lọc theo UserId nếu có giá trị thực sự
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    query = query.Where(ti => ti.TaskSection.TaskRegistration.UserId == userId);
                }
                else if (deptId.HasValue)
                {
                    // Nếu userId trống, lấy toàn bộ nhân viên trong phòng ban (bao gồm phòng con)
                    var childDepts = await GetChildDepartmentIds(deptId.Value);
                    query = query.Where(ti => childDepts.Contains(ti.TaskSection.TaskRegistration.User.DepartmentId));
                }

                var allItems = await query.ToListAsync();

                // Lọc theo ngày và nội dung
                var filteredItems = allItems.Where(t => {
                    if (string.IsNullOrEmpty(t.StartDate)) return false;
                    if (DateTime.TryParse(t.StartDate, out DateTime dt))
                    {
                        return dt.Date >= fromDate.Date && dt.Date <= toDate.Date
                               && !string.IsNullOrWhiteSpace(t.TaskDescription);
                    }
                    return false;
                }).ToList();

                if (!filteredItems.Any())
                    return new Response { Code = 200, Data = CreateEmptyStats() };

                // HELPERS
                int SafeParse(string? val) => int.TryParse(val?.Replace("%", "").Trim(), out int res) ? res : 0;
                bool IsHigh(string? val) => val == "High" || val == "Cao";
                bool IsMedium(string? val) => val == "Medium" || val == "Normal" || val == "T.Bình" || val == "Trung bình";
                bool IsLow(string? val) => val == "Low" || val == "Thấp";

                var total = filteredItems.Count;

                var result = new
                {
                    SectionKPI = new
                    {
                        TotalRegistered = total,
                        // Mức 1: Hoàn thành đúng hạn (100%)
                        CompletedOnTime = filteredItems.Count(t => SafeParse(t.ManagerResult) == 100),
                        // Mức 2: Hoàn thành mức trung bình (31% - 50%)
                        CompletedAverage = filteredItems.Count(t => {
                            int score = SafeParse(t.ManagerResult);
                            return score >= 31 && score <= 50;
                        }),
                        // Mức 3: Mức cảnh báo (<= 30%)
                        CompletedWarning = filteredItems.Count(t => SafeParse(t.ManagerResult) <= 30),
                        CompletedAbove50 = filteredItems.Count(t => SafeParse(t.ManagerResult) >= 50)
                    },
                    SectionComplexity = new
                    {
                        Counts = new
                        {
                            High = filteredItems.Count(t => IsHigh(t.ManagerComplexity)),
                            Medium = filteredItems.Count(t => IsMedium(t.ManagerComplexity)),
                            Low = filteredItems.Count(t => IsLow(t.ManagerComplexity))
                        },
                        CompletionRates = new
                        {
                            HighRate = CalculateAvg(filteredItems, "High"),
                            MediumRate = CalculateAvg(filteredItems, "Medium"),
                            LowRate = CalculateAvg(filteredItems, "Low")
                        }
                    },
                    SectionPriority = new
                    {
                        HighPriorityRate = CalculatePriority(filteredItems, "High"),
                        MediumPriorityRate = CalculatePriority(filteredItems, "Medium"),
                        LowPriorityRate = CalculatePriority(filteredItems, "Low")
                    }
                };

                return new Response { Code = 200, Data = result };
            }
            catch (Exception ex) { return new Response { Code = 500, Message = ex.Message }; }
        }

        private object CreateEmptyStats() => new
        {
            SectionKPI = new { TotalRegistered = 0, CompletedOnTime = 0, CompletedAverage = 0, CompletedWarning = 0, CompletedAbove50 = 0 },
            SectionComplexity = new { Counts = new { High = 0, Medium = 0, Low = 0 }, CompletionRates = new { HighRate = 0, MediumRate = 0, LowRate = 0 } },
            SectionPriority = new { HighPriorityRate = 0, MediumPriorityRate = 0, LowPriorityRate = 0 }
        };

        private double CalculateAvg(List<TaskItem> items, string category)
        {
            List<TaskItem> subset;
            if (category == "High") subset = items.Where(i => i.ManagerComplexity == "High" || i.ManagerComplexity == "Cao").ToList();
            else if (category == "Medium") subset = items.Where(i => i.ManagerComplexity == "Medium" || i.ManagerComplexity == "Normal" || i.ManagerComplexity == "T.Bình" || i.ManagerComplexity == "Trung bình").ToList();
            else subset = items.Where(i => i.ManagerComplexity == "Low" || i.ManagerComplexity == "Thấp").ToList();

            if (!subset.Any()) return 0;
            return Math.Round(subset.Average(i => int.TryParse(i.ManagerResult?.Replace("%", ""), out int r) ? r : 0), 1);
        }

        private double CalculatePriority(List<TaskItem> items, string category)
        {
            if (!items.Any()) return 0;
            int count;
            if (category == "High") count = items.Count(i => i.ManagerPriority == "High" || i.ManagerPriority == "Cao");
            else if (category == "Medium") count = items.Count(i => i.ManagerPriority == "Medium" || i.ManagerPriority == "Normal" || i.ManagerPriority == "T.Bình" || i.ManagerPriority == "Trung bình");
            else count = items.Count(i => i.ManagerPriority == "Low" || i.ManagerPriority == "Thấp");

            return Math.Round((double)count / items.Count * 100, 1);
        }

    }
}