import React from "react";
import { Hero, Footer, PopularCategories, CTA } from "../components";

const Home = () => {
	return (
		<div className="">
			{/* <Navbar /> */}
			<Hero />
			<PopularCategories />

			<CTA />
			<Footer />
		</div>
	);
};

export default Home;
