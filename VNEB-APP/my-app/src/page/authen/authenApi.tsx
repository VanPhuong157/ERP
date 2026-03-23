import { rootApi } from '../api/rootApi';

export const authenApi = {
  login: (data: any) => 
    rootApi.post('/Users/login', data),

  getById: (id: string) => 
    rootApi.get(`/Users/${id}`),
  register: (data: any) => rootApi.post('/Users/register', data),

  changePassword: (data: { userId: string, oldPassword: string, newPassword: string }) => 
    rootApi.post('/Users/change-password', data),
};