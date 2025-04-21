import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/useAuthStore";
import {
	categories,
	jobTypes,
	locations,
	experienceLevels,
	statusOptions,
} from "../data";
import { useJobStore } from "../store/useJobStore";

const PostJob = () => {
	const navigate = useNavigate();
	// const { user } = useAuthStore();

	const { createJob, isLoading } = useJobStore();

	// Calculate default posted date (today) and expiry date (30 days from now)
	const today = new Date();
	const thirtyDaysLater = new Date();
	thirtyDaysLater.setDate(today.getDate() + 30);

	// Format dates to YYYY-MM-DD for form inputs
	const formatDateForInput = (date) => {
		return date.toISOString().split("T")[0];
	};

	const [formData, setFormData] = useState({
		title: "",
		category: "Technology",
		description: "",
		responsibilities: "", // New field for job responsibilities
		location: "",
		salary_min: "",
		salary_max: "",
		required_skills: "",
		job_type: "Full-time",
		experience_level: "Mid-Level",
		status: "active", // Default to active
		company_name: "",
		posted_date: formatDateForInput(today), // Default to today
		expiry_date: formatDateForInput(thirtyDaysLater), // Default to 30 days later
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		await createJob({
			...formData,
			required_skills: formData.required_skills
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s !== "")
				.join(", "), // 🔥 convert to clean comma-separated string
			responsibilities: formData.responsibilities
				.split("\n")
				.map((r) => r.trim())
				.filter((r) => r !== "")
				.join(", "),
		});

		setFormData({
			title: "",
			category: "Technology",
			description: "",
			responsibilities: "",
			location: "",
			salary_min: "",
			salary_max: "",
			required_skills: "",
			job_type: "Full-time",
			experience_level: "Mid-Level",
			status: "active", // Default to active
			company_name: "",
			posted_date: formatDateForInput(today), // Default to today
			expiry_date: formatDateForInput(thirtyDaysLater), // Default to 30 days later
		});
		navigate("/recruiter");
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="bg-white rounded-lg shadow-md p-8">
				<h1 className="text-2xl font-bold mb-6 text-gray-800">
					Post a New Job
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
								{jobTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Job Status and Experience Level */}
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
								{statusOptions.map((option) => (
									<option key={option} value={option}>
										{option.charAt(0).toUpperCase() + option.slice(1)}
									</option>
								))}
							</select>
							<p className="text-xs text-gray-500 mt-1">
								Active jobs are visible to candidates. Draft jobs are saved but
								not visible.
							</p>
						</div>
					</div>

					{/* Experience Level and Location */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
								{experienceLevels.map((level) => (
									<option key={level} value={level}>
										{level}
									</option>
								))}
							</select>
						</div>

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
								<option value="" disabled>
									Select a location
								</option>
								{locations.map((loc) => (
									<option key={loc} value={loc}>
										{loc}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Posted Date and Expiry Date */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Posting Date
							</label>
							<input
								type="date"
								name="post_date"
								value={formData.posted_date}
								onChange={handleChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Expiry Date
							</label>
							<input
								type="date"
								name="expiry_date"
								value={formData.expiry_date}
								onChange={handleChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
							/>
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

					{/* Job Responsibilities - New section */}
					{/* <div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Job Responsibilities
						</label>
						<textarea
							name="responsibilities"
							value={formData.responsibilities}
							onChange={handleChange}
							placeholder="Enter key responsibilities and duties for this role..."
							rows={6}
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Tip: Use bullet points for better readability (e.g., - Develop web
							applications)
						</p>
					</div> */}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Responsibilities <span className="text-red-500">*</span>
						</label>
						<textarea
							name="responsibilities"
							value={formData.responsibilities}
							onChange={handleChange}
							placeholder="Enter key responsibilities and duties for this role..."
							rows="4"
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
							required
						/>
						<p className="text-xs text-gray-500 mt-1">
							Tip: Use bullet points for better readability and clarity (e.g., -
							Develop web applications) Enter new line for each responsibility
							or duty
						</p>
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

					{/* Required Skills */}
					{/* <div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Required Skills
						</label>
						<input
							type="text"
							name="skills"
							value={formData.skills}
							onChange={handleChange}
							placeholder="e.g., JavaScript, React, Node.js"
							className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Separate skills with commas
						</p>
					</div> */}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Skills <span className="text-red-500">*</span>
						</label>
						<textarea
							name="required_skills"
							value={formData.required_skills}
							onChange={handleChange}
							placeholder="e.g. JavaScript, React, Node.js"
							rows="3"
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
										Posting...
									</>
								) : (
									"Post Job"
								)}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PostJob;
