import { create } from "zustand";
import { axiosInstance } from "../utils/axios";
import { toast } from "react-toastify";

export const useNotificationStore = create((set, get) => ({
	notifications: [],
	isLoading: false,
	error: null,
	unreadCount: 0,

	// Fetch all notifications
	fetchNotifications: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/notifications");
			set({
				notifications: response.data.notifications || [],
				isLoading: false,
				// Calculate unread count from notifications
				unreadCount: (response.data.notifications || []).filter(
					(n) => !n.is_read
				).length,
			});
			return response.data.notifications;
		} catch (error) {
			console.error("Error fetching notifications:", error);
			set({
				error: error.response?.data?.message || "Failed to load notifications",
				isLoading: false,
			});
			return [];
		}
	},

	// Get count of unread notifications
	fetchUnreadCount: async () => {
		try {
			const response = await axiosInstance.get("/notifications/unread-count");
			set({ unreadCount: response.data.count || 0 });
			return response.data.count;
		} catch (error) {
			console.error("Error fetching unread count:", error);
			return get().unreadCount; // Return current count on error
		}
	},

	// Mark a single notification as read
	markAsRead: async (notificationId) => {
		try {
			await axiosInstance.patch(`/notifications/${notificationId}/read`);

			// Update notification in state
			const updatedNotifications = get().notifications.map((notification) =>
				notification.id === notificationId
					? { ...notification, is_read: true }
					: notification
			);

			// Recalculate unread count
			const newUnreadCount = updatedNotifications.filter(
				(n) => !n.is_read
			).length;

			set({
				notifications: updatedNotifications,
				unreadCount: newUnreadCount,
			});

			return true;
		} catch (error) {
			console.error("Error marking notification as read:", error);
			toast.error("Failed to mark notification as read");
			return false;
		}
	},

	// Mark all notifications as read
	markAllAsRead: async () => {
		try {
			await axiosInstance.patch("/notifications/read-all");

			// Update all notifications in state
			const updatedNotifications = get().notifications.map((notification) => ({
				...notification,
				is_read: true,
			}));

			set({
				notifications: updatedNotifications,
				unreadCount: 0,
			});

			return true;
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
			toast.error("Failed to mark all notifications as read");
			return false;
		}
	},

	getSeekerNotifications: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/notifications/seeker");
			console.log("Seeker notifications:", response);
			set({ notifications: response.data.notifications, isLoading: false });
			return response.data.notifications;
		} catch (error) {
			console.error("Error fetching notifications:", error);
			return [];
		}
	},

	// Clear notifications state (useful for logout)
	clearNotifications: () => {
		set({
			notifications: [],
			unreadCount: 0,
			error: null,
		});
	},
}));
