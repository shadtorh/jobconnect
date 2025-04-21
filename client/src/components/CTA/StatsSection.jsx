import React from "react";

const stats = [
	{ value: "15K+", label: "Active Jobs" },
	{ value: "8K+", label: "Companies" },
	{ value: "250K+", label: "Job Seekers" },
	// { value: "12K+", label: "Placements" },
];

const StatsSection = () => {
	return (
		<div className="bg-white py-8">
			<div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
				{stats.map((stat, index) => (
					<div key={index}>
						<h3 className="text-3xl font-bold text-blue-600">{stat.value}</h3>
						<p className="text-sm text-gray-600">{stat.label}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default StatsSection;
