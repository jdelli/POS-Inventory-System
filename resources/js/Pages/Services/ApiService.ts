import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8002/api';

const apiService = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});



export default apiService
