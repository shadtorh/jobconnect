import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
	FaUser,
	FaSignOutAlt,
	FaUserTie,
	FaTachometerAlt,
	FaCog,
} from "react-icons/fa";

const AuthButtons = () => {
	const { user, logout } = useAuthStore();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		await logout();
		setDropdownOpen(false);
		navigate("/login");
	};

	const handleSettings = () => {
		setDropdownOpen(false);
		navigate("/profile/settings");
	};

	// Navigate based on user role
	const navigateToProfile = () => {
		setDropdownOpen(false);
		if (user.role === "recruiter") {
			navigate("/recruiter");
		} else if (user.role === "seeker") {
			navigate("/seeker");
		} else {
			navigate("/dashboard"); // Fallback
		}
	};

	// If user is logged in, show profile
	if (user) {
		return (
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={() => setDropdownOpen(!dropdownOpen)}
					className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full py-2 px-4 transition"
				>
					<div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500">
						<div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
							{user.first_name ? user.first_name[0].toUpperCase() : "U"}
						</div>
					</div>
					<span className="font-medium">{user.first_name}</span>
				</button>

				{/* Dropdown menu */}
				{dropdownOpen && (
					<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
						<div className="px-4 py-3 border-b">
							<p className="text-sm leading-5">
								{user.first_name} {user.last_name}
							</p>
							<p className="text-xs leading-4 text-gray-500 flex items-center">
								{user.role === "recruiter" ? (
									<FaUserTie className="mr-1" />
								) : (
									<FaUser className="mr-1" />
								)}
								{user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
							</p>
						</div>

						{/* Dashboard button - navigate to role-specific page */}
						<button
							onClick={navigateToProfile}
							className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
						>
							<FaTachometerAlt className="mr-2" /> Dashboard
						</button>

						<button
							onClick={handleSettings}
							className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
						>
							<FaCog size={16} className="mr-2" /> Settings
						</button>

						<button
							onClick={handleLogout}
							className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
						>
							<FaSignOutAlt className="mr-2" /> Logout
						</button>
					</div>
				)}
			</div>
		);
	}

	// If not logged in, show login/signup buttons
	return (
		<>
			<Link
				to="/login"
				className="text-gray-600 hover:text-blue-600 transition"
			>
				Login
			</Link>
			<Link
				to="/signup"
				className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
			>
				Sign Up
			</Link>
		</>
	);
};

export default AuthButtons;
