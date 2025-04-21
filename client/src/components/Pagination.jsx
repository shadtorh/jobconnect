import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	if (totalPages <= 1) return null;

	const handlePrevious = () => {
		if (currentPage > 1) onPageChange(currentPage - 1);
	};

	const handleNext = () => {
		if (currentPage < totalPages) onPageChange(currentPage + 1);
	};

	return (
		<div className="flex justify-center mt-8">
			<nav className="flex items-center space-x-1">
				<button
					onClick={handlePrevious}
					disabled={currentPage === 1}
					className="px-3 py-1 rounded-md border text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer hover:bg-blue-600 hover:text-white"
				>
					Previous
				</button>

				{[...Array(totalPages)].map((_, index) => (
					<button
						key={index}
						onClick={() => onPageChange(index + 1)}
						className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
							currentPage === index + 1
								? "bg-blue-600 text-white"
								: "border text-gray-700 hover:bg-gray-50"
						}`}
					>
						{index + 1}
					</button>
				))}

				<button
					onClick={handleNext}
					disabled={currentPage === totalPages}
					className="px-3 py-1 rounded-md border text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer hover:bg-blue-600 hover:text-white"
				>
					Next
				</button>
			</nav>
		</div>
	);
};

export default Pagination;
