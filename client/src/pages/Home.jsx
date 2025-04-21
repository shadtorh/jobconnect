import React from "react";
import {
	Navbar,
	Hero,
	Footer,
	PopularCategories,
	FeaturedJobs,
	CTA,
} from "../components";

const Home = () => {
	return (
		<div className="">
			{/* <Navbar /> */}
			<Hero />
			<PopularCategories />
			<FeaturedJobs />
			<CTA />
			<Footer />
		</div>
	);
};

export default Home;
