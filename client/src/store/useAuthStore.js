import { create } from "zustand";
import { axiosInstance } from "../utils/axios";
import { toast } from "react-toastify";

export const useAuthStore = create((set) => ({
	user: null,
	isLoading: false,
	error: null,

	setUser: (user) => set({ user }),

	login: async (formData) => {
		set({ isLoading: true, error: null });

		if (!formData.email || !formData.password) {
			toast.error("Please enter email and password");
			return;
		}

		try {
			const response = await axiosInstance.post("/auth/login", formData);

			localStorage.setItem("token", response.data.token);
			console.log("Login response:", response.data);

			toast.success("Login successful!");
			set({ user: response.data.user });
			return response.data;
		} catch (error) {
			console.error("Login error:", error);
			set({
				error:
					error.response?.data?.message ||
					"Login failed. Please check your credentials.",
			});
			toast.error(
				error.response?.data?.message ||
					"Login failed. Please check your credentials."
			);
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	signup: async (formData) => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.post("/auth/signup", formData);

			localStorage.setItem("token", response.data.token);
			toast.success("Signup successful!");
			// Check if the response contains user data

			set({ user: response.data.user, isLoading: false });
			return response.data;
		} catch (error) {
			console.error("Signup error:", error);
			set({
				error:
					error.response?.data?.message || "Signup failed. Please try again.",
			});
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	updateProfile: async (formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(
				"/auth/update-profile",
				formData
			);

			// Save updated token if it's returned
			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
			}

			toast.success(response.data.message);
			set({ user: response.data.user, isLoading: false });
			return response.data.user;
		} catch (error) {
			console.error("Update user error:", error);
			set({
				error:
					error.response?.data?.message ||
					"Update user failed. Please try again.",
			});
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	// Load user from cookie
	loadUser: async () => {
		const token = localStorage.getItem("token");

		if (!token) {
			console.log("No token found in localStorage");
			set({ user: null, isLoading: false });
			return null;
		}

		set({ isLoading: true });
		try {
			// Ensure token is set in axios headers
			axiosInstance.defaults.headers.common["Authorization"] =
				`Bearer ${token}`;

			const res = await axiosInstance.get("/auth/me");
			// console.log("User loaded:", res.data.user);

			// Validate the response data
			if (res.data && res.data.user) {
				set({ user: res.data.user, isLoading: false });
				return res.data.user;
			} else {
				console.error("Invalid user data format:", res.data);
				// Clear invalid token
				localStorage.removeItem("token");
				set({ user: null });
				return null;
			}
		} catch (error) {
			console.error("Error loading user:", error);
			localStorage.removeItem("token");
			set({ user: null, isLoading: false });
		}
	},

	// Logout action
	logout: async () => {
		try {
			await axiosInstance.post("/auth/logout");
			localStorage.removeItem("token"); // Remove token from local storage
			set({ user: null, success: "Logged out" });
		} catch (err) {
			console.log("Logout failed", err);
		}
	},
}));
