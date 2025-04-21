import React from "react";
import { Link } from "react-router-dom";

const jobs = [
	{
		title: "Senior UX Designer",
		company: "Google Inc.",
		location: "San Francisco, CA",
		type: ["Full Time", "Remote", "Senior Level"],
		salary: "$120k - 150k/year",
		image: "https://via.placeholder.com/50", // Placeholder image
	},
	{
		title: "Full Stack Developer",
		company: "Microsoft",
		location: "Seattle, WA",
		type: ["Full Time", "Hybrid", "Mid Level"],
		salary: "$90k - 120k/year",
		image: "https://via.placeholder.com/50", // Placeholder image
	},
];

const FeaturedJobs = () => {
	return (
		<div className="bg-white py-12 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-center mb-8">
					<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
						Featured Jobs
					</h2>
					<Link
						to="/jobs"
						className="text-blue-600 hover:text-blue-800 text-sm font-medium"
					>
						View all jobs →
					</Link>
				</div>

				{/* Jobs Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					{jobs.map((job, index) => (
						<div
							key={index}
							className="bg-gray-50 shadow-md rounded-lg p-6 flex flex-col sm:flex-row items-center hover:shadow-lg transition"
						>
							{/* Job Image */}
							<img
								src={job.image}
								alt={job.title}
								className="w-16 h-16 rounded-full mb-4 sm:mb-0 sm:mr-4"
							/>
							{/* Job Details */}
							<div className="flex-1 text-center sm:text-left">
								<h3 className="text-lg font-semibold text-gray-800">
									{job.title}
								</h3>
								<p className="text-sm text-gray-600">{job.company}</p>
								<div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
									{job.type.map((tag, idx) => (
										<span
											key={idx}
											className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full"
										>
											{tag}
										</span>
									))}
								</div>
								<p className="text-sm text-gray-600 mt-2">{job.location}</p>
								<p className="text-sm text-gray-800 font-medium mt-1">
									{job.salary}
								</p>
							</div>
							{/* Apply Button */}
							<div className="mt-4 sm:mt-0">
								<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
									Apply Now
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default FeaturedJobs;
