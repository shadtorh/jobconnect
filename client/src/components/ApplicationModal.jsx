import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-toastify";
import {
	FaBuilding,
	FaMapMarkerAlt,
	FaDollarSign,
	FaBriefcase,
	FaCloudUploadAlt,
} from "react-icons/fa";
import { useApplicationStore } from "../store/useApplicationStore";

const ApplicationModal = ({ isOpen, closeModal, job }) => {
	const { user } = useAuthStore();
	const [formData, setFormData] = useState({
		resume: null,
		email: user?.email || "",
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		cover_letter: "",
		motivationquestion: "",
		uniquequestion: "",
		position: job?.title || "",
	});
	const [resumeFileName, setResumeFileName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { applyForJob } = useApplicationStore();

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleResumeChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData((prev) => ({
				...prev,
				resume: file,
			}));
			setResumeFileName(file.name);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const handleDrop = (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file) {
			setFormData((prev) => ({
				...prev,
				resume: file,
			}));
			setResumeFileName(file.name);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const applicationData = {
				...formData,
			};

			if (!formData.resume) {
				toast.error("Please upload your resume");
				setIsSubmitting(false);
				return;
			}

			const result = await applyForJob(job.id, applicationData);
			console.log("Application result:", result);
			closeModal();
		} catch (error) {
			console.error("Error submitting application:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<h2 className="text-xl font-bold mb-1">Apply for {job?.title}</h2>
					<p className="text-gray-600 mb-5">at {job?.company_name}</p>

					<form onSubmit={handleSubmit}>
						{/* Job Details */}
						<div className="grid grid-cols-2 gap-4 mb-6">
							<div className="flex items-center">
								<FaBuilding className="text-gray-500 mr-2" />
								<div>
									<div className="text-xs text-gray-500">Company</div>
									<div className="font-medium">{job?.company_name}</div>
								</div>
							</div>

							<div className="flex items-center">
								<FaMapMarkerAlt className="text-gray-500 mr-2" />
								<div>
									<div className="text-xs text-gray-500">Location</div>
									<div className="font-medium">{job?.location}</div>
								</div>
							</div>

							<div className="flex items-center">
								<FaDollarSign className="text-gray-500 mr-2" />
								<div>
									<div className="text-xs text-gray-500">Salary</div>
									<div className="font-medium">
										${job?.salary_min} - ${job?.salary_max}
									</div>
								</div>
							</div>

							<div className="flex items-center">
								<FaBriefcase className="text-gray-500 mr-2" />
								<div>
									<div className="text-xs text-gray-500">Job Type</div>
									<div className="font-medium">{job?.job_type}</div>
								</div>
							</div>
						</div>

						{/* First Name field */}
						<div className="mb-5">
							<label className="block text-gray-700 font-medium mb-2">
								First Name
							</label>
							<input
								type="text"
								name="first_name"
								value={formData.first_name}
								onChange={handleInputChange}
								className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						{/* Last Name field */}
						<div className="mb-5">
							<label className="block text-gray-700 font-medium mb-2">
								Last Name
							</label>
							<input
								type="text"
								name="last_name"
								value={formData.last_name}
								onChange={handleInputChange}
								className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						{/* Email field */}
						<div className="mb-5">
							<label className="block text-gray-700 font-medium mb-2">
								Email
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleInputChange}
								className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						{/* Email field */}
						<div className="mb-5">
							<label className="block text-gray-700 font-medium mb-2">
								Postion
							</label>
							<input
								type="position"
								name="position"
								value={formData.position}
								disabled
								onChange={handleInputChange}
								className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						{/* Resume Upload */}
						<div className="mb-5">
							<label className="block text-gray-700 font-medium mb-2">
								Upload Resume
							</label>
							<div
								className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer"
								onDragOver={handleDragOver}
								onDrop={handleDrop}
							>
								<FaCloudUploadAlt className="mx-auto text-gray-400 text-3xl mb-2" />
								<p className="text-gray-500 mb-2">
									Drag and drop your resume here, or
								</p>
								<div className="relative">
									<button
										type="button"
										className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition"
										onClick={() =>
											document.getElementById("resumeUpload").click()
										}
									>
										Choose File
									</button>
									<input
										id="resumeUpload"
										type="file"
										className="hidden"
										accept=".pdf,.doc,.docx,.rtf,.txt"
										onChange={handleResumeChange}
									/>
								</div>
								{resumeFileName && (
									<p className="mt-2 text-sm text-gray-600">
										Selected file: {resumeFileName}
									</p>
								)}
								<p className="mt-2 text-xs text-gray-500">
									Accepted formats: PDF, DOC, DOCX, RTF, TXT (Max 8MB)
								</p>
							</div>
						</div>

						{/* Cover Letter */}
						<div className="mb-5">
							<label className="block text-gray-700 font-medium mb-2">
								Cover Letter (Optional)
							</label>
							<textarea
								name="cover_letter"
								value={formData.cover_letter}
								onChange={handleInputChange}
								rows={4}
								className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Write your cover letter here..."
							></textarea>
						</div>

						{/* Additional Questions */}
						<div className="mb-6">
							<h3 className="font-medium text-gray-800 mb-3">
								Additional Questions
							</h3>

							<div className="mb-4">
								<label className="block text-gray-700 mb-2">
									Why do you want to work with us?
								</label>
								<textarea
									name="motivationquestion"
									value={formData.motivationquestion}
									onChange={handleInputChange}
									rows={3}
									className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Share your motivation..."
									required
								></textarea>
							</div>

							<div className="mb-4">
								<label className="block text-gray-700 mb-2">
									What makes you unique?
								</label>
								<textarea
									name="uniquequestion"
									value={formData.uniquequestion}
									onChange={handleInputChange}
									rows={3}
									className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Tell us about yourself..."
									required
								></textarea>
							</div>
						</div>

						{/* Buttons */}
						<div className="flex justify-between items-center mt-8">
							<button
								type="button"
								className="flex items-center text-gray-700 hover:text-gray-900"
							></button>
							<div className="flex space-x-4">
								<button
									type="button"
									onClick={closeModal}
									className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-6 py-2 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700 transition flex items-center"
									disabled={isSubmitting}
								>
									{isSubmitting ? <>Processing...</> : "Submit Application"}
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ApplicationModal;
