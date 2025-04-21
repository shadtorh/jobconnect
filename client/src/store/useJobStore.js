import { create } from "zustand";
import { axiosInstance } from "../utils/axios";
import { toast } from "react-toastify";

export const useJobStore = create((set, get) => ({
	jobs: [],
	isLoading: false,
	error: null,
	activeJobsCount: 0,
	applicantsCount: 0,
	appliedCount: 0,

	// setSelectedJob: (job) => {
	// 	set({ selectedJob: job });
	// },

	getJobs: async () => {
		set({ isLoading: true });
		try {
			const response = await axiosInstance.get("/jobs/my-jobs");
			console.log("Jobs by recruiter:", response.data.jobs);
			if (response.data.jobs.length === 0) {
				toast.info("No jobs found for this recruiter.");
			}
			set({ jobs: response.data.jobs, isLoading: false });
		} catch (error) {
			set({ error: error.response.data.message, isLoading: false });
		}
	},
	createJob: async (jobData) => {
		set({ isLoading: true });
		if (jobData.expiry_date < jobData.posted_date) {
			toast.error("Expiry date cannot be before posted date");
			set({
				error: "Expiry date cannot be before posted date",
				isLoading: false,
			});

			return;
		}

		if (jobData.salary_min > jobData.salary_max) {
			toast.error("Minimum salary cannot be greater than maximum salary");
			set({
				error: "Minimum salary cannot be greater than maximum salary",
				isLoading: false,
			});
			return;
		}

		if (jobData.salary_min < 0 || jobData.salary_max < 0) {
			toast.error("Salary cannot be negative");
			set({ error: "Salary cannot be negative", isLoading: false });
			return;
		}

		if (
			!jobData.title ||
			!jobData.description ||
			!jobData.location ||
			!jobData.company_name
		) {
			toast.error("Please fill all required fields");
			set({ error: "Please fill all required fields", isLoading: false });
			return;
		}

		try {
			const response = await axiosInstance.post("/jobs", jobData);
			toast.success(response.data.message);
			console.log("Job created: at server", response.data.job);
			set((state) => ({
				jobs: [...state.jobs, response.data.job],
			}));
		} catch (error) {
			toast.error(error.response.data.message);
			set({ error: error.response.data.message, isLoading: false });
		} finally {
			set({ isLoading: false });
		}
	},

	deleteJob: async (jobId) => {
		set({ isLoading: true });
		try {
			const response = await axiosInstance.delete(`/jobs/${jobId}`);
			console.log("Job deleted:", response.data.job);
			toast.success(response.data.message);
			set((state) => ({
				jobs: state.jobs.filter((job) => job.id !== jobId),
			}));
		} catch (error) {
			toast.error(error.response.data.message);
			set({ error: error.response.data.message, isLoading: false });
		} finally {
			set({ isLoading: false });
		}
	},

	// Get a job by ID
	getJobById: async (jobId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/jobs/${jobId}`);
			set({ job: response.data.job, isLoading: false });
			return response.data.job;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message || "Failed to fetch job";
			set({ error: errorMessage, isLoading: false });
			toast.error(errorMessage);
			return null;
		}
	},

	updateJob: async (jobId, jobData) => {
		if (jobData.expiry_date < jobData.posted_date) {
			toast.error("Expiry date cannot be before posted date");
			set({
				error: "Expiry date cannot be before posted date",
				isLoading: false,
			});

			return;
		}

		if (jobData.salary_min > jobData.salary_max) {
			toast.error("Minimum salary cannot be greater than maximum salary");
			set({
				error: "Minimum salary cannot be greater than maximum salary",
				isLoading: false,
			});
			return;
		}

		if (jobData.salary_min < 0 || jobData.salary_max < 0) {
			toast.error("Salary cannot be negative");
			set({ error: "Salary cannot be negative", isLoading: false });
			return;
		}

		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/jobs/${jobId}`, jobData);
			console.log("Job updated:", response.data.job);
			const updatedJobs = get().jobs.map((job) =>
				job.id === jobId ? { ...job, ...jobData } : job
			);

			set({ jobs: updatedJobs, isLoading: false });

			toast.success("Job updated successfully");
			return response.data.job;
		} catch (error) {
			toast.error(error.response.data.message);
			set({ error: error.response.data.message, isLoading: false });
		} finally {
			set({ isLoading: false });
		}
	},

	getActiveJobs: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/jobs/active");
			console.log("Active jobs:", response.data.jobs);
			set({ jobs: response.data.jobs, isLoading: false });
		} catch (error) {
			toast.error(error.response.data.message);
			set({ error: error.response.data.message, isLoading: false });
		}
	},

	getActiveJobsCount: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/jobs/active-counts");
			// console.log("Active jobs count:", response.data.count);
			set({ activeJobsCount: response.data.count, isLoading: false });
		} catch (error) {
			toast.error(error.response.data.message);
			set({ error: error.response.data.message, isLoading: false });
		}
	},

	getJobApplicantsCount: async (jobId) => {
		try {
			const response = await axiosInstance.get(
				`/jobs/${jobId}/applicants-count`
			);
			console.log("Applicants count:", response.data.count);
			set((state) => ({
				applicantsCount: {
					...state.applicantsCount,
					[jobId]: response.data.count,
				},
			}));
			return response.data.count;
		} catch (error) {
			console.error("Error fetching applicants count:", error);
			return 0;
		}
	},

	getAppliedJobCount: async () => {
		try {
			const response = await axiosInstance.get("/jobs/applied-count");
			console.log("Applied job count:", response.data.count);
			set({ appliedCount: response.data.count });
			return response.data.count;
		} catch (error) {
			console.error("Error fetching applied job count:", error);
			set({ error: error.response.data.message });
			return 0;
		}
	},
}));
