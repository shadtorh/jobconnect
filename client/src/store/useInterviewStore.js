import { create } from "zustand";
import { axiosInstance } from "../utils/axios";
import { toast } from "react-toastify";

export const useInterviewStore = create((set) => ({
	interviews: [], // For storing a list of interviews
	interview: null, // For storing a single completed interview
	currentJobDetails: null, // For storing job details needed for starting an interview
	isLoading: false,
	error: null,

	// --- Action to fetch job details needed for starting an interview ---
	getJobDetailsForInterview: async (jobId) => {
		set({ isLoading: true, error: null, currentJobDetails: null }); // Reset state
		console.log(
			`🚀 Fetching job details for interview start, Job ID: ${jobId}`
		);
		try {
			// Use the specific endpoint for getting job details by Job ID
			const response = await axiosInstance.get(`/demo-interviews/job/${jobId}`);

			if (response.data && response.data.success) {
				console.log(
					"✅ Job details fetched successfully:",
					response.data.interviewDetails
				);
				set({
					currentJobDetails: response.data.interviewDetails, // Store the job details
					loading: false,
					error: null,
				});
				return response.data.interviewDetails; // Return the data
			} else {
				console.warn(
					"⚠️ Fetch job details response indicated failure:",
					response.data
				);
				const message =
					response.data?.message || "Could not load job details for interview.";
				set({ loading: false, error: message, currentJobDetails: null });
				toast.error(message);
				return null;
			}
		} catch (error) {
			console.error("❌ Error fetching job details for interview:", error);
			let errorMessage = "Failed to load interview data.";
			if (error.response) {
				console.error("   Error response data:", error.response.data);
				errorMessage = error.response.data?.message || errorMessage;
			}
			set({ loading: false, error: errorMessage, currentJobDetails: null });
			toast.error(errorMessage);
			return null;
		}
	},

	// --- Action to fetch a single completed interview by its ID ---
	getInterviewById: async (interviewId) => {
		set({ isLoading: true, error: null, interview: null }); // Reset state
		console.log(`🚀 Fetching completed interview with ID: ${interviewId}`);
		try {
			const response = await axiosInstance.get(
				`/demo-interviews/${interviewId}`
			);
			if (response.data && response.data.success) {
				console.log(
					"✅ Completed interview fetched successfully:",
					response.data.interview
				);
				set({
					interview: response.data.interview,
					isLoading: false,
					error: null,
				});
				return response.data.interview;
			} else {
				console.warn(
					"⚠️ Fetch completed interview response indicated failure:",
					response.data
				);
				const message =
					response.data?.message || "Failed to fetch interview details.";
				set({ isLoading: false, error: message, interview: null });
				toast.error(message);
				return null;
			}
		} catch (error) {
			console.error("❌ Error fetching completed interview by ID:", error);
			let errorMessage = "Failed to fetch interview details.";
			if (error.response) {
				console.error("   Error response data:", error.response.data);
				errorMessage = error.response.data?.message || errorMessage;
			}
			set({ loading: false, error: errorMessage, interview: null });
			toast.error(errorMessage);
			return null;
		}
	},

	// --- Placeholder for fetching all user interviews ---
	getUserInterviews: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/demo-interviews"); // Assuming this endpoint returns a list for the user
			if (response.data && response.data.success) {
				set({ interviews: response.data.interviews || [], isLoading: false }); // Ensure interviews is an array
			} else {
				const message = response.data?.message || "Failed to fetch interviews.";
				set({ isLoading: false, error: message, interviews: [] });
				toast.error(message);
			}
		} catch (error) {
			console.error("❌ Error fetching user interviews:", error);
			const errorMessage =
				error.response?.data?.message || "Failed to fetch interviews.";
			set({ isLoading: false, error: errorMessage, interviews: [] });
			toast.error(errorMessage);
		}
	},

	// --- Clear specific states ---
	clearInterview: () => {
		set({ interview: null, error: null });
	},
	clearCurrentJobDetails: () => {
		set({ currentJobDetails: null, error: null });
	},
}));
