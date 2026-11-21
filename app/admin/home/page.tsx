import { prisma } from '@/lib/prisma';
import HomeContentEditor from './HomeContentEditor';

export default async function HomeAdminPage() {
    const [homeContentRecord, categories, products] = await Promise.all([
        prisma.homeContent.findUnique({
            where: { id: 'singleton' }
        }),
        prisma.category.findMany({
            where: { isDeleted: false },
            orderBy: { name: 'asc' }
        }),
        prisma.product.findMany({
            where: { isDeleted: false },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, images: true, categoryId: true }
        })
    ]);

    const defaultFeatured = [
        { name: 'Panels', label: 'BMS Panels', icon: 'Server', imageUrl: '/images/products/bms-panels.png' },
        { name: 'Enclosures', label: 'IP Enclosures', icon: 'Box', imageUrl: '/images/products/ip-enclosures.png' },
        { name: 'Reflectors', label: 'Reflectors', icon: 'Sun', imageUrl: '/images/products/reflectors.png' },
        { name: 'Poles', label: 'Industrial Poles', icon: 'Zap', imageUrl: '/images/products/industrial-poles.png' },
    ];

    const homeContent = homeContentRecord || {
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
        featuredProducts: defaultFeatured,
        updatedAt: new Date()
    } as any;

    if (!homeContent.featuredProducts || (Array.isArray(homeContent.featuredProducts) && homeContent.featuredProducts.length === 0)) {
        homeContent.featuredProducts = defaultFeatured;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <div>
                    <h1 className="text-3xl text-brand-text fancy-text">
                        Home Page Content
                    </h1>
                    <p className="mt-1 text-sm text-brand-muted">
                        Manage animated hero text, focus pillars, and featured &ldquo;Our products&rdquo; cards.
                    </p>
                </div>
            </div>

            <HomeContentEditor 
                initialData={homeContent} 
                categories={categories}
                products={products}
            />
        </div>
    );
}
