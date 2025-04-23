import React, { useEffect, useState } from "react";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useApplicationStore } from "../../store/useApplicationStore";
import { formatDate } from "../../utils/helper";
import Pagination from "../Pagination";
import StatusBadge from "../ApplicationsStatusBadge/StatusBadge";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";

const AppliedJobsTab = ({ handleBackToJobSearch }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [jobTypeFilter, setJobTypeFilter] = useState("All Job Types");
	const [statusFilter, setStatusFilter] = useState("All Status");
	const { getSeekerApplications, applications, isLoading } =
		useApplicationStore();

	const navigate = useNavigate();

	// Fetch applications when the component mounts
	useEffect(() => {
		getSeekerApplications();
	}, [getSeekerApplications]);

	// Filter applications based on selected filters
	const filteredApplications = applications.filter((application) => {
		const matchesJobType =
			jobTypeFilter === "All Job Types" ||
			application.job_type === jobTypeFilter;

		const matchesStatus =
			statusFilter === "All Status" || application.status === statusFilter;

		return matchesJobType && matchesStatus;
	});

	// Pagination logic
	const itemsPerPage = 3; // Number of items per page
	const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

	// Calculate which items to show on the current page
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentPageItems = filteredApplications.slice(startIndex, endIndex);

	const handlePageChange = (page) => {
		setCurrentPage(page);
		// Scroll to top of the component when page changes
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleTakeInterview = (application) => {
		// Navigate directly to interview session instead of application details
		navigate(`/interview-session/${application.id}/${application.job_id}`);
	};

	// Get job type badge styling
	const getJobTypeBadgeClass = (type) => {
		switch (type) {
			case "Full-time":
				return "bg-blue-100 text-blue-800";
			case "Remote":
				return "bg-purple-100 text-purple-800";
			case "Part-time":
				return "bg-orange-100 text-orange-800";
			case "Freelance":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Get company logo background
	const getCompanyBgClass = (company) => {
		switch (company) {
			case "Google":
				return "bg-blue-100 text-blue-800";
			case "Airbnb":
				return "bg-red-100 text-red-800";
			case "Microsoft":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (isLoading) {
		<Loading />;
	}

	return (
		<div className="w-full max-w-full overflow-hidden">
			{/* Header - More responsive with better spacing and alignment */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
				<h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
					Applied Jobs
				</h1>
				<button
					onClick={handleBackToJobSearch}
					className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
				>
					<FaSearch className="mr-2" size={14} />
					<span>Find More Jobs</span>
				</button>
			</div>

			{/* Filters - Better mobile layout with full width on small screens */}
			<div className="flex flex-col xs:flex-row flex-wrap gap-2 mb-4 sm:mb-6">
				<div className="flex-1 min-w-[160px]">
					<select
						className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						<option>All Status</option>
						<option>Pending</option>
						<option>Accepted</option>
						<option>Rejected</option>
					</select>
				</div>
				<div className="flex-1 min-w-[160px]">
					<select
						className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={jobTypeFilter}
						onChange={(e) => setJobTypeFilter(e.target.value)}
					>
						<option>All Job Types</option>
						<option>Full-Time</option>
						<option>Part-Time</option>
						<option>Remote</option>
					</select>
				</div>
			</div>

			{/* Card-based layout for small screens, table for larger screens */}
			<div className="bg-white rounded-lg shadow-sm overflow-hidden">
				{/* Mobile card view (shown below 640px) */}
				<div className="sm:hidden">
					{currentPageItems.length === 0 ? (
						<div className="p-6 text-center text-gray-500">
							No applications found matching your filters.
						</div>
					) : (
						currentPageItems.map((application) => (
							<div
								key={application.id}
								className="border-b border-gray-200 p-4"
							>
								<div className="flex justify-between items-start mb-2">
									<div>
										<h3 className="font-medium text-gray-900">
											{application.title}
										</h3>
										<div className="flex items-center mt-1 text-xs text-gray-500">
											<div
												className={`w-5 h-5 rounded-full flex items-center justify-center ${getCompanyBgClass(application.company_name)} mr-2`}
											>
												{application.company_name
													? application.company_name[0].toUpperCase()
													: "C"}
											</div>
											<span>{application.company_name}</span>
										</div>
									</div>
									{/* <span
										className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(application.status)}`}
									>
										{application.status}
									</span> */}
									<StatusBadge status={application.status} />
								</div>

								<div className="flex items-center justify-between mt-3">
									<div className="flex items-center">
										<FaCalendarAlt className="text-gray-400 mr-1" size={12} />
										<span className="text-xs text-gray-500">
											Applied on: {formatDate(application.created_at)}
										</span>
									</div>
									<span
										className={`px-2 py-1 text-xs rounded-full ${getJobTypeBadgeClass(application.job_type)}`}
									>
										{application.job_type}
									</span>
								</div>

								<div className="flex mt-3 pt-3 border-t border-gray-100 gap-3">
									<button
										onClick={() => handleTakeInterview(application)}
										className="text-blue-600 text-xs font-medium hover:text-blue-800"
									>
										Take Interview
									</button>
								</div>
							</div>
						))
					)}
				</div>

				{/* Table view (hidden on mobile, shown on sm screens and up) */}
				<div className="hidden sm:block w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 md:px-6"
								>
									Job Title
								</th>
								<th
									scope="col"
									className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 md:px-6 hidden md:table-cell"
								>
									Company
								</th>
								<th
									scope="col"
									className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 md:px-6"
								>
									Type
								</th>
								<th
									scope="col"
									className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 md:px-6"
								>
									Status
								</th>
								<th
									scope="col"
									className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-4 md:px-6"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{currentPageItems.length === 0 && !isLoading ? (
								<tr>
									<td
										colSpan="5"
										className="px-6 py-12 text-center text-gray-500"
									>
										No applications found matching your filters.
									</td>
								</tr>
							) : (
								currentPageItems.map((application) => (
									<tr key={application.id} className="hover:bg-gray-50">
										<td className="px-3 py-4 sm:px-4 md:px-6">
											<div className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">
												{application.title}
											</div>
											<div className="text-xs text-gray-500 whitespace-nowrap">
												Applied on: {formatDate(application.created_at)}
											</div>
											{/* Company shown on small screens, hidden on md+ */}
											<div className="md:hidden text-xs text-gray-700 mt-1 flex items-center">
												<div
													className={`w-4 h-4 rounded-full flex items-center justify-center ${getCompanyBgClass(application.company_name)} mr-1`}
												>
													{application.company_name
														? application.company_name[0].toUpperCase()
														: "C"}
												</div>
												{application.company_name}
											</div>
										</td>

										{/* Company - hidden on small screens */}
										<td className="px-3 py-4 sm:px-4 md:px-6 hidden md:table-cell">
											<div className="flex items-center">
												<div
													className={`w-6 h-6 rounded-full flex items-center justify-center ${getCompanyBgClass(application.company_name)}`}
												>
													{application.company_name
														? application.company_name[0].toUpperCase()
														: "C"}
												</div>
												<div className="ml-2 text-sm text-gray-900">
													{application.company_name}
												</div>
											</div>
										</td>

										{/* Job Type */}
										<td className="px-3 py-4 sm:px-4 md:px-6">
											<span
												className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getJobTypeBadgeClass(application.job_type)}`}
											>
												{application.job_type}
											</span>
										</td>

										{/* Status */}
										<td className="px-3 py-4 sm:px-4 md:px-6">
											<StatusBadge status={application.status} />
										</td>

										{/* Actions */}
										<td className="px-3 py-4 sm:px-4 md:px-6 text-sm font-medium whitespace-nowrap">
											<div className="flex flex-col sm:flex-row gap-2">
												<button
													onClick={() => handleTakeInterview(application)}
													className="text-blue-600 hover:text-blue-900 text-xs "
												>
													Take Interview
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Show empty state if no applications after filtering */}
				{filteredApplications.length === 0 && (
					<div className="p-8 text-center">
						<div className="text-gray-400 mb-2">
							<FaSearch className="inline-block text-2xl" />
						</div>
						<h3 className="text-lg font-medium text-gray-700 mb-1">
							No applications found
						</h3>
						<p className="text-gray-500">
							Try changing your filters or apply to more jobs
						</p>
					</div>
				)}

				{/* Only show pagination if we have applications */}
				{filteredApplications.length > 0 && (
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				)}
			</div>
		</div>
	);
};

export default AppliedJobsTab;
