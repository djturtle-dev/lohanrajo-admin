import { prisma } from '@/lib/prisma';
import { Package, MessageSquare, Star, Users } from 'lucide-react';
import ClarityMetrics from '@/components/admin/ClarityMetrics';

export default async function AdminDashboard() {
    const [productCount, testimonialCount] = await Promise.all([
        prisma.product.count(),
        prisma.testimonial.count()
    ]);

    const cards = [
        { name: 'Total Products', val: productCount, icon: <Package className="text-brand-accent h-5 w-5" /> },
        { name: 'Testimonials', val: testimonialCount, icon: <Star className="text-brand-accent h-5 w-5" /> },
        { name: 'Editors', val: 1, icon: <Users className="text-brand-accent h-5 w-5" /> },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {cards.map((card, i) => (
                    <div key={i} className="bg-brand-white border border-brand-border p-6 flex flex-col justify-between group hover:border-brand-accent/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-brand-muted font-oswald uppercase tracking-wider text-sm">{card.name}</span>
                            {card.icon}
                        </div>
                        <span className="text-5xl font-black text-brand-muted font-oswald group-hover:text-brand-accent transition-colors">{card.val}</span>
                    </div>
                ))}
            </div>

            <div className="bg-brand-white border border-brand-border p-8">
                <h2 className="font-oswald text-xl uppercase tracking-widest text-brand-text mb-6">Analytics</h2>
                <ClarityMetrics />
            </div>
        </div>
    );
}
