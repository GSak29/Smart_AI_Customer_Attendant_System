import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
    variant?: 'default' | 'destructive';
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', title, children, className }) => {
    const isDestructive = variant === 'destructive';
    const Icon = isDestructive ? AlertTriangle : Info;

    return (
        <div
            className={cn(
                "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
                isDestructive
                    ? "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10"
                    : "bg-background text-foreground",
                className
            )}
            role="alert"
        >
            <Icon className="h-4 w-4" />
            <div className="pl-7">
                {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
                <div className="text-sm [&_p]:leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};
