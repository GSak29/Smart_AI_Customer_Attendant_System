import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Bell, ExternalLink, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Notification {
    id: string;
    message?: string;
    title?: string;
    timestamp?: Timestamp | any;
    read?: boolean;
    [key: string]: any;
}

export const NotificationCard = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Query for ALL notifications, ordered by timestamp
        // Filtering done client-side to avoid missing composite index
        const q = query(
            collection(db, 'notifications'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allNotifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];

            // Filter: limit(5) implies showing only recent ones, so let's filter first then slice
            const unreadNotifs = allNotifs.filter(n => n.read === false).slice(0, 5);
            setNotifications(unreadNotifs);
        });

        return () => unsubscribe();
    }, []);

    const handleExpand = () => {
        navigate('/notifications-history');
    };

    const handleNotificationClick = (notif: Notification) => {
        setSelectedNotification(notif);
        setIsModalOpen(true);
    };

    const handleCloseModal = async () => {
        setIsModalOpen(false);
        if (selectedNotification) {
            // Mark as read when closing the modal
            await handleMarkAsRead(selectedNotification.id);
            setSelectedNotification(null);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            const notifRef = doc(db, 'notifications', id);
            await updateDoc(notifRef, {
                read: true
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        // Handle Firestore Timestamp
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleString();
        }
        // Handle JS Date or string
        return new Date(timestamp).toLocaleString();
    };

    return (
        <>
            <Card className="col-span-4 h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-medium">Recent Messages (Unread)</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleExpand} className="gap-1">
                        History <ExternalLink size={14} />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-4">No unread messages.</p>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className="flex flex-col gap-1 border-b pb-2 last:border-0 bg-muted/30 -mx-2 px-2 py-2 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-semibold text-foreground">
                                            {notif.title || notif.message || 'New Notification'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDate(notif.timestamp)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notif.id);
                                                }}
                                                title="Mark as Read"
                                            >
                                                <Check size={14} className="text-green-600" />
                                            </Button>
                                        </div>
                                    </div>
                                    {notif.title && notif.message && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notif.message}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedNotification?.title || "Notification Details"}
            >
                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        {selectedNotification && formatDate(selectedNotification.timestamp)}
                    </div>
                    <div className="text-base text-foreground whitespace-pre-wrap">
                        {selectedNotification?.message || "No content."}
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleCloseModal}>
                            Close & Mark as Read
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
