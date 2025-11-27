import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiService = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Attach the stored Sanctum token (if present) to all outgoing API requests.
apiService.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
        const cfg: any = config;
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default apiService;
