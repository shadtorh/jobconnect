import { FaMapMarkerAlt, FaMoneyBillWave, FaClock } from "react-icons/fa";
import { formatPostedDate } from "../../utils/helper";
import { Link } from "react-router-dom";

const JobListingCard = ({ job, onClick }) => {
	// Fix the formatPostedDate function

	const getJobTypeClass = (type) => {
		switch (type?.toLowerCase()) {
			case "full-time":
				return "bg-blue-100 text-blue-800";
			case "remote":
				return "bg-green-100 text-green-800";
			case "freelance":
				return "bg-purple-100 text-purple-800";
			case "Contract":
				return "bg-orange-100 text-orange-800";
			case "part-time":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getExperienceLevelClass = (level) => {
		switch (level?.toLowerCase()) {
			case "entry-level":
				return "bg-teal-100 text-teal-800";
			case "mid-level":
				return "bg-indigo-100 text-indigo-800";
			case "senior":
				return "bg-amber-100 text-amber-800";
			case "executive":
				return "bg-rose-100 text-rose-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div
			className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex flex-col transition-all hover:shadow-md hover:border-blue-200 cursor-pointer transform hover:-translate-y-1"
			onClick={onClick}
		>
			<div className="mb-3">
				<div className="text-xs text-gray-500 mb-1">{job.company_name}</div>
				<h3 className="font-medium text-lg text-gray-900 mb-1">{job.title}</h3>
				<div className="flex items-center text-sm text-gray-500">
					<FaMapMarkerAlt className="mr-1 text-gray-400" />
					{job.location}
				</div>
			</div>

			<div className="flex flex-wrap gap-2 mb-3">
				{job.job_type && (
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeClass(job.job_type)}`}
					>
						{job.job_type}
					</span>
				)}

				{job.experience_level && (
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceLevelClass(job.experience_level)}`}
					>
						{job.experience_level}
					</span>
				)}

				{job.remote && (
					<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
						Remote
					</span>
				)}
			</div>

			<div className="mt-auto pt-3">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center">
						<FaMoneyBillWave className="mr-1 text-gray-400" />
						<span className="text-sm text-gray-700">
							${job.salary_min?.toLocaleString()} - $
							{job.salary_max?.toLocaleString()}
						</span>
					</div>
					<div className="flex items-center text-xs text-gray-500">
						<FaClock className="mr-1" />
						{formatPostedDate(job.posted_date)}
					</div>
				</div>

				<button
					className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition-all hover:shadow-md"
					// onClick={(e) => {
					// 	e.stopPropagation();
					// 	window.open(`/jobs/${job.id}`);
					// }}
				>
					<Link to={`/jobs/${job.id}`}>Apply Now</Link>
				</button>
			</div>
		</div>
	);
};

export default JobListingCard;
