import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const Hero = () => {
	return (
		<div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen overflow-hidden">
			{/* Abstract background shapes */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
				<div className="absolute top-1/4 -left-20 w-60 h-60 bg-indigo-300 rounded-full opacity-20 blur-3xl"></div>
				<div className="absolute bottom-10 right-1/4 w-40 h-40 bg-purple-300 rounded-full opacity-20 blur-3xl"></div>
			</div>

			{/* Main content */}
			<div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center h-screen">
				<div className="text-center max-w-3xl mx-auto">
					<h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-6 leading-tight">
						Find Your Dream Job Today
					</h1>
					<p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
						Connect with top companies and opportunities worldwide. Your next
						career move is just a click away.
					</p>

					<button
						className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-3 px-8 rounded-xl hover:opacity-90 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
						onClick={() => (window.location.href = "/jobs")}
					>
						Browse Jobs
					</button>
				</div>

				{/* Stats or trust indicators */}
				<div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
					{[
						{ number: "10k+", label: "Job Openings" },
						{ number: "3,500+", label: "Companies" },
						{ number: "25M+", label: "Job Seekers" },
						{ number: "95%", label: "Success Rate" },
					].map((stat, index) => (
						<div key={index} className="text-center">
							<p className="text-2xl md:text-3xl font-bold text-blue-600">
								{stat.number}
							</p>
							<p className="text-gray-500 text-sm">{stat.label}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Hero;
