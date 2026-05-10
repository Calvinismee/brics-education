export function normalizeNotifications(notifications) {
    if (Array.isArray(notifications?.data)) {
        return notifications.data;
    }

    return Array.isArray(notifications) ? notifications : [];
}

export function sortNotifications(notifications) {
    return [...normalizeNotifications(notifications)].sort((a, b) => {
        if (a.is_read !== b.is_read) {
            return a.is_read ? 1 : -1;
        }

        if (!a.is_read && !b.is_read) {
            return new Date(b.created_at) - new Date(a.created_at);
        }

        return new Date(a.created_at) - new Date(b.created_at);
    });
}

export function countUnreadNotifications(notifications) {
    return normalizeNotifications(notifications).filter((notification) => !notification.is_read).length;
}
