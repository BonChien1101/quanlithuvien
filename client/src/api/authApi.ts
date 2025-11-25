import axiosClient from './axiosClient';

export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; }

export const authApi = {
  login(data: LoginRequest){
    return axiosClient.post<LoginResponse>('/auth/login', data).then(r => r.data);
  }
};
