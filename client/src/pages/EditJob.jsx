import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useJobStore } from "../store/useJobStore";
import { categories, jobTypes, locations, experienceLevels } from "../data";
import { Loading } from "../components";

const EditJob = () => {
	const navigate = useNavigate();
	const { jobId } = useParams();
	const { jobs, updateJob, isLoading } = useJobStore();

	// Format date for input fields (YYYY-MM-DD)
	const formatDateForInput = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toISOString().split("T")[0];
	};

	const [formData, setFormData] = useState({
		title: "",
		company_name: "",
		location: "",
		category: "",
		job_type: "",
		experience_level: "",
		salary_min: "",
		salary_max: "",
		description: "",
		status: "",
		posted_date: "",
		expiry_date: "",
		responsibilities: "",
		required_skills: "",
	});

	// Load selected job data when component mounts
	useEffect(() => {
		if (jobs.length === 0) return;

		const job = jobs.find((job) => job.id === parseInt(jobId));

		if (!job) {
			toast.error("Job not found.");
			navigate("/recruiter");
			return;
		}

		setFormData({
			title: job.title || "",
			company_name: job.company_name || "",
			location: job.location || "",
			category: job.category || "",
			job_type: job.job_type || "",
			experience_level: job.experience_level || "",
			salary_min: job.salary_min || "",
			salary_max: job.salary_max || "",
			description: job.description || "",
			status: job.status || "",
			posted_date: formatDateForInput(job.posted_date),
			expiry_date: formatDateForInput(job.expiry_date),
			responsibilities: job.responsibilities || "",
			required_skills: job.required_skills || "",
		});
	}, [jobId, jobs, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await updateJob(jobId, formData);
			navigate("/recruiter");
		} catch (error) {
			console.error("Error updating job:", error);
		}
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="bg-white rounded-lg shadow-md p-8">
				<h1 className="text-2xl font-bold mb-6 text-gray-800">
					Edit Job Listing
				</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* First row - Job Title and Category */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Job Title<span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="title"
								value={formData.title}
								onChange={handleChange}
								placeholder="e.g., Senior Software Engineer"
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Category
							</label>
							<select
								name="category"
								value={formData.category}
								onChange={handleChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
							>
								<option value="">Select Category</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Company and Job Type */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Company Name<span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="company_name"
								value={formData.company_name}
								onChange={handleChange}
								placeholder="e.g., Google Inc."
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Job Type
							</label>
							<select
								name="job_type"
								value={formData.job_type}
								onChange={handleChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
							>
								<option value="">Select Job Type</option>
								{jobTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Status and Experience Level */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Job Status
							</label>
							<select
								name="status"
								value={formData.status}
								onChange={handleChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
							>
								<option value="active">Active</option>
								<option value="close">Close</option>
								<option value="draft">Draft</option>
							</select>
							<p className="text-xs text-gray-500 mt-1">
								Active jobs are visible to candidates. Draft jobs are saved but
								not visible.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Experience Level
							</label>
							<select
								name="experience_level"
								value={formData.experience_level}
								onChange={handleChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
							>
								<option value="">Select Experience Level</option>
								{experienceLevels.map((level) => (
									<option key={level} value={level}>
										{level}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Location */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Location<span className="text-red-500">*</span>
						</label>
						<select
							name="location"
							value={formData.location}
							onChange={handleChange}
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
							required
						>
							<option value="">Select Location</option>
							{locations.map((loc) => (
								<option key={loc} value={loc}>
									{loc}
								</option>
							))}
						</select>
					</div>

					{/* Posted and Expiry Date */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Posted Date<span className="text-red-500">*</span>
							</label>
							<input
								type="date"
								name="posted_date"
								value={formData.posted_date}
								onChange={handleChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Expiry Date<span className="text-red-500">*</span>
							</label>
							<input
								type="date"
								name="expiry_date"
								value={formData.expiry_date}
								onChange={handleChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
								required
							/>
						</div>
					</div>

					{/* Salary Range */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Salary Range (Annual)
						</label>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<input
									type="number"
									name="salary_min"
									value={formData.salary_min}
									onChange={handleChange}
									placeholder="Min (e.g., 50000)"
									className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
								/>
							</div>
							<div>
								<input
									type="number"
									name="salary_max"
									value={formData.salary_max}
									onChange={handleChange}
									placeholder="Max (e.g., 80000)"
									className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
								/>
							</div>
						</div>
					</div>

					{/* Job Description */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Job Description<span className="text-red-500">*</span>
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Enter job description..."
							rows={8}
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
							required
						/>
					</div>

					{/* Job Responsibilities */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Responsibilities
						</label>
						<textarea
							name="responsibilities"
							value={formData.responsibilities}
							onChange={handleChange}
							placeholder="Enter key responsibilities and duties for this role..."
							rows={4}
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Tip: Use bullet points for better readability
						</p>
					</div>

					{/* Skills */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Required Skills<span className="text-red-500">*</span>
						</label>
						<textarea
							name="required_skills"
							value={formData.required_skills}
							onChange={handleChange}
							placeholder="e.g., JavaScript, React, Node.js"
							rows={3}
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
							required
						/>
						<p className="text-xs text-gray-500 mt-1">
							Separate skills with commas
						</p>
					</div>

					<div className="flex items-center justify-between pt-4">
						<span className="text-sm text-gray-500">
							<span className="text-red-500">*</span> Required fields
						</span>
						<div className="flex gap-4">
							<button
								type="button"
								onClick={() => navigate("/recruiter")}
								className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium transition-colors cursor-pointer"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-70 cursor-pointer"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<span className="inline-block animate-spin mr-2">↻</span>
										Updating...
									</>
								) : (
									"Update Job"
								)}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditJob;
