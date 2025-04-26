import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"; // Ensure this is set correctly in your .env file
export const axiosInstance = axios.create({
	baseURL: `${BACKEND_URL}/api`, // Ensure this is set correctly in your .env file
	withCredentials: true, // CORRECT: Keep this for sending cookies automatically
});

axiosInstance.interceptors.request.use(
	(config) => {
		console.log("🚀 Axios Interceptor: Checking request", {
			url: config.url,
			method: config.method,
		}); // Log request details

		// Log Content-Type for POST/PUT (still useful)
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

// Optional: Add response interceptor for debugging server responses
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
		// Specifically log if it's a 401/403 which might indicate cookie issues
		if (error.response?.status === 401 || error.response?.status === 403) {
			console.warn(
				"   Auth Error (401/403): Check if cookie is being sent/valid, and server CORS allows credentials."
			);
		}
		return Promise.reject(error);
	}
);
