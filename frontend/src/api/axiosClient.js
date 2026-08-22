import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial for sending/receiving HttpOnly JWT cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
