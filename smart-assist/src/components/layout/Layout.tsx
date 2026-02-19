import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '../../utils/cn';

export const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Navbar collapsed={collapsed} />

            <main
                className={cn(
                    "px-6 pb-6 pt-28 min-h-screen transition-all duration-300",
                    collapsed ? "ml-16" : "ml-64"
                )}
            >
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
