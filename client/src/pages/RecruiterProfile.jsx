import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBriefcase, FaUsers, FaPlus } from "react-icons/fa";

import { IoMdNotifications } from "react-icons/io";
import { useAuthStore } from "../store/useAuthStore";
import { useJobStore } from "../store/useJobStore";
import { JobCard, Sidebar, MobileToggleButton } from "../components";
import NotificationModal from "../components/NotificationModal";
import { useNotificationStore } from "../store/useNotificationStore";
import { useApplicationStore } from "../store/useApplicationStore";

const RecruiterProfile = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { jobs, getJobs, error, getActiveJobsCount, activeJobsCount } =
		useJobStore();
	const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
	const { unreadCount, fetchUnreadCount } = useNotificationStore();
	const [isSidebarOpen, setSidebarOpen] = useState(false);
	const { getApplicationsCount, applicationCount } = useApplicationStore();

	// Existing useEffect hooks and other functions
	useEffect(() => {
		getJobs();
	}, [getJobs]);

	useEffect(() => {
		getApplicationsCount();
	}, [getApplicationsCount]);

	useEffect(() => {
		getActiveJobsCount();
	}, [getActiveJobsCount]);

	useEffect(() => {
		fetchUnreadCount();
		const interval = setInterval(fetchUnreadCount, 30000);
		return () => clearInterval(interval);
	}, [fetchUnreadCount]);

	const formatDate = () => {
		const options = {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
		};
		return new Date().toLocaleDateString("en-US", options);
	};

	const handlePostNewJob = () => {
		navigate("/post-job");
	};

	const handleCloseModal = () => {
		setIsNotificationModalOpen(false);
		fetchUnreadCount();
	};

	if (!user) {
		return null;
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="bg-white p-8 rounded-lg shadow-lg text-center">
					<p className="text-red-500 font-medium">Error: {error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-white">
			{/* Mobile sidebar toggle button - simplified */}
			<MobileToggleButton
				isSidebarOpen={isSidebarOpen}
				setSidebarOpen={setSidebarOpen}
			/>

			{/* Sidebar - cleaner styling */}
			<Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

			{/* Main Content - cleaner styling */}
			<div className="flex-1 min-w-0 overflow-auto">
				<div className="p-6">
					{/* Welcome Header - simplified */}
					<div className="flex justify-between items-center mb-6">
						<div>
							<h1 className="text-xl font-semibold text-gray-800">
								Welcome, {user.first_name || "Recruiter"}
							</h1>
							<p className="text-sm text-gray-500">{formatDate()}</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="relative">
								{unreadCount > 0 && (
									<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
										{unreadCount > 9 ? "9+" : unreadCount}
									</span>
								)}
								<button
									className="text-gray-400 hover:text-gray-600"
									onClick={() => setIsNotificationModalOpen(true)}
								>
									<IoMdNotifications size={20} />
								</button>
							</div>
							<div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
								{user.photo ? (
									<img
										src={user.photo}
										alt={user.first_name}
										className="w-full h-full rounded-full"
									/>
								) : (
									<>
										{user.first_name ? user.first_name[0].toUpperCase() : "R"}
									</>
								)}
							</div>
						</div>
					</div>

					{/* Metrics - simplified cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						<div className="bg-white border border-gray-100 rounded-md p-5">
							<div className="flex justify-between items-center">
								<div>
									<h3 className="text-xs font-medium text-gray-500 uppercase">
										Active Jobs
									</h3>
									<p className="text-2xl font-semibold text-gray-800 mt-1">
										{activeJobsCount}
									</p>
								</div>
								<div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
									<FaBriefcase className="text-blue-600" size={16} />
								</div>
							</div>
						</div>

						<div className="bg-white border border-gray-100 rounded-md p-5">
							<div className="flex justify-between items-center">
								<div>
									<h3 className="text-xs font-medium text-gray-500 uppercase">
										Applications Received
									</h3>
									<p className="text-2xl font-semibold text-gray-800 mt-1">
										{applicationCount}
									</p>
								</div>
								<div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
									<FaUsers className="text-blue-600" size={16} />
								</div>
							</div>
						</div>
					</div>

					{/* Job Listings - cleaner styling */}
					<div className="bg-white border border-gray-100 rounded-md mb-6">
						<div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<h2 className="text-lg font-medium text-gray-800">
								Your Job Listings
							</h2>
							<button
								onClick={handlePostNewJob}
								className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
							>
								<FaPlus size={12} /> Post New Job
							</button>
						</div>

						<div className="p-5">
							<div className="space-y-4">
								{jobs.length > 0 ? (
									jobs.map((job) => <JobCard key={job.id} job={job} />)
								) : (
									<div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
										<FaBriefcase className="mx-auto text-gray-300 text-2xl mb-2" />
										<p className="text-gray-500 mb-1">No jobs posted yet</p>
										<p className="text-gray-400 text-sm mb-3">
											Create your first job posting to attract candidates
										</p>
										<button
											onClick={handlePostNewJob}
											className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm inline-flex items-center gap-1"
										>
											<FaPlus size={10} /> Create Job
										</button>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Notification Modal - keep as is */}
					<NotificationModal
						isOpen={isNotificationModalOpen}
						onClose={handleCloseModal}
					/>
				</div>
			</div>

			{/* Overlay for mobile - simplified */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-white bg-opacity-30 z-30 md:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}
		</div>
	);
};

// Helper Components

export default RecruiterProfile;
