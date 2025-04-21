import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	FaBriefcase,
	FaCommentDots,
	FaHome,
	FaBars,
	FaTimes,
	FaArrowLeft,
	FaSearch,
} from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";
import { SidebarItem } from "../components";
import { useJobStore } from "../store/useJobStore";

// Import the new tab components
// import DashboardTab from "../components/seeker/DashboardTab";
// import MessagesTab from "../components/seeker/MessagesTab";
// import AppliedJobsTab from "../components/seeker/AppliedJobsTab";
import { DashboardTab, MessagesTab, AppliedJobsTab } from "../components";

const SeekerProfile = () => {
	// Your existing state and hooks
	const navigate = useNavigate();
	const { user, loadUser } = useAuthStore();
	const [activeTab, setActiveTab] = useState("dashboard");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { getJobs, getAppliedJobCount, appliedCount } = useJobStore();

	const [stats, setStats] = useState({
		interviews: 12,
		appliedThisWeek: 3,
		interviewsThisWeek: 2,
	});

	const [interviewHistory, setInterviewHistory] = useState([
		{
			id: 1,
			title: "Frontend Developer",
			company: "Google",
			date: "March 15, 2025",
			score: 85,
		},
		{
			id: 2,
			title: "UI/UX Designer",
			company: "Meta",
			date: "March 12, 2025",
			score: 92,
		},
		{
			id: 3,
			title: "Product Designer",
			company: "Apple",
			date: "March 10, 2025",
			score: 78,
		},
	]);

	// Your existing effects and handlers
	useEffect(() => {
		getJobs();
	}, [getJobs]);

	useEffect(() => {
		getAppliedJobCount();
	}, [getAppliedJobCount]);

	useEffect(() => {
		if (!user) {
			loadUser();
		}
	}, [user, loadUser]);

	const handleBackToJobSearch = () => {
		navigate("/jobs");
	};

	const navigateToSection = (section) => {
		setActiveTab(section);
		setIsMobileMenuOpen(false);
	};

	if (!user) {
		return null;
	}

	const isSeeker = user.role === "seeker";
	if (!isSeeker) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="bg-white p-6 rounded-lg shadow-md text-center">
					<h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
					<p className="text-gray-600">You do not have access to this page.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col md:flex-row h-screen bg-gray-50 relative">
			{/* Mobile Menu Toggle Button */}
			<button
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				className="md:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-md shadow-md"
				aria-label="Toggle menu"
			>
				{isMobileMenuOpen ? <FaTimes /> : <FaBars />}
			</button>

			{/* Back to Job Search Button - Mobile */}
			<button
				onClick={handleBackToJobSearch}
				className="md:hidden fixed top-4 right-4 z-30 bg-white p-2 rounded-md shadow-md flex items-center text-blue-600"
			>
				<FaArrowLeft className="mr-1" /> <span className="text-sm">Jobs</span>
			</button>

			{/* Sidebar */}
			<div
				className={`${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				} md:translate-x-0 fixed md:static md:flex-shrink-0 top-0 z-20 w-64 h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}
			>
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center">
						<div className="bg-blue-600 text-white p-2 rounded-md mr-2">
							<FaBriefcase />
						</div>
						<h1 className="text-lg font-bold">JobSeeker</h1>
					</div>
				</div>
				<div className="py-4 flex-grow overflow-y-auto">
					<SidebarItem
						icon={<FaHome size={18} />}
						text="Dashboard"
						active={activeTab === "dashboard"}
						onClick={() => navigateToSection("dashboard")}
					/>
					<SidebarItem
						icon={<FaCommentDots size={18} />}
						text="Messages"
						active={activeTab === "messages"}
						onClick={() => navigateToSection("messages")}
					/>
					<SidebarItem
						icon={<FaBriefcase size={18} />}
						text="Applied Jobs"
						active={activeTab === "applied"}
						onClick={() => navigateToSection("applied")}
					/>
					<div className="px-4 mt-8">
						<button
							onClick={handleBackToJobSearch}
							className="hidden md:flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
						>
							<FaSearch className="mr-2" /> Back to Job Search
						</button>
					</div>
				</div>
			</div>

			{/* Overlay when mobile menu is open */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-white bg-opacity-50 z-10 md:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Main Content - Using the new components */}
			<div className="flex-1 overflow-auto pt-16 md:pt-0">
				<div className="p-4 md:p-8">
					{activeTab === "dashboard" && (
						<DashboardTab
							user={user}
							appliedCount={appliedCount}
							stats={stats}
							interviewHistory={interviewHistory}
						/>
					)}

					{activeTab === "messages" && <MessagesTab />}

					{activeTab === "applied" && (
						<AppliedJobsTab handleBackToJobSearch={handleBackToJobSearch} />
					)}
				</div>
			</div>
		</div>
	);
};

export default SeekerProfile;
