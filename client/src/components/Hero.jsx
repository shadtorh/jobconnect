import React from "react";
// import Navbar from "./navbar/Navbar";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const Hero = () => {
	return (
		<div className="bg-blue-100 min-h-screen flex flex-col items-center justify-center text-center px-4">
			<h1 className="text-4xl md:text-5xl font-bold text-gray-800">
				Find Your Dream Job Today
			</h1>
			<p className="text-lg md:text-xl text-gray-600 mt-4">
				Connect with top companies and opportunities worldwide
			</p>

			{/* Search Bar */}
			<div className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg mt-8 p-4 md:p-2 space-y-4 md:space-y-0 md:space-x-4 w-full max-w-3xl">
				{/* Job Title Input */}
				<div className="flex items-center bg-white border-b border-l border-gray-400 px-4 py-2 rounded-md w-full">
					<FaSearch className="text-gray-400 mr-2" />
					<input
						type="text"
						placeholder="Job title or keyword"
						className="bg-transparent outline-none w-full text-gray-700"
					/>
				</div>

				{/* Location Input */}
				<div className="flex items-center bg-white border-b border-l border-gray-400 px-4 py-2 rounded-md w-full">
					<FaMapMarkerAlt className="text-gray-400 mr-2" />
					<input
						type="text"
						placeholder="Location"
						className="bg-transparent outline-none w-full text-gray-700"
					/>
				</div>

				{/* Search Button */}
				<button className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-800 transition w-full md:w-auto cursor-pointer hover:scale-105 ">
					Search
				</button>
			</div>
		</div>
	);
};

export default Hero;
