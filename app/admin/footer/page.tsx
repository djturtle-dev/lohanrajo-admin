import { prisma } from '@/lib/prisma';
import FooterContentEditor from './FooterContentEditor';

export default async function FooterAdminPage() {
    const [footerContentRecord, categories, products] = await Promise.all([
        (prisma as any).footerContent.findUnique({
            where: { id: 'singleton' }
        }),
        prisma.category.findMany({
            where: { isDeleted: false },
            orderBy: { name: 'asc' }
        }),
        prisma.product.findMany({
            where: { isDeleted: false },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, categoryId: true }
        })
    ]);

    const defaultFooter = {
        id: 'singleton',
        companyDesc: "Passionate about manufacturing high quality engineering products since 1992. Chennai, India.",
        contactLinks: [
            { label: 'lohanrajoliat@gmail.com', href: 'mailto:lohanrajoliat@gmail.com' },
            { label: 'Send a Message', href: '/contact' },
            { label: 'Careers', href: '/contact?type=CAREER' },
        ],
        productLinks: [
            { label: 'BMS Panels', href: '/products' },
            { label: 'IP Enclosures', href: '/products' },
            { label: 'Reflectors', href: '/products' },
            { label: 'Industrial Poles', href: '/products' },
        ]
    };

    const initialData = footerContentRecord || defaultFooter;

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <div>
                    <h1 className="text-3xl text-brand-text fancy-text">
                        Footer Content &amp; Links
                    </h1>
                    <p className="mt-1 text-sm text-brand-muted">
                        Customize company tagline and manage dynamic navigation links for Contact and Products columns.
                    </p>
                </div>
            </div>

            <FooterContentEditor 
                initialData={initialData}
                categories={categories}
                products={products}
            />
        </div>
    );
}
