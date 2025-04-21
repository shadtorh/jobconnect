import React from "react";
import { FaCode, FaPaintBrush, FaBullhorn, FaHeadset } from "react-icons/fa";

const categories = [
	{
		icon: <FaCode className="text-blue-600 text-3xl" />,
		title: "Development",
		jobs: "1,204 jobs",
	},
	{
		icon: <FaPaintBrush className="text-blue-600 text-3xl" />,
		title: "Design",
		jobs: "834 jobs",
	},
	{
		icon: <FaBullhorn className="text-blue-600 text-3xl" />,
		title: "Marketing",
		jobs: "952 jobs",
	},
	{
		icon: <FaHeadset className="text-blue-600 text-3xl" />,
		title: "Customer Service",
		jobs: "648 jobs",
	},
];

const PopularCategories = () => {
	return (
		<div className="bg-gray-50 py-12 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Title */}
				<h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
					Popular Categories
				</h2>
				{/* Categories Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
					{categories.map((category, index) => (
						<div
							key={index}
							className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition"
						>
							{/* Icon */}
							<div className="mb-4">{category.icon}</div>
							{/* Title */}
							<h3 className="text-lg font-semibold text-gray-800">
								{category.title}
							</h3>
							{/* Jobs Count */}
							<p className="text-sm text-gray-600">{category.jobs}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PopularCategories;
