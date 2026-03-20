import { prisma } from '@/lib/prisma';
import HomeContentEditor from './HomeContentEditor';

export default async function HomeAdminPage() {
    let homeContent = await prisma.homeContent.findUnique({
        where: { id: 'singleton' }
    });

    if (!homeContent) {
        // Fallback default if not yet created via migration
        homeContent = {
            id: 'singleton',
            heroLines: [
                "Precision in *Metal Arts*",
                "*BMS* Panels",
                "*IP Standard* Enclosures",
                "Reflectors, *Poles*",
                "*Oil,* CPG Panels"
            ],
            pillars: [
                { icon: 'Factory', title: 'Infrastructure', desc: 'State-of-the-art manufacturing facilities ensuring uncompromised precision and scale.' },
                { icon: 'ShieldCheck', title: 'ISO Certified', desc: 'ISO 9001:2015 certified quality management systems meeting rigorous international standards.' },
                { icon: 'Lightbulb', title: 'Founded 1992', desc: 'Over three decades of pioneering innovative metal solutions for the evolving industrial landscape.' }
            ],
            updatedAt: new Date()
        } as any;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <div>
                    <h1 className="font-oswald text-3xl uppercase tracking-widest text-brand-text">
                        Home Page Content
                    </h1>
                    <p className="mt-1 text-sm text-brand-muted">Manage animated hero text and the 3 focus pillars.</p>
                </div>
            </div>

            <HomeContentEditor initialData={homeContent} />
        </div>
    );
}
