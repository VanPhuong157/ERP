using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VNEB.Repository.Notifications;

namespace VNEB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : Controller
    {
        private readonly INotificationRepository _notiRepo;

        public NotificationsController(INotificationRepository notiRepo)
        {
            _notiRepo = notiRepo;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetMyNotifications()
        {
            // Lấy UserId từ Claims (giả sử bạn đã lưu UserId vào Token/Claims)
            var userId = User.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Không tìm thấy thông tin người dùng");
            }

            var notifications = await _notiRepo.GetNotificationsAsync(userId);
            return Ok(notifications);
        }

        // API đánh dấu đã đọc (Option)
        [HttpPost("read/{id}")]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            // Logic cập nhật IsRead = true trong DB
            return Ok();
        }
    }
}
