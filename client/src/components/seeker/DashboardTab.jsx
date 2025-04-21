import React from "react";
import { FaBriefcase, FaMicrophone } from "react-icons/fa";

const DashboardTab = ({ user, appliedCount, stats, interviewHistory }) => {
	return (
		<>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
				<h1 className="text-xl md:text-2xl font-bold">Dashboard Overview</h1>
				<div className="flex items-center">
					<div className="flex items-center">
						<div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500">
							{user.photo ? (
								<img
									src={user.photo}
									alt={user.first_name}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
									{user.first_name ? user.first_name[0].toUpperCase() : "U"}
								</div>
							)}
						</div>
						<span className="ml-2 text-gray-700 text-sm md:text-base">
							{user.first_name} {user.last_name}
						</span>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
				<div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
					<div className="flex justify-between mb-4">
						<h2 className="text-base md:text-lg text-gray-700">
							Total Applied Jobs
						</h2>
						<div className="bg-blue-100 p-2 rounded-lg">
							<FaBriefcase className="text-blue-600" />
						</div>
					</div>
					<div>
						<p className="text-2xl md:text-3xl font-bold">{appliedCount}</p>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
					<div className="flex justify-between mb-4">
						<h2 className="text-base md:text-lg text-gray-700">
							Mock Interviews
						</h2>
						<div className="bg-blue-100 p-2 rounded-lg">
							<FaMicrophone className="text-blue-600" />
						</div>
					</div>
					<div>
						<p className="text-2xl md:text-3xl font-bold">{stats.interviews}</p>
					</div>
				</div>
			</div>

			{/* Mock Interview History */}
			<div className="mb-8">
				<h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
					Mock Interview History
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{interviewHistory.map((interview) => (
						<div
							key={interview.id}
							className="bg-white rounded-lg p-4 md:p-6 shadow-sm"
						>
							<div className="mb-3 md:mb-4">
								<h3 className="font-semibold text-base md:text-lg">
									{interview.title}
								</h3>
								<p className="text-gray-600 text-sm">{interview.company}</p>
							</div>
							<div className="flex items-center justify-between mb-3 md:mb-4">
								<span className="text-xs md:text-sm text-gray-500">
									{interview.date}
								</span>
								<span
									className={`px-2 py-0.5 md:py-1 rounded-md text-xs md:text-sm font-medium ${
										interview.score >= 90
											? "bg-green-100 text-green-800"
											: interview.score >= 80
												? "bg-blue-100 text-blue-800"
												: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{interview.score}%
								</span>
							</div>
							<button className="text-blue-600 text-xs md:text-sm hover:underline">
								View Feedback
							</button>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default DashboardTab;
