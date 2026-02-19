import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    id: string;
}

interface ToastContainerProps {
    toasts: ToastProps[];
    removeToast: (id: string) => void;
}

export const Toast: React.FC<ToastProps & { onClose: () => void }> = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <AlertCircle className="w-5 h-5 text-blue-500" />,
    };

    const bgColors = {
        success: "bg-background border-green-500/20",
        error: "bg-background border-red-500/20",
        info: "bg-background border-blue-500/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "flex items-center gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] z-[100]",
                bgColors[type]
            )}
        >
            {icons[type]}
            <p className="text-sm font-medium flex-1">{message}</p>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};
