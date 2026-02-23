"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface Notification {
  _id: string;
  message: string;
  taskId: {
    _id: string;
    title: string;
  };
  read: boolean;
  createdAt: string;
  type: "deadline-warning" | "task-overdue";
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    checkForNewNotifications();

    // Poll for new notifications every 5 minutes
    const interval = setInterval(
      () => {
        checkForNewNotifications();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      await fetch("/api/notifications/check", { method: "POST" });
      fetchNotifications();
    } catch (error) {
      console.error("Check notifications error:", error);
    }
  };

  const markAsRead = async (id: string, taskId?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (taskId) {
        setShowDropdown(false);
        router.push("/tasks");
      }
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Delete notification error:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-full p-2 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-800">{unreadCount} chưa đọc</p>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-800">
                  Không có thông báo
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() =>
                      markAsRead(notification._id, notification.taskId?._id)
                    }
                    className={`border-b border-gray-100 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm ${!notification.read ? "font-semibold text-gray-900" : "text-gray-800"}`}
                        >
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-700">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteNotification(notification._id, e)}
                        className="ml-2 text-gray-700 hover:text-red-600"
                        aria-label="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-2">
                <button
                  onClick={() => {
                    setNotifications([]);
                    setUnreadCount(0);
                    setShowDropdown(false);
                  }}
                  className="w-full rounded p-2 text-sm text-gray-800 hover:bg-gray-100"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
