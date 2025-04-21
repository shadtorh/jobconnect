import React from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const MobileToggleButton = ({ isSidebarOpen, setSidebarOpen }) => {
	return (
		<button
			className="fixed z-50 top-4 left-4 md:hidden bg-white p-2 rounded-md border border-gray-200 shadow-sm"
			onClick={() => setSidebarOpen(!isSidebarOpen)}
		>
			{isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
		</button>
	);
};

export default MobileToggleButton;
