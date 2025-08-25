import axios from 'axios';

// ✅ Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// ✅ 요청 시 자동으로 액세스 토큰 추가
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;