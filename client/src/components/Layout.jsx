import React from "react";
import Navbar from "./navbar/Navbar";

const Layout = ({ children }) => {
	return (
		<div>
			{/* Navbar */}
			<Navbar />
			{/* Main Content */}
			<main>{children}</main>
		</div>
	);
};

export default Layout;
