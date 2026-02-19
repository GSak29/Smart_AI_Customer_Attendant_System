import React from 'react';
import { Moon, Sun, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface NavbarProps {
    collapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ collapsed }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header
            className={cn(
                "h-16 border-b border-border bg-card fixed top-0 right-0 z-30 flex items-center justify-between px-6 transition-all duration-300",
                collapsed ? "left-16" : "left-64"
            )}
        >
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </Button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={18} />
                    </div>
                    <span className="text-sm font-medium hidden md:block">Admin</span>
                </div>
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Genexa Logo" className="h-10 w-auto object-contain" />
                </div>
            </div>
        </header>
    );
};
