import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApplicationStore } from "../store/useApplicationStore";
import {
	FaArrowLeft,
	FaFilePdf,
	FaDownload,
	FaUser,
	FaEnvelope,
	FaBriefcase,
	FaCheckCircle,
	FaTimesCircle,
} from "react-icons/fa";
import { formatDate } from "../utils/helper";
import { toast } from "react-toastify";
import { StatusBadge } from "../components";

const ViewApplication = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const {
		getApplicationById,
		isLoading,
		error,
		updateApplicationStatus,
		downloadResume,
	} = useApplicationStore();
	const [application, setApplication] = useState(null);

	useEffect(() => {
		const fetchApplication = async () => {
			if (id) {
				console.log("ID:", id);
				const result = await getApplicationById(id);
				console.log("Result:", result);

				if (result) {
					setApplication(result);
				}
			}
		};

		fetchApplication();
	}, [id, getApplicationById]);

	const handleResumeDownload = async (application) => {
		try {
			toast.info("Downloading resume...");

			// Use the store function to get the blob
			const blob = await downloadResume(application.id);

			if (!blob) {
				toast.error("Resume file not available");
				return;
			}

			// Create a URL for the blob
			const url = window.URL.createObjectURL(blob);

			// Create a link element
			const link = document.createElement("a");
			link.href = url;

			// Set a filename based on the applicant's name
			link.download = `${application.first_name}_${application.last_name}_Resume.pdf`;

			// Add to document, click to trigger download, then clean up
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Release the object URL
			window.URL.revokeObjectURL(url);

			toast.success("Resume downloaded successfully");
		} catch (error) {
			console.error("Error downloading resume:", error);
			toast.error("Failed to download resume");
		}
	};

	const handleStatusChange = async (newStatus) => {
		if (
			window.confirm(
				`Are you sure you want to mark this application as ${newStatus}?`
			)
		) {
			try {
				await updateApplicationStatus(id, newStatus);
				// Update local state
				setApplication((prev) => ({ ...prev, status: newStatus }));
			} catch (error) {
				console.error("Error updating status:", error);
			}
		}
	};

	const handleBack = () => {
		navigate("/recruiter/applications");
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex justify-center items-center">
				<div className="bg-white rounded-lg shadow-md p-6 max-w-md">
					<h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
					<p className="text-gray-700">{error}</p>
					<button
						onClick={handleBack}
						className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
					>
						<FaArrowLeft className="mr-2" /> Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	if (!application) {
		return (
			<div className="min-h-screen bg-gray-50 flex justify-center items-center">
				<div className="bg-white rounded-lg shadow-md p-6 max-w-md">
					<h2 className="text-xl font-bold text-gray-800 mb-2">
						Application Not Found
					</h2>
					<p className="text-gray-700">
						The application you're looking for doesn't exist or you don't have
						permission to view it.
					</p>
					<button
						onClick={handleBack}
						className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
					>
						<FaArrowLeft className="mr-2" /> Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Back button */}
				<button
					onClick={handleBack}
					className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
				>
					<FaArrowLeft className="mr-2" /> Back to Dashboard
				</button>

				{/* Application Sheet */}
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					{/* Header */}
					<div className="p-6 border-b border-gray-200">
						<div className="flex justify-between items-start">
							<div>
								<h1 className="text-2xl font-bold text-gray-800">
									Application #{application.id}
								</h1>
								<p className="text-sm text-gray-500 mt-1">
									Submitted on {formatDate(application.created_at)}
								</p>
							</div>
							<div>
								<StatusBadge status={application.status} />
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="p-6">
						{/* Job Information */}
						<div className="mb-8">
							<h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
								<FaBriefcase className="mr-2 text-blue-500" /> Job Information
							</h2>
							<div className="bg-gray-50 p-4 rounded-md">
								<h3 className="text-md font-medium">{application.position}</h3>
								<p className="text-sm text-gray-600">
									{application.company_name}
								</p>
							</div>
						</div>

						{/* Applicant Information */}
						<div className="mb-8">
							<h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
								<FaUser className="mr-2 text-blue-500" /> Applicant Information
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="bg-gray-50 p-4 rounded-md">
									<p className="text-sm text-gray-500">Full Name</p>
									<p className="font-medium">
										{application.first_name} {application.last_name}
									</p>
								</div>
								<div className="bg-gray-50 p-4 rounded-md flex items-center">
									<FaEnvelope className="text-gray-400 mr-2" />
									<div>
										<p className="text-sm text-gray-500">Email</p>
										<p className="font-medium">{application.email}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Resume */}
						<div className="mb-8">
							<h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
								<FaFilePdf className="mr-2 text-blue-500" /> Resume
							</h2>
							<div className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
								<div className="flex items-center">
									<div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center mr-4">
										<FaFilePdf className="text-blue-600" />
									</div>
									<div>
										<p className="font-medium">Applicant Resume</p>
										<p className="text-sm text-gray-500">PDF Document</p>
									</div>
								</div>
								<button
									onClick={() => handleResumeDownload(application)}
									title="Download Resume"
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
								>
									<FaDownload className="mr-2" /> Download
								</button>
							</div>
						</div>

						{/* Cover Letter */}
						{application.cover_letter && (
							<div className="mb-8">
								<h2 className="text-lg font-semibold text-gray-800 mb-3">
									Cover Letter
								</h2>
								<div className="bg-gray-50 p-4 rounded-md">
									<p className="text-gray-700 whitespace-pre-wrap">
										{application.cover_letter}
									</p>
								</div>
							</div>
						)}

						{/* Additional Questions */}
						{(application.motivationquestion || application.uniquequestion) && (
							<div className="mb-8">
								<h2 className="text-lg font-semibold text-gray-800 mb-3">
									Additional Questions
								</h2>

								{application.motivationquestion && (
									<div className="bg-gray-50 p-4 rounded-md mb-4">
										<p className="font-medium mb-2">
											Why are you interested in this position?
										</p>
										<p className="text-gray-700">
											{application.motivationquestion}
										</p>
									</div>
								)}

								{application.uniquequestion && (
									<div className="bg-gray-50 p-4 rounded-md">
										<p className="font-medium mb-2">Why should we hire you?</p>
										<p className="text-gray-700">
											{application.uniquequestion}
										</p>
									</div>
								)}
							</div>
						)}

						{/* Action Buttons */}
						{application.status === "pending" && (
							<div className="mt-8 flex flex-wrap gap-4">
								<button
									onClick={() => handleStatusChange("approved")}
									className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center"
								>
									<FaCheckCircle className="mr-2" /> Approve Application
								</button>
								<button
									onClick={() => handleStatusChange("rejected")}
									className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md flex items-center"
								>
									<FaTimesCircle className="mr-2" /> Reject Application
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewApplication;
