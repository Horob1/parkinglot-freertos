import axios from "axios";


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken") ?? "";
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    // config.headers["x-api-key"] = import.meta.env.VITE_API_KEY;
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
