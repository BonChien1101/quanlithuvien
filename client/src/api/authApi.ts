import axiosClient from './axiosClient';

export interface LoginRequest { username: string; password: string; } //dlieu gui khi dnhap
export interface LoginResponse { token: string; roles?: string[]; } // dnhap thanhcong
export interface SignupRequest { username: string; password: string; }  // dlieu khi dki
export interface SignupResponse { token: string; roles?: string[]; } // dlieu nhan duoc khi dki thanh cong
export const authApi = { // API xác thực người dùng
  async login(data: LoginRequest){ // hàm đăng nhập
    try {
      const r = await axiosClient.post<LoginResponse>('/api/auth/login', data);
      return r.data;
    } catch (err: any) {
      // fallback khi BE không dùng prefix /api
      if (err?.response?.status === 404) {
        const r2 = await axiosClient.post<LoginResponse>('/auth/login', data);
        return r2.data;
      }
      throw err;
    }
  },
  async signup(data: SignupRequest){ // hàm đăng ký
    try {
      const r = await axiosClient.post<SignupResponse>('/api/auth/signup', data);
      return r.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const r2 = await axiosClient.post<SignupResponse>('/auth/signup', data);
        return r2.data;
      }
      throw err;
    }
  }
};
