import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ToastContainer, type ToastProps } from '../components/ui/Toast';
import { ChevronLeft, Bell, Trash2, CheckSquare, Square, X, AlertTriangle, Loader2 } from 'lucide-react';
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
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<'selected' | 'clear'>('selected');
    const [isDeleting, setIsDeleting] = useState(false);
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const navigate = useNavigate();

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

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

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds(new Set());
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === notifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(notifications.map(n => n.id)));
        }
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        setDeleteAction('selected');
        setIsDeleteModalOpen(true);
    };

    const handleClearHistory = () => {
        if (notifications.length === 0) return;
        setDeleteAction('clear');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const batch = writeBatch(db);
            const count = deleteAction === 'selected' ? selectedIds.size : notifications.length;

            if (deleteAction === 'selected') {
                selectedIds.forEach(id => {
                    const docRef = doc(db, 'notifications', id);
                    batch.delete(docRef);
                });
            } else {
                notifications.forEach(n => {
                    const docRef = doc(db, 'notifications', n.id);
                    batch.delete(docRef);
                });
            }

            // Close modal immediately for better perceived performance, 
            // the listener will update the list
            setIsDeleteModalOpen(false);

            await batch.commit();

            addToast(
                deleteAction === 'selected'
                    ? `Successfully deleted ${count} notification${count !== 1 ? 's' : ''}`
                    : "History cleared successfully",
                "success"
            );

            if (deleteAction === 'selected') {
                setIsSelectionMode(false);
                setSelectedIds(new Set());
            }

        } catch (error) {
            console.error("Error deleting notifications:", error);
            addToast("Failed to delete notifications", "error");
            // If error, reopen modal or just show toast? 
            // Better to keep modal closed and show error toast as we already closed it.
        } finally {
            setIsDeleting(false);
        }
    };



    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleString();
        }
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Notification History</h2>
                        <p className="text-muted-foreground">Archive of read system alerts and updates</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isSelectionMode ? (
                        <>
                            {notifications.length > 0 && (
                                <>
                                    <Button variant="outline" onClick={toggleSelectionMode}>
                                        Select
                                    </Button>
                                    <Button variant="destructive" onClick={handleClearHistory}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear History
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={handleSelectAll}>
                                {selectedIds.size === notifications.length ? "Deselect All" : "Select All"}
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSelected} disabled={selectedIds.size === 0}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({selectedIds.size})
                            </Button>
                            <Button variant="ghost" size="icon" onClick={toggleSelectionMode}>
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    )}
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
                            className={`p-4 rounded-lg border shadow-sm transition-colors ${isSelectionMode && selectedIds.has(notif.id)
                                ? 'bg-primary/10 border-primary'
                                : 'bg-card text-card-foreground'
                                } ${isSelectionMode ? 'cursor-pointer hover:bg-accent' : ''}`}
                            onClick={() => isSelectionMode && toggleSelect(notif.id)}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div className="flex items-start gap-3">
                                    {isSelectionMode && (
                                        <div className="mt-1">
                                            {selectedIds.has(notif.id) ? (
                                                <CheckSquare className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Square className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    )}
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
                                </div>
                                <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                    {formatDate(notif.timestamp)}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={deleteAction === 'selected' ? 'Delete Selected?' : 'Clear History?'}
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-destructive bg-destructive/10 p-4 rounded-lg">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="font-medium">Warning: This action cannot be undone.</p>
                    </div>

                    <p className="text-muted-foreground">
                        {deleteAction === 'selected'
                            ? `Are you sure you want to delete ${selectedIds.size} selected notification(s)?`
                            : "Are you sure you want to permanently delete ALL notification history?"
                        }
                    </p>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            {deleteAction === 'selected' ? (isDeleting ? 'Deleting...' : 'Delete') : (isDeleting ? 'Clearing...' : 'Clear All')}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default NotificationsHistory;
