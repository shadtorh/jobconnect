import React from "react";
import {
	FaFacebookF,
	FaTwitter,
	FaLinkedinIn,
	FaInstagram,
} from "react-icons/fa";

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-gray-400 py-12 px-4">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
				{/* Logo and Description */}
				<div>
					<h2 className="text-white text-2xl font-bold mb-4">JobPort</h2>
					<p className="text-sm">
						Find your dream job and connect with top companies worldwide.
					</p>
					<div className="flex space-x-4 mt-4">
						<a
							href="#"
							className="text-gray-400 hover:text-white transition text-lg"
							aria-label="Facebook"
						>
							<FaFacebookF />
						</a>
						<a
							href="#"
							className="text-gray-400 hover:text-white transition text-lg"
							aria-label="Twitter"
						>
							<FaTwitter />
						</a>
						<a
							href="#"
							className="text-gray-400 hover:text-white transition text-lg"
							aria-label="LinkedIn"
						>
							<FaLinkedinIn />
						</a>
						<a
							href="#"
							className="text-gray-400 hover:text-white transition text-lg"
							aria-label="Instagram"
						>
							<FaInstagram />
						</a>
					</div>
				</div>

				{/* For Job Seekers */}
				<div>
					<h3 className="text-white text-lg font-semibold mb-4">
						For Job Seekers
					</h3>
					<ul className="space-y-2">
						<li>
							<a href="#" className="hover:text-white transition">
								Browse Jobs
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white transition">
								Career Resources
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white transition">
								Resume Builder
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white transition">
								Job Alerts
							</a>
						</li>
					</ul>
				</div>

				{/* For Employers */}
				<div>
					<h3 className="text-white text-lg font-semibold mb-4">
						For Employers
					</h3>
					<ul className="space-y-2">
						<li>
							<a href="#" className="hover:text-white transition">
								Post a Job
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white transition">
								Browse Candidates
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white transition">
								Recruitment Solutions
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white transition">
								Pricing Plans
							</a>
						</li>
					</ul>
				</div>

				{/* Contact Us */}
				<div>
					<h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
					<ul className="space-y-2">
						<li>
							<a
								href="mailto:support@jobport.com"
								className="hover:text-white transition"
							>
								📧 support@jobport.com
							</a>
						</li>
						<li>
							<a
								href="tel:+15551234567"
								className="hover:text-white transition"
							>
								📞 +1 (555) 123-4567
							</a>
						</li>
						<li>
							<p>📍 123 Job Street, SF, CA 94105</p>
						</li>
					</ul>
				</div>
			</div>

			{/* Footer Bottom */}
			<div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm">
				<p>© 2025 JobPort. All rights reserved.</p>
			</div>
		</footer>
	);
};

export default Footer;
