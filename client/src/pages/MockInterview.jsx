import React, { useState, useEffect } from "react";
import {
	IoBusinessOutline,
	IoBriefcaseOutline,
	IoTimeOutline,
	IoDocumentTextOutline,
	IoWarningOutline,
	IoInformationCircleOutline,
	IoPlayCircleOutline,
	IoArrowBackOutline,
} from "react-icons/io5";
import { useApplicationStore } from "../store/useApplicationStore";
import { useParams, useNavigate } from "react-router-dom";
import { reminders } from "../data";
import { toast } from "react-toastify";

const MockInterview = () => {
	const [application, setApplication] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const { getSeekerApplicationsById } = useApplicationStore();
	const navigate = useNavigate();

	const { id } = useParams();

	useEffect(() => {
		const fetchApplication = async () => {
			if (id) {
				console.log("ID:", id);
				setIsLoading(true);
				const result = await getSeekerApplicationsById(id);
				if (result) {
					setApplication(result);
					console.log("Application data:", result);
				}
				setIsLoading(false);
			}
		};

		fetchApplication();
	}, [id, getSeekerApplicationsById]);

	const handleStartInterview = () => {
		if (application) {
			navigate(`/interview-session/${id}/${application.job_id}`); // Navigate to the interview page with application ID
		} else {
			toast.error(
				"Unable to satrt interview. Application not found. Please try again."
			);
		}
	};

	const handleBackToApplications = () => {
		navigate(-1); // Go back to previous page
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto">
				{/* Header with back button */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
					<button
						onClick={handleBackToApplications}
						className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
					>
						<IoArrowBackOutline className="w-5 h-5" />
						Back to Applications
					</button>

					<h1 className="text-2xl font-bold text-gray-800 flex items-center">
						<span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
							Mock Interview
						</span>
						<span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
							Practice Session
						</span>
					</h1>
				</div>

				{/* Loading state */}
				{isLoading ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				) : (
					<>
						{/* Interview Start Button - Prominently displayed */}
						<div className="mb-8 flex justify-center">
							<button
								onClick={handleStartInterview}
								className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2"
							>
								<IoPlayCircleOutline className="w-5 h-5" />
								Start Interview Session
							</button>
						</div>

						<div className="mx-auto max-w-3xl">
							{/* Job Information */}
							<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
								<h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
									<span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
										<IoBriefcaseOutline className="w-4 h-4 text-purple-600" />
									</span>
									Job Information
								</h2>
								<div className="space-y-4">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
											<IoBriefcaseOutline className="w-5 h-5" />
										</div>
										<div className="ml-4">
											<h2 className="text-sm text-gray-500 font-medium">
												Position
											</h2>
											<p className="text-gray-800 font-semibold">
												{application ? application.title : "Not available"}
											</p>
										</div>
									</div>

									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
											<IoBusinessOutline className="w-5 h-5" />
										</div>
										<div className="ml-4">
											<h2 className="text-sm text-gray-500 font-medium">
												Company
											</h2>
											<p className="text-gray-800 font-semibold">
												{application
													? application.company_name
													: "Not available"}
											</p>
										</div>
									</div>

									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
											<IoTimeOutline className="w-5 h-5" />
										</div>
										<div className="ml-4">
											<h2 className="text-sm text-gray-500 font-medium">
												Duration
											</h2>
											<p className="text-gray-800 font-semibold">15 mins</p>
										</div>
									</div>

									<div className="flex items-center">
										<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
											<IoDocumentTextOutline className="w-5 h-5" />
										</div>
										<div className="ml-4">
											<h2 className="text-sm text-gray-500 font-medium">
												Job Type
											</h2>
											<p className="text-gray-800 font-semibold">
												{application ? application.job_type : "Full-time"}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Reminders - now shows up below job info */}
							<div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
								<h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
									<span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-2">
										<IoWarningOutline className="w-4 h-4 text-amber-600" />
									</span>
									Important Reminders
								</h2>
								<div className="space-y-3">
									{reminders.map((reminder, index) => (
										<div
											key={index}
											className={`p-4 rounded-lg border ${
												reminder.type === "warning"
													? "bg-amber-50 border-amber-100"
													: "bg-blue-50 border-blue-100"
											}`}
										>
											<div className="flex items-center">
												<div
													className={`mr-3 ${reminder.type === "warning" ? "text-amber-500" : "text-blue-500"}`}
												>
													{reminder.type === "warning" ? (
														<IoWarningOutline className="w-5 h-5" />
													) : (
														<IoInformationCircleOutline className="w-5 h-5" />
													)}
												</div>
												<p
													className={`text-sm font-medium ${reminder.type === "warning" ? "text-amber-700" : "text-blue-700"}`}
												>
													{reminder.message}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default MockInterview;
