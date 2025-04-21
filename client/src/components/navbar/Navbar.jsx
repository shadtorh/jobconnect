import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";
import { Link } from "react-router-dom";

const Navbar = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<nav className="bg-base-100 text-gray-500 sticky top-0 z-50 shadow-sm">
			<div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
				{/* Logo */}
				<h1 className="text-2xl font-bold text-blue-700">
					<Link to="/">
						Job<span className="text-black">Connect</span>
					</Link>
				</h1>

				{/* Mobile Menu Button */}
				<button
					className="md:hidden text-gray-700 focus:outline-none"
					onClick={toggleMobileMenu}
					aria-label="Toggle mobile menu"
				>
					{isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
				</button>

				{/* Desktop Links - Hidden on mobile */}
				<div className="hidden md:flex space-x-10 text-lg">
					<NavLinks />
				</div>

				{/* Desktop Auth or Profile - Hidden on mobile */}
				<div className="hidden md:flex space-x-4 items-center">
					<AuthButtons />
				</div>
			</div>

			{/* Mobile Menu - Only shown when open */}
			{isMobileMenuOpen && (
				<div className="md:hidden bg-white border-t border-gray-200 py-3 px-4 animate-fadeIn">
					<div className="flex flex-col space-y-4">
						<NavLinks mobile={true} />
						<hr className="my-2" />
						<div className="flex flex-col space-y-3">
							<AuthButtons mobile={true} />
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
