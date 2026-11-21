import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Package, MessageSquare, Star, Users, Mailbox, Activity, ArrowRight, Phone } from 'lucide-react';
import { getCombinedName, getInitials, formatPhoneNumber } from '@/lib/contact';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const [
        productCount, 
        testimonialCount, 
        unreadMessagesCount, 
        totalMessagesCount,
        recentMessages
    ] = await Promise.all([
        prisma.product.count(),
        prisma.testimonial.count(),
        prisma.contactSubmission.count({ where: { isRead: false } }),
        prisma.contactSubmission.count(),
        prisma.contactSubmission.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        })
    ]);

    const cards = [
        { 
            name: 'Total Products', 
            val: productCount, 
            href: '/admin/products',
            icon: <Package className="text-brand-accent h-6 w-6" /> 
        },
        { 
            name: 'Testimonials', 
            val: testimonialCount, 
            href: '/admin/testimonials',
            icon: <Star className="text-brand-accent h-6 w-6" /> 
        },
        { 
            name: 'Editors', 
            val: 1, 
            href: '/admin/users',
            icon: <Users className="text-brand-accent h-6 w-6" /> 
        },
        { 
            name: 'Unread Messages', 
            val: unreadMessagesCount, 
            sub: `${totalMessagesCount} Total Messages`,
            href: '/admin/messages',
            icon: <Mailbox className="text-brand-accent h-6 w-6" />,
            highlight: unreadMessagesCount > 0
        },
    ];

    return (
        <div className="bg-brand-bg rounded-xl overflow-hidden border border-brand-border shadow-2xl -mx-4 sm:-mx-8 -mb-4 sm:-mb-8 sm:rounded-none min-h-[calc(100vh-8rem)]">
            <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-10">
                
                {/* Header */}
                <div className="border-b border-brand-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl text-brand-text flex items-center gap-3 fancy-text">
                            <Activity className="text-brand-accent" size={32} />
                            Dashboard
                        </h1>
                        <p className="text-brand-muted font-sans mt-2 text-sm">
                            Overview of your system metrics and activities.
                        </p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => {
                        const content = (
                            <div className={`card-glass p-6 flex flex-col justify-between group h-full relative overflow-hidden transition-all duration-300 hover:border-brand-accent/50 ${card.highlight ? 'ring-1 ring-brand-accent/50' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-brand-muted font-sans uppercase tracking-wider text-sm font-semibold">{card.name}</span>
                                    <div className="p-2 bg-brand-border rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        {card.icon}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-5xl font-black text-brand-text font-sans group-hover:text-brand-accent transition-colors duration-300">{card.val}</span>
                                    {card.sub && (
                                        <p className="text-xs text-brand-muted font-sans mt-2 uppercase tracking-widest">{card.sub}</p>
                                    )}
                                </div>
                                
                                {/* Decorative element for the highlight */}
                                {card.highlight && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-accent/20 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                                )}
                            </div>
                        );

                        return card.href ? (
                            <Link key={i} href={card.href} className="block">
                                {content}
                            </Link>
                        ) : (
                            <div key={i}>{content}</div>
                        );
                    })}
                </div>

                {/* Recent Inquiries Table */}
                <div className="card-glass border border-brand-border overflow-hidden">
                    <div className="p-5 border-b border-brand-border bg-[var(--theme-bg)] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <MessageSquare className="text-brand-accent" size={20} />
                            <h2 className="text-lg font-sans font-bold text-brand-text">Recent Inquiries</h2>
                        </div>
                        <Link 
                            href="/admin/messages" 
                            className="text-xs font-sans text-brand-accent hover:text-brand-text flex items-center gap-1 transition-colors uppercase tracking-wider font-semibold"
                        >
                            <span>View All In Inbox</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        {recentMessages.length === 0 ? (
                            <div className="p-10 text-center text-sm font-sans text-brand-muted">
                                No contact submissions received yet.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm font-sans border-collapse">
                                <thead>
                                    <tr className="border-b border-brand-border bg-brand-panel text-[11px] font-sans uppercase tracking-widest text-brand-muted">
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Phone Number</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/40">
                                    {recentMessages.map(msg => {
                                        const combinedName = getCombinedName(msg.firstName, msg.lastName);
                                        const formattedPhone = formatPhoneNumber(msg.phone);
                                        return (
                                            <tr key={msg.id} className="hover:bg-brand-panel/60 transition-colors">
                                                <td className="py-3 px-4">
                                                    {!msg.isRead ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-brand-accent text-white">
                                                            New
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-brand-muted">Read</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-brand-text whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-[var(--theme-panel)] border border-brand-border flex items-center justify-center text-xs font-bold text-brand-text shrink-0">
                                                            {getInitials(combinedName)}
                                                        </div>
                                                        <span>{combinedName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-xs text-brand-text whitespace-nowrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone size={12} className="text-brand-accent/80" />
                                                        {formattedPhone}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-xs text-brand-muted whitespace-nowrap">
                                                    {msg.email}
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className="inline-block px-2 py-0.5 rounded bg-brand-border/50 text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-text">
                                                        {msg.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-xs text-brand-muted whitespace-nowrap">
                                                    {new Date(msg.createdAt).toLocaleDateString('en-GB', { 
                                                        day: 'numeric', month: 'short' 
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
