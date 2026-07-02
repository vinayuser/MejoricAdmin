import axios from "axios";

// Must include /mateandmentors — routes are mounted in Server/index.js on app.use("/mateandmentors", allRoutes)
const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to handle FormData and other config
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle session expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    if (status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/admin/login";
    } else if (
      status === 403 &&
      /forbidden|invalid.*token|permission/i.test(message)
    ) {
      localStorage.removeItem("user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
