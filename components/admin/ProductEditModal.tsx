'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Trash2, Save, Package } from 'lucide-react';
import { updateProduct, deleteProduct } from '@/app/admin/product-actions';
import dynamic from 'next/dynamic';
import { getAssetUrl } from '@/lib/utils';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

interface Category {
    id: string;
    name: string;
    subCategories: { id: string; name: string }[];
}

interface Product {
    id: string;
    name: string;
    description: string;
    images: string[];
    categoryId: string;
    subCategoryId: string | null;
    createdAt: Date;
}

interface Props {
    product: Product;
    categories: Category[];
    onClose: () => void;
}

export default function ProductEditModal({ product, categories, onClose }: Props) {
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [categoryId, setCategoryId] = useState(product.categoryId);
    const [subCategoryId, setSubCategoryId] = useState(product.subCategoryId || '');
    const [existingImages, setExistingImages] = useState<string[]>(product.images);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const currentCategory = categories.find(c => c.id === categoryId);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileList = Array.from(files);
            setNewImages(prev => [...prev, ...fileList]);
            const previews = fileList.map(file => URL.createObjectURL(file));
            setNewPreviews(prev => [...prev, ...previews]);
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index]);
            return updated.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('id', product.id);
            formData.append('name', name);
            formData.append('categoryId', categoryId);
            formData.append('subCategoryId', subCategoryId);
            formData.append('description', description);
            
            existingImages.forEach(img => formData.append('existingImages', img));
            newImages.forEach(file => formData.append('images', file));

            await updateProduct(formData);
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update product');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const formData = new FormData();
            formData.append('id', product.id);
            await deleteProduct(formData);
            onClose();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete product');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-brand-panel max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] border border-brand-border">
                {/* Header */}
                <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-panel">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-accent flex items-center justify-center text-white">
                            <Package size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl text-brand-text fancy-text">Edit Product</h2>
                            <p className="text-[10px] font-sans tracking-widest text-brand-muted uppercase">Product ID: {product.id.split('-')[0]}...</p>
                        </div>
                    </div>
 <button onClick={onClose} className="transition-colors p-2 btn-glass-secondary rounded-full font-sans ">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form id="edit-product-form" onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Product Name *</label>
                                <input 
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm transition-all"
                                    placeholder="Product Name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Category *</label>
                                    <select 
                                        required
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm transition-all appearance-none cursor-pointer"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Sub-Category</label>
                                    <select 
                                        value={subCategoryId}
                                        onChange={e => setSubCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm transition-all appearance-none cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="">None</option>
                                        {currentCategory?.subCategories.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Images</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Existing Images */}
                                    {existingImages.map((src, i) => (
                                        <div key={`exist-${i}`} className="aspect-square relative border border-brand-border bg-brand-panel group p-1">
                                            <img src={getAssetUrl(src)} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                            <button 
                                                type="button"
                                                onClick={() => removeExistingImage(i)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-brand-text p-1 shadow-md hover:bg-black transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New Images */}
                                    {newPreviews.map((src, i) => (
                                        <div key={`new-${i}`} className="aspect-square relative border border-brand-border bg-brand-accent/5 p-1">
                                            <img src={src} alt="" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeNewImage(i)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-brand-text p-1 shadow-md hover:bg-black transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                            <div className="absolute bottom-1 right-1 bg-brand-accent text-white text-[8px] font-sans uppercase px-1 px-0.5 tracking-tighter">New</div>
                                        </div>
                                    ))}
                                    {/* Add Button */}
                                    <label className="aspect-square border border-dashed border-brand-border flex flex-col items-center justify-center cursor-pointer hover:bg-brand-panel hover:border-brand-accent transition-all text-brand-muted hover:text-brand-accent">
                                        <ImageIcon size={20} className="mb-1" />
                                        <span className="text-[9px] font-sans tracking-widest uppercase">Add</span>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            className="hidden rounded-full placeholder-brand-muted/40" 
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Description */}
                        <div className="space-y-2">
                            <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Full Description *</label>
                            <RichTextEditor 
                                content={description} 
                                onChange={setDescription}
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-brand-border flex justify-between items-center bg-brand-panel">
                    <button 
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSaving || isDeleting}
                        className="flex items-center gap-2 text-brand-muted hover:text-red-600 px-4 py-2 hover:bg-red-50 transition-all font-sans text-xs tracking-widest uppercase disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Delete Product
                    </button>

                    <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={onClose}
 className="px-8 py-3 btn-glass-secondary text-xs tracking-widest uppercase border border-brand-border hover:btn-glass-secondary transition-all shadow-sm rounded-full font-sans"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            form="edit-product-form"
                            disabled={isSaving || isDeleting}
                            className="px-8 py-3 btn-glass-primary text-xs tracking-widest uppercase transition-all shadow-md disabled:opacity-50 flex items-center gap-2 rounded-full font-sans"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-brand-border border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {isSaving ? 'Processing...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-brand-panel max-w-sm w-full p-8 shadow-2xl border border-brand-border">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-none flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="font-sans text-xl uppercase tracking-widest text-brand-text text-center mb-2">Confirm Delete</h3>
                        <p className="text-brand-muted text-sm text-center mb-8 font-sans">
                            Are you sure you want to delete <span className="text-brand-text font-bold">"{product.name}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
 className="w-full py-4 bg-red-600 font-sans text-sm font-bold tracking-widest uppercase hover:bg-black transition-all flex items-center justify-center gap-2 btn-glass-secondary rounded-full"
                            >
                                {isDeleting && <div className="w-4 h-4 border-2 border-brand-border border-t-white rounded-full animate-spin" />}
                                Delete Permanently
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="w-full py-4 bg-brand-panel text-brand-text font-sans text-sm tracking-widest uppercase border border-brand-border hover:bg-brand-border transition-all"
                            >
                                Nevermind
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
