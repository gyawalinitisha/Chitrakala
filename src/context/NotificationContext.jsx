import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { API_URL } from '../config';

export const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const { socket } = useChat();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!user?.token) return;
        try {
            const res = await fetch(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [user]);

    // Fetch on login, poll every 30s
    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, fetchNotifications]);

    // Real-time via socket
    useEffect(() => {
        if (!socket) return;
        const handler = (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        };
        socket.on('new_notification', handler);
        return () => socket.off('new_notification', handler);
    }, [socket]);

    // Optimistic: update UI instantly, fire API in background
    const markAsRead = useCallback(async (id) => {
        if (!user?.token) return;
        // Skip API call if already read (check current state)
        setNotifications(prev => {
            const target = prev.find(n => n._id === id);
            if (!target || target.isRead) return prev; // already read, no change
            return prev.map(n => n._id === id ? { ...n, isRead: true } : n);
        });
        setUnreadCount(prev => {
            const target = notifications.find(n => n._id === id);
            if (!target || target.isRead) return prev;
            return Math.max(0, prev - 1);
        });
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${user.token}` }
            });
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            // Re-fetch to get accurate state on failure
            fetchNotifications();
        }
    }, [user, notifications, fetchNotifications]);

    // Optimistic: clears badge instantly, syncs to server in background
    const markAllAsRead = useCallback(async () => {
        if (!user?.token) return;
        // Instant UI update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${user.token}` }
            });
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
