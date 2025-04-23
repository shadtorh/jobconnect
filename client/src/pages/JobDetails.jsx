import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useJobStore } from "../store/useJobStore";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-toastify";
import ApplicationModal from "../components/ApplicationModal";
import {
	FaBriefcase,
	FaUserTie,
	FaDollarSign,
	FaRegCalendarAlt,
	FaMapMarkerAlt,
} from "react-icons/fa";

const JobDetails = () => {
	const { id } = useParams();
	const { getJobById, isLoading } = useJobStore();
	const { user } = useAuthStore();
	const [job, setJob] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const fetchJob = async () => {
			try {
				// Call getJobById to fetch the specific job data
				const jobData = await getJobById(parseInt(id));
				setJob(jobData);
			} catch (error) {
				console.error("Failed to fetch job details:", error);
			}
		};

		fetchJob();
	}, [id, getJobById]);

	// Split skills into an array
	const getSkillsArray = (skillsString) => {
		if (!skillsString) return [];
		return skillsString.split(",").map((skill) => skill.trim());
	};

	const handleApply = () => {
		if (!user) {
			toast.info("Please log in to apply for this job");
			return;
		}
		setIsModalOpen(true);
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!job) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-800">Job not found</h2>
					<p className="mt-2 text-gray-600">
						The job you're looking for doesn't exist or has been removed.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="bg-white rounded-lg shadow-sm">
				{/* Job header */}
				<div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
					<div className="flex items-start space-x-4">
						<div className="bg-gray-100 p-3 rounded-lg">
							<FaBriefcase className="text-gray-500 text-xl" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
							<p className="text-gray-600">
								{job.company_name} • {job.location}
							</p>
						</div>
					</div>
					<button
						className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
						onClick={handleApply}
					>
						Apply Now
					</button>
				</div>

				{/* Application Modal */}
				<ApplicationModal
					isOpen={isModalOpen}
					closeModal={() => setIsModalOpen(false)}
					job={job}
				/>

				{/* Job details */}
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<div className="bg-gray-50 p-4 rounded-md">
							<h3 className="text-sm text-gray-500 mb-1">Job Type</h3>
							<div className="flex items-center">
								<FaBriefcase className="text-gray-400 mr-2" />
								<p className="font-medium">{job.job_type || "Full-time"}</p>
							</div>
						</div>

						<div className="bg-gray-50 p-4 rounded-md">
							<h3 className="text-sm text-gray-500 mb-1">Experience</h3>
							<div className="flex items-center">
								<FaUserTie className="text-gray-400 mr-2" />
								<p className="font-medium">
									{job.experience_level || "Senior Level"}
								</p>
							</div>
						</div>

						<div className="bg-gray-50 p-4 rounded-md">
							<h3 className="text-sm text-gray-500 mb-1">Salary Range</h3>
							<div className="flex items-center">
								<FaDollarSign className="text-gray-400 mr-2" />
								<p className="font-medium">
									${job.salary_min?.toLocaleString()} - $
									{job.salary_max?.toLocaleString()}
								</p>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="md:col-span-2">
							{/* Job Description */}
							<div className="mb-8">
								<h2 className="text-lg font-bold text-gray-800 mb-4">
									Job Description
								</h2>
								<p className="text-gray-700">{job.description}</p>
							</div>

							{/* Responsibilities */}
							<div className="mb-8">
								<h2 className="text-lg font-bold text-gray-800 mb-4">
									Responsibilities:
								</h2>
								<div className="text-gray-700">
									{job.responsibilities ? (
										<ul className="list-disc pl-5 space-y-2">
											{job.responsibilities.split(",").map((item, index) => (
												<li key={index}>{item.trim()}</li>
											))}
										</ul>
									) : (
										<p>No responsibilities listed.</p>
									)}
								</div>
							</div>

							{/* Required Skills */}
							<div className="mb-8">
								<h2 className="text-lg font-bold text-gray-800 mb-4">
									Required Skills
								</h2>
								<div className="flex flex-wrap gap-2">
									{getSkillsArray(job.required_skills).map((skill, index) => (
										<span
											key={index}
											className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						</div>

						<div className="md:col-span-1">
							{/* About Company */}
							<div className="bg-gray-50 p-6 rounded-lg mb-6">
								<h2 className="text-lg font-bold text-gray-800 mb-4">
									About {job.company_name}
								</h2>
								<p className="text-gray-700 mb-4">
									{job.company_name} is a leading company focused on creating
									innovative solutions for customers worldwide. With passionate
									teams and dedicated employees, we're committed to pushing the
									boundaries of what's possible.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Job meta information */}
				<div className="bg-gray-50 p-6 border-t border-gray-200 flex flex-col md:flex-row justify-between text-sm text-gray-500">
					<div className="flex items-center mb-2 md:mb-0">
						<FaRegCalendarAlt className="mr-1" />
						<span>
							Posted: {new Date(job.posted_date).toLocaleDateString()}
						</span>
					</div>
					<div className="flex items-center">
						<FaMapMarkerAlt className="mr-1" />
						<span>{job.location}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default JobDetails;
