import axios from 'axios';

//
const axiosClient = axios.create({
  baseURL: '/',
});

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if(token){
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để bắt lỗi và lấy message từ backend
axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data?.message) {
      // Tạo error mới với message từ backend
      const customError: any = new Error(error.response.data.message);
      customError.response = error.response;
      customError.status = error.response.status;
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
