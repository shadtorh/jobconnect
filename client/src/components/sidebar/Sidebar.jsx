import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChartBar, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import SidebarItem from "./SidebarItem";
import { useAuthStore } from "../../store/useAuthStore";
// import { useAuthStore } from "../store/useAuthStore";

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuthStore();

	const handleSidebarItemClick = (callback) => {
		setSidebarOpen(false);
		if (callback) callback();
	};

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<>
			{/* Sidebar - cleaner styling */}
			<div
				className={`fixed z-40 inset-y-0 left-0 transform ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} md:translate-x-0 transition duration-200 ease-in-out md:relative md:w-64 bg-white border-r border-gray-100 h-full`}
			>
				{/* Clean header */}
				<div className="h-16 flex items-center px-6 border-b border-gray-100">
					<h1 className="text-lg font-semibold text-blue-600">RecruiterPro</h1>
				</div>

				<div className="py-2">
					<SidebarItem
						icon={<FaChartBar size={16} />}
						text="Dashboard"
						active={location.pathname === "/recruiter"}
						onClick={() => handleSidebarItemClick(() => navigate("/recruiter"))}
					/>

					<SidebarItem
						icon={<FaUsers size={16} />}
						text="View Applications"
						active={location.pathname === "/recruiter/applications"}
						onClick={() =>
							handleSidebarItemClick(() => navigate("/recruiter/applications"))
						}
					/>

					<div className="mt-auto border-t border-gray-100 pt-4 mx-4">
						<div onClick={() => handleSidebarItemClick(handleLogout)}>
							<SidebarItem icon={<FaSignOutAlt size={16} />} text="Logout" />
						</div>
					</div>
				</div>
			</div>

			{/* Overlay for mobile */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}
		</>
	);
};

export default Sidebar;
