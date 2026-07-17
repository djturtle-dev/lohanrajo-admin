'use client';

import React, { useState, useMemo } from 'react';
import { Package, Edit, ChevronUp, ChevronDown, Filter, Trash2, Calendar, Tag, Layers } from 'lucide-react';
import { getAssetUrl } from '@/lib/utils';
import ProductEditModal from './ProductEditModal';

interface Category {
    id: string;
    name: string;
}

interface SubCategory {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    images: string[];
    categoryId: string;
    subCategoryId: string | null;
    createdAt: Date;
    category: Category;
    subCategory: SubCategory | null;
}

type SortField = 'name' | 'category' | 'subCategory' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface Props {
    initialProducts: Product[];
    categories: (Category & { subCategories: SubCategory[] })[];
}

export default function ProductsTable({ initialProducts, categories }: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronDown size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />;
        return sortDir === 'asc' ? <ChevronUp size={14} className="text-brand-accent" /> : <ChevronDown size={14} className="text-brand-accent" />;
    };

    const processedProducts = useMemo(() => {
        let result = [...initialProducts];
        
        if (filterCategoryId !== 'all') {
            result = result.filter(p => p.categoryId === filterCategoryId);
        }

        result.sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortField) {
                case 'name':
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                case 'category':
                    valA = a.category.name.toLowerCase();
                    valB = b.category.name.toLowerCase();
                    break;
                case 'subCategory':
                    valA = (a.subCategory?.name || '').toLowerCase();
                    valB = (b.subCategory?.name || '').toLowerCase();
                    break;
                case 'createdAt':
                    valA = new Date(a.createdAt).getTime();
                    valB = new Date(b.createdAt).getTime();
                    break;
                default:
                    valA = a.name;
                    valB = b.name;
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [initialProducts, sortField, sortDir, filterCategoryId]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-2 relative">
                <div className="flex items-center gap-2 bg-brand-panel border border-brand-border px-3 py-1.5 focus-within:border-brand-accent shadow-sm">
                    <Filter size={14} className="text-brand-muted" />
                    <select 
                        value={filterCategoryId} 
                        onChange={e => setFilterCategoryId(e.target.value)}
                        className="bg-transparent text-xs font-sans tracking-wide uppercase focus:outline-none text-brand-text outline-none appearance-none cursor-pointer pr-4"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-brand-panel border border-brand-border overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="border-b border-brand-border bg-brand-panel">
                            <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted w-20">Image</th>
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-1">Name <SortIcon field="name" /></div>
                            </th>
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('category')}
                            >
                                <div className="flex items-center gap-1">Category <SortIcon field="category" /></div>
                            </th>
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('subCategory')}
                            >
                                <div className="flex items-center gap-1">Sub-Category <SortIcon field="subCategory" /></div>
                            </th>
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('createdAt')}
                            >
                                <div className="flex items-center gap-1">Created <SortIcon field="createdAt" /></div>
                            </th>
                            <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {processedProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-brand-muted text-sm font-sans tracking-widest uppercase">
                                    No products found matching your criteria.
                                </td>
                            </tr>
                        ) : processedProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-brand-panel transition-colors group">
                                <td className="p-4">
                                    <div className="w-12 h-12 border border-brand-border bg-brand-panel overflow-hidden shadow-sm">
                                        {p.images && p.images.length > 0 ? (
                                            <img 
                                                src={getAssetUrl(p.images[0])} 
                                                alt={p.name} 
                                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-brand-panel text-brand-muted/30">
                                                <Package size={16} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-brand-text truncate max-w-xs" title={p.name}>
                                        {p.name}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-accent/5 text-brand-accent text-[10px] font-sans tracking-widest uppercase border border-brand-accent/10">
                                        {p.category.name}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {p.subCategory ? (
                                        <span className="text-brand-muted text-xs font-sans">
                                            {p.subCategory.name}
                                        </span>
                                    ) : (
                                        <span className="text-brand-muted/40 text-[10px]">—</span>
                                    )}
                                </td>
                                <td className="p-4 font-sans text-xs text-brand-muted whitespace-nowrap">
                                    {new Date(p.createdAt).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => setSelectedProduct(p)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-panel border border-brand-border text-brand-text hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all font-sans text-[10px] uppercase tracking-widest shadow-sm"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedProduct && (
                <ProductEditModal 
                    product={selectedProduct} 
                    categories={categories}
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </div>
    );
}
