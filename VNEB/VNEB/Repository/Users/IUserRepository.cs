using VNEB.DTO.UserDTO;
using VNEB.Responses;

namespace VNEB.Repository.Users
{
    public interface IUserRepository
    {
        Task<Response> Login(LoginDTO login);
        Task<Response> Create(NewUserDTO newUser);
        Task<Response> GetById(string id);
        Task<Response> DeleteUser(string userId);
        Task<Response> GetUsersByDepartment(string departmentId);
        Task<Response> ChangePassword(ChangePasswordDTO model);
    }
}
