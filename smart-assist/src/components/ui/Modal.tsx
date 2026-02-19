import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className,
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 md:inset-0 h-full max-h-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn("relative w-full max-w-md max-h-full rounded-lg shadow-lg bg-background", className)}
                    >
                        <div className="flex items-center justify-between p-4 border-b md:p-5 rounded-t dark:border-gray-600">
                            {title && <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {title}
                            </h3>}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                                <span className="sr-only">Close modal</span>
                            </Button>
                        </div>
                        <div className="p-4 md:p-5 space-y-4">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
