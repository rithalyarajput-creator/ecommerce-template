import axios from 'axios';

const envUrl = process.env.REACT_APP_API_URL;
const API_URL = envUrl !== undefined ? envUrl : 'http://localhost/backend';

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default API;
export { API_URL };
