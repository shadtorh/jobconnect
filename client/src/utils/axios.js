import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const axiosInstance = axios.create({
	baseURL: `${BACKEND_URL}/api`,
	withCredentials: true,
});

// Add a request interceptor to inject the token from localStorage
axiosInstance.interceptors.request.use(
	(config) => {
		// Get token from localStorage
		const token = localStorage.getItem("token");

		// If token exists, add it to the headers
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}

		console.log("🚀 Axios Interceptor: Checking request", {
			url: config.url,
			method: config.method,
			hasAuthHeader: !!config.headers.Authorization, // Log if auth header is present
		});

		// Log Content-Type for POST/PUT
		if (config.method === "post" || config.method === "put") {
			console.log(
				"   🚀 Axios Interceptor: Content-Type:",
				config.headers["Content-Type"] || "Default (application/json expected)"
			);
		}
		return config;
	},
	(error) => {
		console.error("❌ Axios Interceptor: Request error:", error);
		return Promise.reject(error);
	}
);

// Response interceptor for debugging and handling auth errors
axiosInstance.interceptors.response.use(
	(response) => {
		console.log("✅ Axios Interceptor: Response received", {
			status: response.status,
			url: response.config.url,
		});
		return response;
	},
	(error) => {
		console.error("❌ Axios Interceptor: Response error", {
			message: error.message,
			url: error.config?.url,
			status: error.response?.status,
			data: error.response?.data,
		});

		// Handle token expiration or invalidity
		if (error.response?.status === 401) {
			console.warn("🔑 Auth token expired or invalid - redirecting to login");
			localStorage.removeItem("token"); // Clear invalid token

			// Optional: Redirect to login page if unauthorized
			// window.location.href = '/login';
		}

		return Promise.reject(error);
	}
);

// Initialize with token if it exists (on app start)
const token = localStorage.getItem("token");
if (token) {
	axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
