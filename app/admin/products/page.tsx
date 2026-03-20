import { prisma } from '@/lib/prisma';
import { Package } from 'lucide-react';
import AddProductForm from '@/components/admin/AddProductForm';
import ProductsTable from '@/components/admin/ProductsTable';
import { getAssetUrl } from '@/lib/utils';

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        where: { isDeleted: false },
        include: {
            category: true,
            subCategory: true
        },
        orderBy: { category: { name: 'asc' } }
    });

    const categories = await prisma.category.findMany({
        where: { isDeleted: false },
        include: { 
            subCategories: {
                where: { isDeleted: false }
            } 
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
                <h1 className="font-oswald text-3xl uppercase tracking-widest text-brand-text">Product Management</h1>
                <span className="text-sm font-oswald tracking-widest uppercase text-brand-muted">{products.length} Products</span>
            </div>

            <div className="bg-white border border-brand-border p-8 rounded-none shadow-sm">
                <h2 className="font-oswald text-xl uppercase tracking-widest text-brand-text mb-6 flex items-center">
                    <Package className="mr-3 w-5 h-5 text-brand-accent" /> Add New Product
                </h2>
                <AddProductForm categories={categories} />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-oswald text-xl uppercase tracking-widest text-brand-text">Manage Inventory</h2>
                </div>

                <ProductsTable 
                    initialProducts={products} 
                    categories={categories} 
                />
            </div>
        </div>
    );
}
