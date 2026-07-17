import Link from 'next/link';
import Image from 'next/image';
import { User, ExternalLink } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import SignOutButton from '@/components/admin/SignOutButton';
import SidebarClient from '@/components/admin/SidebarClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    let session: any = null;

    try {
        const result = await auth.getSession();
        session = result.data;
    } catch (err: any) {
        console.error("AdminLayout auth check failed:", err.message);
    }

    if (!session?.user) {
        redirect('/login');
    }

    const { user: sessionUser } = session;
    const email = (sessionUser.email || sessionUser.emailAddress || '').toLowerCase();

    if (!email) {
        redirect('/login');
    }

    // Fetch or create the database user record
    let dbUser = await prisma.user.findUnique({
        where: { email }
    });

    if (!dbUser) {
        // Auto-create as unapproved editor
        dbUser = await prisma.user.create({
            data: {
                email,
                role: 'EDITOR',
                isApproved: false
            }
        });
    }

    // If not approved, show pending screen
    if (!dbUser.isApproved) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-brand-panel border border-brand-border p-8 text-center space-y-6 shadow-xl">
                    <div className="w-16 h-16 bg-brand-panel mx-auto flex items-center justify-center text-brand-accent rounded-full border border-brand-border">
                        <User size={32} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl text-brand-text fancy-text">Approval Pending</h1>
                        <p className="text-sm text-brand-muted font-sans">
                            Your account (<span className="font-bold text-brand-text">{email}</span>) is pending admin approval.
                        </p>
                    </div>
                    <div className="p-4 bg-[#1a1a1a]/50 border border-brand-border text-xs text-brand-muted font-sans italic">
                        Once approved, you will have access to the management portal.
                    </div>
                    <div className="pt-4 border-t border-brand-border">
                        <SignOutButton />
                    </div>
                </div>
            </div>
        );
    }

    const user = { ...sessionUser, ...dbUser };

    const Logo = (
        <div className="relative w-32 h-16 pointer-events-none">
            <Image
                src="/logo.png"
                alt="Lohanrajo Logo"
                fill
                className="object-contain"
                priority
                unoptimized
            />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans">
            {/* Sidebar & Mobile Header Wrapper */}
            <SidebarClient role={dbUser.role} user={user}>
                {Logo}
            </SidebarClient>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 md:ml-64 pt-16 md:pt-0">
                {/* Top Desktop Header */}
                <div className="h-24 border-b border-brand-border hidden md:flex items-center justify-between px-8 bg-brand-panel shadow-sm sticky top-0 z-20">
                    <div>
                        <h1 className="text-brand-text text-xl fancy-text">Admin Portal</h1>
                        <p className="text-[10px] text-brand-muted uppercase tracking-[0.2em]">Management System</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <a
                            href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] font-sans tracking-widest uppercase text-brand-muted hover:text-brand-accent transition-colors border border-brand-border px-3 py-1.5 rounded"
                        >
                            <ExternalLink size={12} /> View Live Site
                        </a>

                        <div className="flex items-center gap-4 pl-6 border-l border-brand-border">
                            <SignOutButton />
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-brand-border">
                            <div className="text-right">
                                <p className="text-sm font-bold text-brand-text uppercase tracking-tight">{user?.name || 'Admin User'}</p>
                                <p className="text-xs text-brand-muted">{user?.email || user?.emailAddress || 'User@Lohanrajo.com'}</p>
                            </div>
                            <div className="w-10 h-10 bg-brand-panel border border-brand-border flex items-center justify-center text-brand-accent">
                                {user?.image ? (
                                    <Image src={user.image} alt={user.name || ''} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-8">
                    {children}
                </div>

                {/* Mobile Bottom Spacer/Signout */}
                <div className="md:hidden p-4 border-t border-brand-border mt-auto">
                    <SignOutButton />
                </div>
            </main>
        </div>
    );
}
