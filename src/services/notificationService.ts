import apiAuth from "./apiAuth";

export interface Notification {
    id: number;
    message: string;
    createdAt: string;
    read: boolean;
}

const notificationService = {
    getMy: () =>
        apiAuth.get<Notification[]>("/notifications").then(r => r.data),

    markAsRead: (id: number) =>
        apiAuth.put(`/notifications/${id}/read`),

    markAllAsRead: () =>
        apiAuth.put("/notifications/mark-all-read"),

};

export default notificationService;
