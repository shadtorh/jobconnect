import React from "react";
import { FaHome, FaBriefcase, FaInfoCircle, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

const links = [
	{ icon: <FaHome />, label: "Home", path: "/" },
	{ icon: <FaBriefcase />, label: "Jobs", path: "/jobs" },
	// { icon: <FaInfoCircle />, label: "About" },
	// { icon: <FaEnvelope />, label: "Contact" },
];

const NavLinks = () => {
	return (
		<>
			{links.map((link, index) => (
				<li
					key={index}
					className="flex items-center space-x-2 hover:text-blue-600  cursor-pointer transition"
				>
					{link.icon}
					<Link to={link.path}>{link.label}</Link>
				</li>
			))}
		</>
	);
};

export default NavLinks;
