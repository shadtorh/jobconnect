import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
	FaDownload,
	FaEye,
	FaCheck,
	FaTimes,
	FaSearch,
	FaFilter,
	FaTimes as FaClose,
} from "react-icons/fa";
import { useApplicationStore } from "../store/useApplicationStore";
import { formatDate } from "../utils/helper";
import { toast } from "react-toastify";
import { Sidebar, MobileToggleButton, StatusBadge } from "../components";

const Applications = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const {
		getJobApplications,
		applications,
		isLoading,
		updateApplicationStatus,
		downloadResume,
	} = useApplicationStore();

	const [isSidebarOpen, setSidebarOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	// Fetch application data when component mounts
	useEffect(() => {
		getJobApplications();
	}, [getJobApplications]);

	console.log("Applications:", applications);

	// Add a download handler function
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

	const handleStatusChange = async (applicationId, status) => {
		try {
			await updateApplicationStatus(applicationId, status);
		} catch (error) {
			toast.error("Failed to update application status", error);
		}
	};

	const handleViewApplication = (applicationId) => {
		console.log("View application ID:", applicationId);

		navigate(`/recruiter/applications/${applicationId}`);
	};

	// Filter applications based on search term and status
	const filteredApplications =
		applications?.filter((app) => {
			const matchesSearch = app.email
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === "all" || app.status === statusFilter;
			return matchesSearch && matchesStatus;
		}) || [];

	return (
		// Responsive container styles
		<div className="flex h-screen bg-white overflow-hidden">
			{/* Mobile sidebar toggle button */}
			<MobileToggleButton
				isSidebarOpen={isSidebarOpen}
				setSidebarOpen={setSidebarOpen}
			/>

			{/* Sidebar - matching the RecruiterProfile style */}
			<Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
			{/* Improve main content container */}
			<div className="flex-1 min-w-0 overflow-auto">
				<div className="p-4 md:p-6">
					{/* Header */}
					<div className="flex justify-between items-center mb-6">
						<div>
							<h1 className="text-xl font-semibold text-gray-800">
								Applications
							</h1>
							<p className="text-sm text-gray-500">
								Manage all job applications
							</p>
						</div>
						<div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
							{user?.first_name ? user.first_name[0] : "R"}
						</div>
					</div>

					{/* Search and Filter - cleaner styling */}
					<div className="bg-white border border-gray-100 rounded-md mb-6">
						<div className="p-4 flex flex-col sm:flex-row gap-3">
							<div className="relative flex-1">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<FaSearch className="text-gray-400" size={14} />
								</div>
								<input
									type="text"
									placeholder="Search applications by email..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
								/>
							</div>

							<div className="flex items-center sm:w-48">
								<div className="flex items-center w-full border border-gray-200 rounded-md">
									<div className="px-3 py-2 bg-gray-50 border-r border-gray-200 rounded-l-md">
										<FaFilter className="text-gray-400" size={14} />
									</div>
									<select
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
										className="px-4 py-2 w-full rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
									>
										<option value="all">All Status</option>
										<option value="pending">Pending</option>
										<option value="approved">Approved</option>
										<option value="rejected">Rejected</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					{/* Applications Table - cleaner styling */}
					{/* Make the table container responsive */}
					<div className="bg-white border border-gray-100 rounded-md overflow-hidden">
						{isLoading ? (
							<div className="flex justify-center items-center py-20">
								<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
							</div>
						) : applications?.length === 0 ? (
							<div className="p-8 text-center">
								<p className="text-gray-500">No applications found.</p>
							</div>
						) : (
							<div className="overflow-x-auto sm:overflow-visible">
								<table className="w-full table-fixed divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											{/* Make columns responsive with appropriate widths */}
											<th
												scope="col"
												className="w-12 px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												ID
											</th>

											<th
												scope="col"
												className="w-32 px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Name
											</th>

											<th
												scope="col"
												className="w-40 px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
											>
												Email
											</th>
											<th
												scope="col"
												className="w-32 px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Position
											</th>
											<th
												scope="col"
												className="w-28 px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
											>
												Applied On
											</th>
											<th
												scope="col"
												className="w-20 px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Resume
											</th>
											<th
												scope="col"
												className="w-20 px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Status
											</th>
											<th
												scope="col"
												className="w-24 px-2 md:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{filteredApplications.map((application) => (
											<tr key={application.id} className="hover:bg-gray-50">
												{/* ID column */}
												<td className="px-2 md:px-3 py-3 whitespace-nowrap text-sm text-gray-700">
													#{application.id}
												</td>
												{/* Name column */}
												<td className="px-2 md:px-3 py-3 whitespace-nowrap text-sm text-gray-700">
													<div className="truncate">
														{application.first_name} {application.last_name}
													</div>
												</td>
												{/* Email column - hide on small screens */}
												<td className="px-2 md:px-3 py-3 whitespace-nowrap hidden md:table-cell">
													<div className="text-sm text-gray-700 truncate">
														{application.email}
													</div>
												</td>
												{/* Position column */}
												<td className="px-2 md:px-3 py-3 whitespace-nowrap">
													<div className="text-sm text-gray-700 truncate">
														{application.position}
													</div>
													<div className="text-xs text-gray-500 truncate">
														{application.company_name}
													</div>
												</td>
												{/* Applied On column - hide on small screens */}
												<td className="px-2 md:px-3 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
													{formatDate(application.created_at)}
												</td>
												{/* Resume column */}
												<td className="px-2 md:px-3 py-3 whitespace-nowrap">
													<button
														className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
														onClick={() => handleResumeDownload(application)}
														title="Download Resume"
													>
														<FaDownload size={14} />
														<span className="text-xs hidden sm:inline">
															Resume
														</span>
													</button>
												</td>
												{/* Status column */}
												<td className="px-2 md:px-3 py-3 whitespace-nowrap">
													<StatusBadge status={application.status} />
												</td>
												{/* Actions column */}
												<td className="px-2 md:px-3 py-3 whitespace-nowrap text-sm font-medium">
													<div className="flex space-x-1 md:space-x-2">
														<button
															onClick={() =>
																handleViewApplication(application.id)
															}
															className="text-blue-600 hover:text-blue-700 p-1"
															title="View Application"
														>
															<FaEye size={14} />
														</button>

														{application.status === "pending" && (
															<>
																<button
																	onClick={() =>
																		handleStatusChange(
																			application.id,
																			"approved"
																		)
																	}
																	className="text-green-600 hover:text-green-700 p-1"
																	title="Approve"
																>
																	<FaCheck size={14} />
																</button>
																<button
																	onClick={() =>
																		handleStatusChange(
																			application.id,
																			"rejected"
																		)
																	}
																	className="text-red-600 hover:text-red-700 p-1"
																	title="Reject"
																>
																	<FaTimes size={14} />
																</button>
															</>
														)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Overlay for mobile sidebar */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}
		</div>
	);
};

export default Applications;
