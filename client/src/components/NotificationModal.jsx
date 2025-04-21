import React, { useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { FaUserCircle, FaBriefcase, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/useNotificationStore";

const NotificationModal = ({ isOpen, onClose }) => {
	const {
		notifications,
		isLoading,
		error,
		fetchNotifications,
		markAsRead,
		markAllAsRead,
		fetchUnreadCount,
	} = useNotificationStore();

	const modalRef = useRef(null);
	const navigate = useNavigate();

	// Fetch notifications when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchNotifications();
		}
	}, [isOpen, fetchNotifications]);

	// Close modal when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	const handleNotificationClick = async (notification) => {
		// Mark as read when clicked
		if (!notification.is_read) {
			await markAsRead(notification.id);
		}

		// Navigate based on notification type
		if (notification.type === "application") {
			navigate(`/applications/${notification.related_id}`);
		}

		// Close the modal
		onClose();

		// Update unread count after closing
		fetchUnreadCount();
	};

	const handleMarkAllAsRead = async () => {
		await markAllAsRead();
		// No need to update unread count here as it's handled in the store
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-8">
			<div
				ref={modalRef}
				className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
			>
				<div className="flex items-center justify-between p-4 border-b">
					<h2 className="text-lg font-semibold">Notifications</h2>
					<div className="flex items-center space-x-4">
						{notifications.some((n) => !n.is_read) && (
							<button
								onClick={handleMarkAllAsRead}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Mark all as read
							</button>
						)}
						<button
							onClick={onClose}
							className="text-gray-500 hover:text-gray-700"
						>
							<IoMdClose size={24} />
						</button>
					</div>
				</div>

				<div className="overflow-y-auto flex-grow">
					{isLoading ? (
						<div className="flex justify-center items-center h-32">
							<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
						</div>
					) : error ? (
						<div className="p-4 text-center text-red-500">{error}</div>
					) : notifications.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							<FaBell className="mx-auto mb-3 text-gray-400 text-4xl" />
							<p>No notifications yet</p>
						</div>
					) : (
						<ul className="divide-y divide-gray-100">
							{notifications.map((notification) => (
								<li
									key={notification.id}
									onClick={() => handleNotificationClick(notification)}
									className={`p-4 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 ${
										!notification.is_read ? "bg-blue-50" : ""
									}`}
								>
									<div className="flex-shrink-0">
										{notification.type === "application" ? (
											<div className="bg-blue-100 p-2 rounded-full">
												<FaUserCircle className="text-blue-500 text-xl" />
											</div>
										) : (
											<div className="bg-green-100 p-2 rounded-full">
												<FaBriefcase className="text-green-500 text-xl" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p
											className={`text-sm ${
												!notification.is_read
													? "font-semibold"
													: "text-gray-700"
											}`}
										>
											{notification.message}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											{new Date(notification.created_at).toLocaleString()}
										</p>
									</div>
									{!notification.is_read && (
										<span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
};

export default NotificationModal;
