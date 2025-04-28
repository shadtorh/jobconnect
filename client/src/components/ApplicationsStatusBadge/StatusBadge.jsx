const StatusBadge = ({ status }) => {
	const safeStatus = typeof status === "string" ? status : "pending";
	const getStatusStyles = () => {
		switch (safeStatus) {
			case "approved":
				return "bg-green-100 text-green-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "pending":
			default:
				return "bg-blue-100 text-blue-600";
		}
	};

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}
		>
			{safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
		</span>
	);
};

export default StatusBadge;
