import React from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import StatsSection from "./StatsSection";
import { Link } from "react-router-dom";

const CTA = () => {
	return (
		<div className="bg-blue-600 text-white">
			<div className="max-w-7xl mx-auto text-center py-12 px-4">
				{/* Title */}
				<h2 className="text-2xl md:text-3xl font-bold mb-4">
					Ready to Take the Next Step?
				</h2>
				{/* Subtitle */}
				<p className="text-lg md:text-xl mb-8">
					Join thousands of professionals who’ve found their dream jobs through
					our platform
				</p>
				{/* Buttons */}
				<div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
					<button className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition flex items-center gap-2 shadow-md">
						<FaSearch />
						<Link to="/jobs">Find a Job</Link>
					</button>
					<button className="bg-blue-800 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-md cursor-pointer hover:scale-105">
						<FaPlus />
						<Link to="/recruiter">Post a Job</Link>
					</button>
				</div>
			</div>
			{/* Stats Section */}
			<StatsSection />
		</div>
	);
};

export default CTA;
