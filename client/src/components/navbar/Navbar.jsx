import React from "react";

import AuthButtons from "./AuthButtons";
import { Link } from "react-router-dom";

const Navbar = () => {
	return (
		<nav className="bg-base-100 text-gray-500 sticky top-0 z-50 shadow-sm">
			<div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
				{/* Logo */}
				<h1 className="text-2xl font-bold text-blue-700">
					<Link to="/">
						Job<span className="text-black">Connect</span>
					</Link>
				</h1>

				{/* Auth or Profile - Always visible */}
				<div className="flex space-x-4 items-center">
					<AuthButtons />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
