import { rootApi } from '../api/rootApi';

export const authenApi = {
  // Gửi username, password để nhận Token và thông tin user
  login: (data: any) => 
    rootApi.post('/Users/login', data),

  // Lấy thông tin chi tiết user theo Id (nếu cần)
  getById: (id: string) => 
    rootApi.get(`/Users/${id}`),
  register: (data: any) => rootApi.post('/Users/register', data),
};