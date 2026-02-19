import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    UploadCloud,
    LogOut,
    ChevronLeft,
    ChevronRight,

} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Products', path: '/products' },
        { icon: Tags, label: 'Categories', path: '/categories' },
        { icon: UploadCloud, label: 'Upload', path: '/upload' },

    ];

    return (
        <aside
            className={cn(
                "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col fixed left-0 top-0 z-40",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-4 border-b border-border h-16">
                {!collapsed && <span className="font-orbitron font-black italic text-3xl tracking-wider text-genexa-gradient truncate">GENEXA</span>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn("ml-auto", collapsed && "mx-auto")}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="p-2 border-t border-border">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
                        collapsed && "justify-center px-2"
                    )}
                    onClick={logout}
                >
                    <LogOut size={20} />
                    {!collapsed && <span className="ml-2">Logout</span>}
                </Button>
            </div>
        </aside>
    );
};
