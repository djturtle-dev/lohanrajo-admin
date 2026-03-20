'use client'

import { addProduct } from '@/app/admin/product-actions';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Image as ImageIcon, X } from 'lucide-react';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

interface Category {
    id: string;
    name: string;
    subCategories: { id: string; name: string }[];
}

export default function AddProductForm({ categories }: { categories: Category[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [description, setDescription] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const currentCategory = categories.find(c => c.id === selectedCategoryId);

    async function handleAdd(formData: FormData) {
        try {
            // Clear existing images from formData if any
            formData.delete('images');
            // Add all selected files
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });
            formData.set('description', description);
            
            const result = await addProduct(formData);
            
            formRef.current?.reset();
            setDescription('');
            setSelectedFiles([]);
            setPreviews([]);
            setSelectedCategoryId('');
            alert('Product added successfully!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please check the image sizes (max 10MB total) and try again.');
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    }

    const removeImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            return newPreviews.filter((_, i) => i !== index);
        });
    }

    return (
        <form ref={formRef} action={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Product Name *</label>
                <input
                    required
                    type="text"
                    name="name"
                    placeholder="e.g. Stainless Steel IP65 Enclosure"
                    className="w-full bg-brand-panel border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                />
            </div>

            <div className="space-y-2">
                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Category *</label>
                <select
                    name="categoryId"
                    required
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full bg-brand-panel border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                >
                    <option value="">Select a category</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Sub-Category</label>
                <select
                    name="subCategoryId"
                    disabled={!selectedCategoryId}
                    className="w-full bg-brand-panel border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors appearance-none disabled:opacity-50"
                >
                    <option value="">Select a sub-category</option>
                    {currentCategory?.subCategories.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Description *</label>
                <RichTextEditor 
                    content={description} 
                    onChange={setDescription} 
                    placeholder="Full product specifications and details..."
                />
                <input type="hidden" name="description" value={description} />
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Product Images</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                    {previews.map((src, i) => (
                        <div key={i} className="aspect-square relative border border-brand-border bg-white p-1">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute -top-2 -right-2 bg-brand-accent text-white p-1 rounded-none shadow-sm hover:bg-black transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-brand-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent hover:bg-brand-panel transition-all text-brand-muted hover:text-brand-accent">
                        <ImageIcon size={24} className="mb-2" />
                        <span className="text-[10px] uppercase tracking-widest font-oswald">Add Image</span>
                        <input 
                            type="file" 
                            name="images" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            </div>

            <div className="md:col-span-2">
                <button
                    type="submit"
                    className="bg-brand-accent text-brand-white px-8 py-3 font-oswald font-bold tracking-widest uppercase hover:bg-red-700 transition-colors"
                >
                    Add Product
                </button>
            </div>
        </form>
    );
}
