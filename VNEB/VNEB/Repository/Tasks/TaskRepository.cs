using Microsoft.EntityFrameworkCore;
using VNEB.DTO.TaskDTO;
using VNEB.Models;
using VNEB.Repository.Notifications;
using VNEB.Responses;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace VNEB.Repository.Tasks
{
    public class TaskRepository : ITaskRepository
    {
        private readonly VnebContext _context;
        private readonly INotificationRepository _notificationRepository;
        public TaskRepository(VnebContext context, INotificationRepository notificationRepository)
        {
            _context = context;
            _notificationRepository = notificationRepository;
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

                            TaskItems = (secDto.TaskItems ?? new List<TaskItemDTO>()).Select(t => new TaskItem
                            {
                                TaskDescription = t.TaskDescription,
                                StartDate = t.StartDate,
                                EndDate = t.EndDate,
                                ExpectedOutcome = t.ExpectedOutcome,
                                PersonalTarget = t.PersonalTarget,
                                ManagerTarget = t.ManagerTarget,
                                PersonalResult = t.PersonalResult,
                                ManagerResult = t.ManagerResult,
                                PersonalPriority = t.PersonalPriority,
                                ManagerPriority = t.ManagerPriority,
                                PersonalComplexity = t.PersonalComplexity,
                                ManagerComplexity = t.ManagerComplexity,
                                Note = t.Note,
                            }).ToList()
                        };
                        _context.TaskSections.Add(newSection);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                await _notificationRepository.SendAndSave(
    dto.UserId,
    "Sếp vừa cập nhật công việc cho bạn!",
    "TASK_UPDATE",         // Type: để phân loại
    "/tasks/my-task"       // Link: đường dẫn để click vào
);

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
                var query = _context.TaskItems.AsQueryable();

                // 1. Xác định danh sách nhân viên cần lấy báo cáo
                List<User> targetUsers = new List<User>();
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    query = query.Where(ti => ti.TaskSection.TaskRegistration.UserId == userId);
                }
                else if (deptId.HasValue)
                {
                    var childDepts = await GetChildDepartmentIds(deptId.Value);
                    targetUsers = await _context.Users
                        .Where(u => childDepts.Contains(u.DepartmentId))
                        .ToListAsync();

                    query = query.Where(ti => childDepts.Contains(ti.TaskSection.TaskRegistration.User.DepartmentId));
                }

                var allItems = await query
                    .Include(ti => ti.TaskSection)
                        .ThenInclude(ts => ts.TaskRegistration)
                    .ToListAsync();

                var filteredItems = allItems.Where(t =>
                {
                    if (string.IsNullOrWhiteSpace(t.TaskDescription)) return false;
                    bool hasStart = DateTime.TryParse(t.StartDate, out DateTime taskStart);
                    bool hasEnd = DateTime.TryParse(t.EndDate, out DateTime taskEnd);
                    if (!hasStart) return false;

                    bool startInMonth = taskStart.Date >= fromDate.Date && taskStart.Date <= toDate.Date;
                    bool endNotOver = hasEnd && taskEnd.Date <= toDate.Date;
                    return startInMonth && endNotOver;
                }).ToList();

                // HELPERS
                int SafeParse(string? val) => int.TryParse(val?.Replace("%", "").Trim(), out int res) ? res : 0;
                bool IsHigh(string? val) => val == "High" || val == "Cao";
                bool IsMedium(string? val) => val == "Medium" || val == "Normal" || val == "T.Bình" || val == "Trung bình";
                bool IsLow(string? val) => val == "Low" || val == "Thấp";

                var employeeList = new List<object>();

                if (string.IsNullOrWhiteSpace(userId) && targetUsers.Any())
                {
                    employeeList = targetUsers.Select(u =>
                    {
                        var userTasks = filteredItems.Where(ti => ti.TaskSection.TaskRegistration.UserId == u.Id).ToList();
                        int totalCount = userTasks.Count;
                        int completedCount = userTasks.Count(t => SafeParse(t.ManagerResult) == 100);

                        return (object)new
                        {
                            u.Id,
                            u.FullName,
                            Total = totalCount,
                            Completed = completedCount
                        };
                    }).ToList();
                }

                if (!filteredItems.Any())
                {
                    return new Response
                    {
                        Code = 200,
                        Data = CreateEmptyStats()
                    };
                }

                var total = filteredItems.Count;
                var result = new
                {
                    SectionKPI = new
                    {
                        TotalRegistered = total,
                        CompletedOnTime = filteredItems.Count(t => SafeParse(t.ManagerResult) == 100),

                        CompletedEffort = filteredItems.Count(t =>
                        {
                            int score = SafeParse(t.ManagerResult);
                            return score >= 70 && score < 100;
                        }),
                        CompletedWarning = filteredItems.Count(t =>
                        {
                            int score = SafeParse(t.ManagerResult);
                            return score >= 30 && score < 70;
                        }),
                        NotMet = filteredItems.Count(t => SafeParse(t.ManagerResult) < 30)
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
                    },
                    EmployeeList = employeeList
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