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

export default axiosClient;
