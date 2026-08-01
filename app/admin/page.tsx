import { prisma } from '@/lib/prisma';
import { Package, MessageSquare, Star, Users, Mailbox, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const [productCount, testimonialCount, unreadMessagesCount, totalMessagesCount] = await Promise.all([
        prisma.product.count(),
        prisma.testimonial.count(),
        prisma.contactSubmission.count({ where: { isRead: false } }),
        prisma.contactSubmission.count()
    ]);

    const cards = [
        { name: 'Total Products', val: productCount, icon: <Package className="text-brand-accent h-6 w-6" /> },
        { name: 'Testimonials', val: testimonialCount, icon: <Star className="text-brand-accent h-6 w-6" /> },
        { name: 'Editors', val: 1, icon: <Users className="text-brand-accent h-6 w-6" /> },
        { 
            name: 'Unread Messages', 
            val: unreadMessagesCount, 
            sub: `${totalMessagesCount} Total Messages`,
            icon: <Mailbox className="text-brand-accent h-6 w-6" />,
            highlight: unreadMessagesCount > 0
        },
    ];

    return (
        <div className="bg-brand-bg rounded-xl overflow-hidden border border-brand-border shadow-2xl -mx-4 sm:-mx-8 -mb-4 sm:-mb-8 sm:rounded-none min-h-[calc(100vh-8rem)]">
            <div className="max-w-6xl mx-auto p-6 md:p-8">
                <div className="mb-8 border-b border-brand-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {cards.map((card, i) => (
                        <div key={i} className={`card-glass p-6 flex flex-col justify-between group ${card.highlight ? 'ring-1 ring-brand-accent/50' : ''}`}>
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
                    ))}
                </div>
            </div>
        </div>
    );
}
