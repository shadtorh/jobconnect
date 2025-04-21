import { create } from "zustand";
import { axiosInstance } from "../utils/axios";
import { toast } from "react-toastify";

export const useApplicationStore = create((set, get) => ({
	// State
	applications: [],
	applicationStatus: null,
	applicationCount: 0,
	selectedApplication: null,
	isLoading: false,
	error: null,

	// Apply for a job
	applyForJob: async (jobId, applicationData) => {
		set({ isLoading: true, error: null });
		try {
			const formData = new FormData();
			console.log("Application data:", applicationData);

			// Add ALL form fields to FormData
			// Add all text fields
			formData.append("first_name", applicationData.first_name);
			formData.append("last_name", applicationData.last_name);
			formData.append("email", applicationData.email);
			formData.append("position", applicationData.position);
			formData.append("motivationQuestion", applicationData.motivationquestion);
			formData.append("uniqueQuestion", applicationData.uniquequestion);

			if (applicationData.cover_letter) {
				formData.append("coverLetter", applicationData.cover_letter);
			}

			// Add the resume file - this is important!
			formData.append("resume", applicationData.resume);

			console.log("Sending application to server...");

			const response = await axiosInstance.post(
				`/applications/${jobId}/apply`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			console.log("Job application response:", response.data);
			set({ isLoading: false });
			// Optionally, you can update the applications state here
			toast.success("Application submitted successfully!");
			// set((state) => ({
			// 	applications: [...state.applications, response.data.application],
			// }));

			return { success: true, data: response.data.jobApplication };
		} catch (error) {
			const errorMsg =
				error.response?.data?.message || "Failed to submit application";
			set({
				isLoading: false,
				error: errorMsg,
			});
			toast.error(errorMsg);
			return { success: false, error: errorMsg };
		}
	},

	// Get applications count for a recruiter
	getApplicationsCount: async () => {
		try {
			const response = await axiosInstance.get(
				"/applications/applications-count"
			);
			// console.log("Application count:", response.data.count);
			set({ applicationCount: response.data.count });
			return response.data.count;
		} catch (error) {
			console.error("Failed to fetch application count:", error);
			return get().applicationCount; // Return current count on error
		}
	},

	getJobApplications: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(
				"/applications/job-applications"
			);
			console.log("Job applications:", response.data.jobApplications);
			set({
				applications: response.data.jobApplications || [],
				isLoading: false,
			});
			return response.data.applications;
		} catch (error) {
			const errorMsg =
				error.response?.data?.message || "Failed to fetch applications";
			set({
				isLoading: false,
				error: errorMsg,
			});
			console.error("Error fetching applications:", error);
			return [];
		}
	},

	updateApplicationStatus: async (applicationId, status) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.patch(
				`/applications/${applicationId}/status`,
				{ status }
			);
			console.log("Application updated:", response.data.application);
			toast.success(`Application ${status} successfully`);
			set((state) => ({
				applications: state.applications.map((status) => {
					if (status.id === applicationId) {
						return { ...status, status };
					}
					return status;
				}),
				isLoading: false,
			}));
			return response.data.application;
		} catch (error) {
			const errorMsg =
				error.response?.data?.message || "Failed to update application";
			set({
				isLoading: false,
				error: errorMsg,
			});
			toast.error(errorMsg);
			console.error("Error updating application:", error);
			return null;
		}
	},

	getApplicationById: async (applicationId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(
				`/applications/${applicationId}`
			);
			console.log("Application by ID:", response);
			set({ isLoading: false });
			return response.data.application;
		} catch (error) {
			const errorMsg =
				error.response?.data?.message || "Failed to fetch application";
			set({
				isLoading: false,
				error: errorMsg,
			});
			console.error("Error fetching application:", error);
			return null;
		}
	},

	downloadResume: async (applicationId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(
				`/applications/${applicationId}/resume`,
				{
					responseType: "blob", // Important for file download
				}
			);
			console.log("Resume data:", response.data);
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			const errorMsg =
				error.response?.data?.message || "Failed to fetch resume";
			set({
				isLoading: false,
				error: errorMsg,
			});
			console.error("Error fetching resume:", error);
			return null;
		}
	},

	getSeekerApplications: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(
				"/applications/seeker-applications"
			);
			console.log("Seeker applications:", response.data.seekerApplications);
			set({
				applications: response.data.seekerApplications || [],
				isLoading: false,
			});
			return response.data.applications;
		} catch (error) {
			const errorMsg =
				error.response?.data?.message || "Failed to fetch applications";
			set({
				isLoading: false,
				error: errorMsg,
			});
			console.error("Error fetching applications:", error);
			return [];
		}
	},

	getSeekerApplicationsById: async (jobId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/applications/seeker/${jobId}`);
			console.log(
				"Seeker applications by job ID:",
				response.data.seekerApplications
			);
			set({
				isLoading: false,
			});
			return response.data.seekerApplications;
		} catch (error) {
			const errorMsg =
				error.response?.data?.message || "Failed to fetch applications";
			set({
				isLoading: false,
				error: errorMsg,
			});
			console.error("Error fetching applications:", error);
			return [];
		}
	},
}));
