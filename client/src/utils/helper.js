export const formatPostedDate = (dateString) => {
	if (!dateString) return "Recently";

	// Create date objects
	const postedDate = new Date(dateString);
	const currentDate = new Date();

	// Compare only the date part (year, month, day)
	const isToday =
		postedDate.getDate() === currentDate.getDate() &&
		postedDate.getMonth() === currentDate.getMonth() &&
		postedDate.getFullYear() === currentDate.getFullYear();

	// Check if it's yesterday
	const yesterday = new Date();
	yesterday.setDate(currentDate.getDate() - 1);
	const isYesterday =
		postedDate.getDate() === yesterday.getDate() &&
		postedDate.getMonth() === yesterday.getMonth() &&
		postedDate.getFullYear() === yesterday.getFullYear();

	if (isToday) return "Today";
	if (isYesterday) return "Yesterday";

	// If not today or yesterday, calculate days difference
	const diffTime = Math.abs(currentDate - postedDate);
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Use Math.floor instead of Math.ceil

	return `${diffDays} days ago`;
};

export const formatSalary = (amount) => {
	if (!amount) return "$0";
	return `$${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

// Format seconds into MM:SS
export const formatTime = (seconds) => {
	const min = String(Math.floor(seconds / 60)).padStart(2, "0");
	const sec = String(seconds % 60).padStart(2, "0");
	return `${min}:${sec}`;
};
