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

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If the error is 401 Unauthorized and it's not a retry attempt yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retry attempt

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // No refresh token, redirect to login
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Call backend to refresh token
                // The backend endpoint is /api/auth/refresh and expects { refreshToken: "..." }
                const response = await axios.post('http://localhost:8080/api/auth/refresh', { refreshToken: refreshToken });
                const newAccessToken = response.data.data.accessToken; // Assuming response structure { success: true, data: { accessToken: "..." } }

                // Update tokens in localStorage
                localStorage.setItem('accessToken', newAccessToken);
                // Note: The backend's refreshAccessToken currently returns only newAccessToken, not a new refreshToken.
                // If the backend also returned a new refresh token, we would update it here:
                // localStorage.setItem('refreshToken', newRefreshToken);

                // Update the original request's header with the new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Retry the original request
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Clear tokens and redirect to login on refresh failure
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userRole');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;