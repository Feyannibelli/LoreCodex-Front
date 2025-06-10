import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import notificationService, { Notification } from "@/services/notificationService";

const NotificationsBell: React.FC = () => {
    const [notes, setNotes] = useState<Notification[]>([]);
    const unread = notes.filter(n => !n.read).length;

    const load = () =>
        notificationService.getMy().then(setNotes);

    /* carga inicial + polling */
    useEffect(() => {
        load();
        const id = setInterval(load, 60_000);
        return () => clearInterval(id);
    }, []);

    const markOne = (id: number) =>
        notificationService.markAsRead(id).then(() =>
            setNotes(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
        );

    const markAll = () =>
        notificationService.markAllAsRead().then(() =>
            setNotes(prev => prev.map(n => ({ ...n, read: true })))
        );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative">
                    <Bell className="h-6 w-6 text-[#090400] dark:text-white" />
                    {unread > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#F04E42]" />
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-auto">
                {unread > 0 && (
                    <>
                        <DropdownMenuItem
                            onClick={markAll}
                            className="text-center justify-center font-semibold text-blue-600"
                        >
                            Mark all as read
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                {notes.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No notifications.</div>
                ) : (
                    notes.map(n => (
                        <DropdownMenuItem
                            key={n.id}
                            onClick={() => markOne(n.id)}
                            className={`flex flex-col gap-1 ${
                                n.read ? "opacity-60" : "font-semibold"
                            }`}
                        >
                            <span>{n.message}</span>
                            <span className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationsBell;
