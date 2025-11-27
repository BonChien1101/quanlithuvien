// API người dùng.
// BACKEND endpoints hiện sử dụng:
//  GET /api/users -> list()
//  DELETE /api/users/{id} -> remove()
// Fallback /users nếu chưa cấu hình prefix.
// TODO BACKEND: thêm POST /api/users (tạo), PUT /api/users/{id} (cập nhật), reset mật khẩu, khóa tài khoản.
import axiosClient from './axiosClient';

export interface UserDTO { id: number; username: string; roles: string[]; }
export interface NewUserPayload { username: string; password: string; roles?: string[]; }

// Simple user API with fallback between /api/users and /users (list/delete)
export const userApi = {
  async list(): Promise<UserDTO[]> {
    try {
      const r = await axiosClient.get<UserDTO[]>('/api/users');
      return r.data;
    } catch (e: any) {
      if (e?.response?.status === 404) {
        const r2 = await axiosClient.get<UserDTO[]>('/users');
        return r2.data;
      }
      throw e;
    }
  },
  async remove(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/api/users/${id}`);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        await axiosClient.delete(`/users/${id}`);
        return;
      }
      throw e;
    }
  }
};
