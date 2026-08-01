import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { toggleUserApproval, toggleUserRole } from '@/app/admin/actions';
import { Shield, ShieldAlert, Check, X, User } from 'lucide-react';
import { User as PrismaUser } from '@prisma/client';

export default async function UsersAdmin() {
    const result = await auth.getSession();
    const session = result.data;
    if (!session?.user) redirect('/login');

    const email = (session.user as any).email || (session.user as any).emailAddress;
    const currentUser = await prisma.user.findUnique({ where: { email } });

    if (!currentUser || currentUser.role !== 'ADMIN' || !currentUser.isApproved) {
        redirect('/admin');
    }

    const allUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-panel border border-brand-border flex items-center justify-center text-brand-accent shadow-sm">
                        <User size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl text-brand-text fancy-text">
                            Users & Access
                        </h1>
                        <p className="text-[10px] text-brand-muted uppercase tracking-widest mt-1">Role Management System</p>
                    </div>
                </div>
            </div>

            <div className="bg-brand-panel border border-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg/50">
                                <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted">Email Address</th>
                                <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted text-center">Role</th>
                                <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted text-center">Approved</th>
                                <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted">Joined On</th>
                                <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {allUsers.map((u: PrismaUser) => (
                                <tr key={u.id} className="hover:bg-brand-bg/20 transition-colors group">
                                    <td className="p-4 font-sans text-sm text-brand-text font-medium">
                                        {u.email}
                                        {u.email === email && (
                                            <span className="ml-2 text-[10px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded uppercase font-sans">You</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {u.role === 'ADMIN' ? (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    <ShieldAlert size={12} /> Admin
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    <Shield size={12} /> Editor
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {u.isApproved ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-widest">
                                                <Check size={14} /> Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-brand-muted text-[10px] font-bold uppercase tracking-widest">
                                                <X size={14} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-xs text-brand-muted font-sans">
                                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                                            {u.email !== email && (
                                                <>
                                                    {/* Toggle Role */}
                                                    <form action={toggleUserRole}>
                                                        <input type="hidden" name="id" value={u.id} />
                                                        <input type="hidden" name="currentRole" value={u.role} />
                                                        <button
                                                            type="submit"
 className="text-[10px] font-sans uppercase tracking-widest border hover:border-brand-accent/20 px-2 py-1 transition-all btn-glass-secondary rounded-full "
                                                        >
                                                            Switch to {u.role === 'ADMIN' ? 'Editor' : 'Admin'}
                                                        </button>
                                                    </form>

                                                    {/* Toggle Approval */}
                                                    <form action={toggleUserApproval}>
                                                        <input type="hidden" name="id" value={u.id} />
                                                        <input type="hidden" name="currentStatus" value={String(u.isApproved)} />
                                                        <button
                                                            type="submit"
 className={cn("btn-glass-secondary rounded-full font-sans px-4 py-2 text-[10px] uppercase tracking-widest transition-all",
                                                                u.isApproved
                                                                    ? "hover:text-red-600 hover:border-red-200"
                                                                    : "bg-brand-accent hover:bg-brand-accent/90"
                                                            )}
                                                        >
                                                            {u.isApproved ? 'Revoke' : 'Approve'}
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-brand-bg/50 border border-dashed border-brand-border p-6 text-sm text-brand-muted">
                <p className="font-sans uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                    <ShieldAlert size={16} className="text-brand-accent" /> Security Notice
                </p>
                <p className="font-sans">
                    Changes to user status and roles take effect immediately. Denying approval will restrict the user's access to all admin routes.
                    Be careful when granting **Admin** role, as it allows full system access including deleting data and managing other users.
                </p>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
