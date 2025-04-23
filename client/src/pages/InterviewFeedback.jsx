import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInterviewStore } from "../store/useInterviewStore";
import {
	FaArrowLeft,
	FaStar,
	FaStarHalfAlt,
	FaRegStar,
	FaCheck,
	FaBriefcase,
	FaBuilding,
	FaCalendarAlt,
	FaChartBar,
	FaComments,
	FaUser,
	FaThumbsUp,
	FaThumbsDown,
	FaHandsHelping,
} from "react-icons/fa";
import { Loading } from "../components";
import { formatDate } from "../utils/helper";

const InterviewFeedback = () => {
	const { interviewId } = useParams();
	const navigate = useNavigate();
	const { interview, isLoading, error, getInterviewById } = useInterviewStore();
	const [activeTab, setActiveTab] = useState("feedback");

	useEffect(() => {
		if (interviewId) {
			getInterviewById(interviewId);
		}
	}, [interviewId, getInterviewById]);

	// Helper function to render rating stars
	const renderRatingStars = (rating) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;

		// Add full stars
		for (let i = 0; i < fullStars; i++) {
			stars.push(<FaStar key={`full-${i}`} className="text-yellow-500" />);
		}

		// Add half star if needed
		if (hasHalfStar) {
			stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
		}

		// Add empty stars
		const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
		for (let i = 0; i < emptyStars; i++) {
			stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />);
		}

		return <div className="flex items-center gap-1">{stars}</div>;
	};

	// Helper function to get recommendation icon and color
	const getRecommendationDetails = (recommendation) => {
		if (!recommendation)
			return {
				icon: <FaHandsHelping />,
				color: "text-gray-500",
				bgColor: "bg-gray-100",
			};

		switch (recommendation.toLowerCase()) {
			case "highly recommended":
				return {
					icon: <FaThumbsUp className="text-lg" />,
					color: "text-green-700",
					bgColor: "bg-green-100",
				};
			case "recommended":
				return {
					icon: <FaCheck className="text-lg" />,
					color: "text-blue-700",
					bgColor: "bg-blue-100",
				};
			case "consider with reservations":
				return {
					icon: <FaHandsHelping className="text-lg" />,
					color: "text-orange-700",
					bgColor: "bg-orange-100",
				};
			case "not recommended":
				return {
					icon: <FaThumbsDown className="text-lg" />,
					color: "text-red-700",
					bgColor: "bg-red-100",
				};
			default:
				return {
					icon: <FaHandsHelping className="text-lg" />,
					color: "text-gray-500",
					bgColor: "bg-gray-100",
				};
		}
	};

	// Render loading state
	if (isLoading) {
		return <Loading />;
	}

	// Render error state
	if (error || !interview) {
		return (
			<div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto mt-10">
				<h2 className="text-2xl font-bold text-red-600 mb-4">
					Error Loading Interview
				</h2>
				<p className="text-gray-700 mb-6">{error || "Interview not found"}</p>
				<button
					onClick={() => navigate("/seeker")}
					className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
				>
					<FaArrowLeft /> Back to Dashboard
				</button>
			</div>
		);
	}

	// Get recommendation styling
	const recommendationDetails = getRecommendationDetails(
		interview.feedback_recommendation
	);

	return (
		<div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10 px-4">
			{/* Back button */}
			<div className="max-w-5xl mx-auto mb-6">
				<button
					onClick={() => navigate("/seeker")}
					className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition shadow-sm"
				>
					<FaArrowLeft /> Back to Dashboard
				</button>
			</div>

			{/* Main content container */}
			<div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
				{/* Interview header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
					<h1 className="text-2xl sm:text-3xl font-bold">Interview Feedback</h1>
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3">
						<div className="flex items-center gap-2">
							<FaBriefcase />
							<span>{interview.job_title || "Software Engineer"}</span>
						</div>
						<div className="flex items-center gap-2">
							<FaBuilding />
							<span>{interview.company_name || "Company"}</span>
						</div>
						<div className="flex items-center gap-2">
							<FaCalendarAlt />
							<span>
								{interview.completed_at
									? formatDate(new Date(interview.completed_at), {
											addSuffix: true,
										})
									: "Recently"}
							</span>
						</div>
					</div>
				</div>

				{/* Navigation tabs */}
				<div className="border-b border-gray-200">
					<div className="flex">
						<button
							className={`py-3 px-6 font-medium text-sm focus:outline-none ${
								activeTab === "feedback"
									? "border-b-2 border-blue-600 text-blue-600"
									: "text-gray-500 hover:text-gray-700"
							}`}
							onClick={() => setActiveTab("feedback")}
						>
							<div className="flex items-center gap-2">
								<FaChartBar /> Feedback & Ratings
							</div>
						</button>
						<button
							className={`py-3 px-6 font-medium text-sm focus:outline-none ${
								activeTab === "transcript"
									? "border-b-2 border-blue-600 text-blue-600"
									: "text-gray-500 hover:text-gray-700"
							}`}
							onClick={() => setActiveTab("transcript")}
						>
							<div className="flex items-center gap-2">
								<FaComments /> Interview Transcript
							</div>
						</button>
					</div>
				</div>

				{/* Tab content */}
				<div className="p-6">
					{activeTab === "feedback" ? (
						<div className="space-y-8">
							{/* Overall score */}
							<div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
									<h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
										Overall Performance
									</h2>
									<div className="flex items-center gap-3">
										<div className="text-3xl font-bold text-blue-700">
											{interview.score || "N/A"}
										</div>
										<div className="text-gray-500 text-sm">out of 10</div>
									</div>
								</div>

								{/* Recommendation banner */}
								<div
									className={`mt-5 p-4 rounded-lg ${recommendationDetails.bgColor}`}
								>
									<div className="flex items-center">
										<div className={`mr-4 ${recommendationDetails.color}`}>
											{recommendationDetails.icon}
										</div>
										<div>
											<h3
												className={`font-semibold ${recommendationDetails.color}`}
											>
												{interview.feedback_recommendation ||
													"Feedback Unavailable"}
											</h3>
											<p className="text-gray-700 mt-1">
												{interview.feedback_recommendation_msg ||
													"No detailed recommendation available."}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Summary */}
							<div>
								<h2 className="text-xl font-semibold text-gray-800 mb-3">
									Interview Summary
								</h2>
								<p className="text-gray-700 bg-white p-4 border border-gray-200 rounded-lg">
									{interview.feedback_summary || "No summary available."}
								</p>
							</div>

							{/* Detailed ratings */}
							<div>
								<h2 className="text-xl font-semibold text-gray-800 mb-4">
									Detailed Ratings
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Technical Skills */}
									<div className="bg-white p-4 border border-gray-200 rounded-lg">
										<div className="flex justify-between items-center mb-2">
											<h3 className="font-medium text-gray-800">
												Technical Skills
											</h3>
											<span className="font-bold text-blue-700">
												{interview.rating_technical}/10
											</span>
										</div>
										{renderRatingStars(interview.rating_technical || 0)}
									</div>

									{/* Communication */}
									<div className="bg-white p-4 border border-gray-200 rounded-lg">
										<div className="flex justify-between items-center mb-2">
											<h3 className="font-medium text-gray-800">
												Communication
											</h3>
											<span className="font-bold text-blue-700">
												{interview.rating_communication}/10
											</span>
										</div>
										{renderRatingStars(interview.rating_communication || 0)}
									</div>

									{/* Problem Solving */}
									<div className="bg-white p-4 border border-gray-200 rounded-lg">
										<div className="flex justify-between items-center mb-2">
											<h3 className="font-medium text-gray-800">
												Problem Solving
											</h3>
											<span className="font-bold text-blue-700">
												{interview.rating_problem_solving}/10
											</span>
										</div>
										{renderRatingStars(interview.rating_problem_solving || 0)}
									</div>

									{/* Experience */}
									<div className="bg-white p-4 border border-gray-200 rounded-lg">
										<div className="flex justify-between items-center mb-2">
											<h3 className="font-medium text-gray-800">Experience</h3>
											<span className="font-bold text-blue-700">
												{interview.rating_experience}/10
											</span>
										</div>
										{renderRatingStars(interview.rating_experience || 0)}
									</div>
								</div>
							</div>
						</div>
					) : (
						/* Transcript tab content */
						<div>
							<h2 className="text-xl font-semibold text-gray-800 mb-4">
								Interview Transcript
							</h2>
							{interview.transcript && interview.transcript.length > 0 ? (
								<div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[600px] overflow-y-auto">
									{interview.transcript.map((message, index) => (
										<div
											key={index}
											className={`mb-4 p-3 rounded-lg ${
												message.speaker === "Agent"
													? "bg-blue-50 border-l-4 border-blue-400"
													: "bg-gray-100 border-l-4 border-purple-400"
											}`}
										>
											<div className="flex items-center gap-2 mb-1">
												<span
													className={`font-medium ${
														message.speaker === "Agent"
															? "text-blue-700"
															: "text-purple-700"
													}`}
												>
													{message.speaker === "Agent" ? (
														<>
															<FaUser className="inline mr-1" /> AI Interviewer
														</>
													) : (
														<>
															<FaUser className="inline mr-1" /> You
														</>
													)}
												</span>
												{message.time && (
													<span className="text-xs text-gray-500">
														{message.time}
													</span>
												)}
											</div>
											<div className="text-gray-700">{message.text}</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-200">
									<FaComments className="text-5xl text-gray-300 mx-auto mb-4" />
									<p className="text-gray-500">Transcript not available</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default InterviewFeedback;
