import { prisma } from '@/lib/prisma';
import CategoriesManager from './CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        where: { isDeleted: false },
        include: {
            subCategories: {
                where: { isDeleted: false }
            },
            _count: {
                select: { products: { where: { isDeleted: false } } }
            }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <div>
                    <h1 className="text-3xl text-brand-text fancy-text">
                        Categories & Subcategories
                    </h1>
                    <p className="mt-1 text-sm text-brand-muted">Manage product hierarchy and grouping.</p>
                </div>
                <div className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                    {categories.length} Categories
                </div>
            </div>

            <CategoriesManager initialCategories={categories} />
        </div>
    );
}
