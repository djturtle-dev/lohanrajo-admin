'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu, X, LayoutDashboard, Package, Star,
    UserCheck, FolderTree, Users, Mail, PanelBottom
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SignOutButton from './SignOutButton';
import Image from 'next/image';

interface SidebarLinkProps {
    href: string;
    icon: any;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

function SidebarLink({ href, icon: Icon, children, onClick, className }: SidebarLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center px-6 py-3 transition-colors text-sm fancy-text",
                isActive
                    ? "bg-brand-panel text-brand-accent border-r-2 border-brand-accent"
                    : "text-brand-muted hover:bg-brand-panel hover:text-brand-accent",
                className
            )}
        >
            <Icon className="w-4 h-4 mr-3" /> {children}
        </Link>
    );
}

export default function SidebarClient({ children, role, user }: {
    children: React.ReactNode,
    role?: string,
    user?: any
}) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const links = [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        ...(role === 'ADMIN' ? [{ href: '/admin/users', icon: Users, label: 'Manage Editors' }] : []),
        { href: '/admin/messages', icon: Mail, label: 'Messages', className: "border-t border-brand-border mt-4 pt-4" },
        { href: '/admin/products', icon: Package, label: 'Products', className: "border-t border-brand-border mt-4 pt-4" },
        { href: '/admin/categories', icon: FolderTree, label: 'Categories' },
        { href: '/admin/testimonials', icon: Star, label: 'Testimonials' },
        { href: '/admin/home', icon: LayoutDashboard, label: 'Home Page', className: "border-t border-brand-border mt-4 pt-4" },
        { href: '/admin/about', icon: UserCheck, label: 'About Page' },
        { href: '/admin/footer', icon: PanelBottom, label: 'Footer Links' },
    ];

    return (
        <>
            {/* Desktop Sidebar (Left) */}
            <aside className="w-64 border-r border-brand-border bg-brand-panel hidden md:flex flex-col shadow-sm fixed inset-y-0 left-0 z-30">
                <div className="px-2 py-4 border-b border-brand-border flex flex-col items-center">
                    {children}
                </div>
                <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <SidebarLink key={link.href} {...link}>
                            {link.label}
                        </SidebarLink>
                    ))}
                </nav>
            </aside>

            {/* Mobile Header (Top) */}
            <div className="md:hidden h-16 border-b border-brand-border bg-brand-panel flex items-center justify-between px-4 fixed top-0 w-full z-40">
                <div className="h-10 w-24 relative">
                    {children}
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-brand-muted hover:text-brand-accent transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 z-30 bg-brand-panel transform transition-transform duration-300 md:hidden pt-20",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <nav className="p-4 flex flex-col h-full bg-brand-panel">
                    {/* User Profile in Mobile Menu */}
                    <div className="flex items-center gap-4 mb-8 p-4 bg-brand-bg border border-brand-border">
                        <div className="w-12 h-12 bg-brand-panel border border-brand-border flex items-center justify-center text-brand-accent overflow-hidden">
                            {user?.image ? (
                                <Image src={user.image} alt={user.name || ''} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                                <Users size={24} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-sans font-bold text-brand-text uppercase tracking-tight truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-brand-muted truncate">{user?.email || user?.emailAddress || 'User@Lohanrajo.com'}</p>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1">
                        {links.map((link) => (
                            <SidebarLink key={link.href} {...link} onClick={() => setIsOpen(false)}>
                                {link.label}
                            </SidebarLink>
                        ))}
                    </div>

                    <div className="mt-auto border-t border-brand-border pt-4 px-2">
                        <SignOutButton />
                    </div>
                </nav>
            </div>
        </>
    );
}
