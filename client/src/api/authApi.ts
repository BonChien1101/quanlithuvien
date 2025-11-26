import axiosClient from './axiosClient';

export interface LoginRequest { username: string; password: string; } //dlieu gui khi dnhap
export interface LoginResponse { token: string; } // dnhap thanhcong
export interface SignupRequest { username: string; password: string; }  // dlieu khi dki
export interface SignupResponse { token: string; } // dlieu nhan duoc khi dki thanh cong
export const authApi = { // API xthuc nguoi dung
  login(data: LoginRequest){ // hàm đăng nhập
    return axiosClient.post<LoginResponse>('/auth/login', data).then(r => r.data); // trả dlieu về từ API
  },
  signup(data: SignupRequest){ // hàm đăng ký
    return axiosClient.post<SignupResponse>('/auth/signup', data).then(r => r.data); // trả dlieu từ API
  }
};
