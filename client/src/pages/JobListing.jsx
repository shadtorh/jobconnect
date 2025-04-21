import React, { useState, useEffect } from "react";
import { useJobStore } from "../store/useJobStore";
import { useNavigate } from "react-router-dom";
import { locations, categories, jobTypes } from "../data";
import { JobListingCard, Loading, Pagination } from "../components";
import { formatSalary } from "../utils/helper";

const JobListing = () => {
	const navigate = useNavigate();
	const { getActiveJobs, jobs, isLoading } = useJobStore();
	const [currentPage, setCurrentPage] = useState(1);
	const [filters, setFilters] = useState({
		category: [],
		location: [],
		employmentType: [],
		salaryRange: [0, 500000],
	});

	// Items per page
	const itemsPerPage = 6;

	useEffect(() => {
		getActiveJobs();
	}, [getActiveJobs]);

	// Filter jobs based on selected filters
	const filteredJobs = jobs.filter((job) => {
		// Category filter
		if (
			filters.category.length > 0 &&
			!filters.category.includes(job.category)
		) {
			return false;
		}

		// Location filter
		if (
			filters.location.length > 0 &&
			!filters.location.includes(job.location)
		) {
			return false;
		}

		// Employment type filter
		if (
			filters.employmentType.length > 0 &&
			!filters.employmentType.includes(job.job_type)
		) {
			return false;
		}

		// Salary range filter
		if (
			job.salary_min < filters.salaryRange[0] ||
			job.salary_max > filters.salaryRange[1]
		) {
			return false;
		}

		return true;
	});

	// Calculate pagination
	const indexOfLastJob = currentPage * itemsPerPage;
	const indexOfFirstJob = indexOfLastJob - itemsPerPage;
	const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
	const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

	// Handle filter changes
	const handleFilterChange = (filterType, value) => {
		setFilters((prevFilters) => {
			const updatedFilters = { ...prevFilters };

			// Toggle array values for checkboxes
			if (
				filterType === "category" ||
				filterType === "location" ||
				filterType === "employmentType"
			) {
				if (updatedFilters[filterType].includes(value)) {
					updatedFilters[filterType] = updatedFilters[filterType].filter(
						(item) => item !== value
					);
				} else {
					updatedFilters[filterType] = [...updatedFilters[filterType], value];
				}
			} else if (filterType === "salaryRange") {
				updatedFilters.salaryRange = value;
			}

			return updatedFilters;
		});

		// Reset to first page when filters change
		setCurrentPage(1);
	};

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col md:flex-row gap-8">
					{/* Sidebar with filters */}
					<div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-sm h-fit">
						<div className="mb-6">
							<h3 className="font-medium text-gray-900 mb-3">Job Category</h3>
							<div className="space-y-2">
								{categories.map((category) => (
									<div key={category} className="flex items-center">
										<input
											type="checkbox"
											id={category}
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											checked={filters.category.includes(category)}
											onChange={() => handleFilterChange("category", category)}
										/>
										<label
											htmlFor={category}
											className="ml-2 text-sm text-gray-700"
										>
											{category}
										</label>
									</div>
								))}
							</div>
						</div>

						<div className="mb-6">
							<h3 className="font-medium text-gray-900 mb-3">Location</h3>
							<div className="space-y-2">
								{locations.map((location) => (
									<div key={location} className="flex items-center">
										<input
											type="checkbox"
											id={location}
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											checked={filters.location.includes(location)}
											onChange={() => handleFilterChange("location", location)}
										/>
										<label
											htmlFor={location}
											className="ml-2 text-sm text-gray-700"
										>
											{location}
										</label>
									</div>
								))}
							</div>
						</div>

						<div className="mb-6">
							<h3 className="font-medium text-gray-900 mb-3">Salary Range</h3>
							<div className="px-2">
								<input
									type="range"
									min="0"
									max="500000"
									step="10000"
									className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
									value={filters.salaryRange[1]}
									onChange={(e) =>
										handleFilterChange("salaryRange", [
											filters.salaryRange[0],
											parseInt(e.target.value),
										])
									}
								/>
								<div className="flex justify-between mt-2 text-xs text-gray-500">
									<span>$0</span>
									<span>{formatSalary(filters.salaryRange[1])}</span>
								</div>
							</div>
						</div>

						<div className="mb-4">
							<h3 className="font-medium text-gray-900 mb-3">
								Employment Type
							</h3>
							<div className="space-y-2">
								{jobTypes.map((type) => (
									<div key={type} className="flex items-center">
										<input
											type="checkbox"
											id={type}
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											checked={filters.employmentType.includes(type)}
											onChange={() =>
												handleFilterChange("employmentType", type)
											}
										/>
										<label
											htmlFor={type}
											className="ml-2 text-sm text-gray-700"
										>
											{type}
										</label>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Job listings */}
					<div className="w-full md:w-3/4">
						<div className="flex justify-between mb-6">
							<h2 className="text-xl font-semibold">
								{filteredJobs.length} Jobs Available
							</h2>
							<select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
								<option>Most Relevant</option>
								<option>Newest First</option>
								<option>Highest Salary</option>
							</select>
						</div>

						{isLoading ? (
							<Loading />
						) : (
							<>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{currentJobs.map((job) => (
										<JobListingCard
											key={job.id}
											job={job}
											onClick={() => navigate(`/job/${job.id}`)}
										/>
									))}
								</div>

								{/* Pagination */}
								{totalPages > 1 && (
									<Pagination
										currentPage={currentPage}
										totalPages={totalPages}
										onPageChange={(page) => setCurrentPage(page)}
									/>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default JobListing;
