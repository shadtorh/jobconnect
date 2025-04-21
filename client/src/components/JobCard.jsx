import React, { useEffect } from "react";
import {
	FaUserTie,
	FaEdit,
	FaTrashAlt,
	FaToggleOn,
	FaToggleOff,
} from "react-icons/fa";
import { BsFillClockFill } from "react-icons/bs";
import { useJobStore } from "../store/useJobStore";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
	const navigate = useNavigate();
	const { deleteJob, updateJob, getJobApplicantsCount, applicantsCount } =
		useJobStore();

	const jobId = job.id;
	const count = jobId ? applicantsCount[jobId] || 0 : 0;

	useEffect(() => {
		if (jobId) {
			getJobApplicantsCount(jobId);
		}
	}, [jobId, getJobApplicantsCount]);

	const handleDeleteJob = async (jobId) => {
		if (window.confirm("Are you sure you want to delete this job?")) {
			try {
				await deleteJob(jobId);
			} catch (error) {
				console.error("Error deleting job:", error);
			}
		}
	};

	const handleEditJob = (jobId) => {
		navigate(`/edit-job/${jobId}`);
	};

	const handleToggleStatus = async (job) => {
		try {
			const newStatus = job.status === "active" ? "close" : "active";
			const updateData = {
				...job,
				status: newStatus,
			};
			await updateJob(job.id, updateData);
		} catch (error) {
			console.error("Error updating job status:", error);
		}
	};

	// Calculate if job is expiring soon (within 3 days)
	const isExpiringSoon = () => {
		const expiryDate = new Date(job.expiry_date);
		const today = new Date();
		const diffTime = expiryDate - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 3 && diffDays > 0;
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
			{/* Top status bar */}
			<div
				className={`h-1 w-full ${
					job.status === "active"
						? "bg-green-500"
						: job.status === "draft"
							? "bg-yellow-500"
							: "bg-gray-500"
				}`}
			></div>

			<div className="p-5">
				{/* Job header */}
				<div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-1">
							{job.title}
						</h3>
						<p className="text-sm text-gray-600">
							{job.company_name} • {job.location}
						</p>
					</div>

					<div className="mt-2 md:mt-0">
						{job.status === "active" && (
							<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
								<span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
								Active
							</span>
						)}
						{job.status === "draft" && (
							<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
								<span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
								Draft
							</span>
						)}
						{job.status === "close" && (
							<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								<span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>
								Closed
							</span>
						)}
					</div>
				</div>

				{/* Job details */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<div className="flex items-center text-sm text-gray-600">
						<div className="bg-blue-50 p-2 rounded-full mr-2">
							<FaUserTie className="text-blue-600" size={14} />
						</div>
						<span>
							{count} {count === 1 ? "Applicant" : "Applicants"}
						</span>
					</div>

					<div className="flex items-center text-sm text-gray-600">
						<div
							className={`p-2 rounded-full mr-2 ${
								isExpiringSoon() ? "bg-red-50" : "bg-gray-50"
							}`}
						>
							<BsFillClockFill
								className={isExpiringSoon() ? "text-red-600" : "text-gray-600"}
								size={14}
							/>
						</div>
						<span
							className={isExpiringSoon() ? "text-red-600 font-medium" : ""}
						>
							{isExpiringSoon() ? "Expires soon: " : "Deadline: "}
							{new Date(job.expiry_date).toLocaleDateString()}
						</span>
					</div>
				</div>

				{/* Salary & job type if available */}
				{(job.salary_min || job.job_type) && (
					<div className="grid grid-cols-2 gap-3 mb-4 border-t border-gray-100 pt-3">
						{job.salary_min && job.salary_max && (
							<div className="text-sm text-gray-600">
								<span className="text-gray-500">Salary:</span> $
								{job.salary_min.toLocaleString()} - $
								{job.salary_max.toLocaleString()}
							</div>
						)}
						{job.job_type && (
							<div className="text-sm text-gray-600">
								<span className="text-gray-500">Type:</span> {job.job_type}
							</div>
						)}
					</div>
				)}

				{/* Action buttons */}
				<div className="flex flex-wrap justify-end gap-2 mt-2 pt-3 border-t border-gray-100">
					<button
						onClick={() => handleEditJob(job.id)}
						className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
					>
						<FaEdit className="mr-1.5" size={14} />
						Edit
					</button>

					<button
						onClick={() => handleToggleStatus(job)}
						className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							job.status === "active"
								? "bg-orange-50 text-orange-700 hover:bg-orange-100"
								: "bg-green-50 text-green-700 hover:bg-green-100"
						}`}
					>
						{job.status === "active" ? (
							<>
								<FaToggleOff className="mr-1.5" size={14} />
								Close
							</>
						) : (
							<>
								<FaToggleOn className="mr-1.5" size={14} />
								Reopen
							</>
						)}
					</button>

					<button
						onClick={() => handleDeleteJob(job.id)}
						className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
					>
						<FaTrashAlt className="mr-1.5" size={14} />
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export default JobCard;
