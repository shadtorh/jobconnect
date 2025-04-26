import React from "react";
import { Link } from "react-router-dom";
import { FaBriefcase, FaHome, FaSearch } from "react-icons/fa";

const NotFound = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
			<div className="max-w-lg w-full text-center">
				<div className="mb-8">
					<div className="relative inline-block">
						<FaBriefcase className="text-blue-600 text-8xl mx-auto opacity-20" />
						<div className="absolute inset-0 flex items-center justify-center">
							<h1 className="text-8xl font-bold text-blue-600">404</h1>
						</div>
					</div>
				</div>

				<h2 className="text-3xl font-bold text-gray-800 mb-4">
					Page Not Found
				</h2>

				<p className="text-gray-600 mb-8">
					Oops! The job listing you're looking for seems to have moved or
					doesn't exist. Perhaps it found employment elsewhere?
				</p>

				<div className="space-y-3">
					<Link
						to="/"
						className=" w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
					>
						<FaHome className="mr-2" /> Back to Homepage
					</Link>

					<Link
						to="/jobs"
						className=" w-full bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
					>
						<FaSearch className="mr-2" /> Browse Available Jobs
					</Link>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
