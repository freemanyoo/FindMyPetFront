import axios from 'axios';

// 1. axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api', // 백엔드 API 서버 주소
    timeout: 5000, // 요청 타임아웃 5초
});

// 2. 요청 인터셉터(Request Interceptor) 추가
axiosInstance.interceptors.request.use(
    (config) => {
        // API 요청을 보내기 직전에 실행되는 로직

        // localStorage에서 'accessToken'을 가져옵니다.
        const token = localStorage.getItem('accessToken');

        // 토큰이 존재하면, 모든 요청 헤더에 Authorization 헤더를 추가합니다.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // 요청 에러 처리
        return Promise.reject(error);
    }
);

export default axiosInstance;