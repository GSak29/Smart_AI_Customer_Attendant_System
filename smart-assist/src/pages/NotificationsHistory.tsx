import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Notification {
    id: string;
    message?: string;
    title?: string;
    timestamp?: Timestamp | any;
    read?: boolean;
    [key: string]: any;
}

const NotificationsHistory = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
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

            const readNotifs = allNotifs.filter(n => n.read === true);
            setNotifications(readNotifs);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleString();
        }
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                    <ChevronLeft size={24} />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Notification History</h2>
                    <p className="text-muted-foreground">Archive of read system alerts and updates</p>
                </div>
            </div>

            <div className="grid gap-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No read notifications in history.</p>
                    </div>
                ) : (
                    notifications.map((notif, index) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold leading-none tracking-tight">
                                            {notif.title || notif.message || 'Notification'}
                                        </h3>
                                    </div>
                                    {notif.title && notif.message && (
                                        <p className="text-sm text-muted-foreground">
                                            {notif.message}
                                        </p>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                    {formatDate(notif.timestamp)}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsHistory;
