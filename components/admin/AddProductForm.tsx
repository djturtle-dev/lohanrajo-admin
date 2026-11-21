'use client';

import { addProduct } from '@/app/admin/product-actions';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Image as ImageIcon, X, Loader2, Check } from 'lucide-react';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

interface Category {
    id: string;
    name: string;
    subCategories: { id: string; name: string }[];
}

/**
 * Compresses an image client-side if it exceeds 1MB to prevent payload errors.
 */
async function compressImageIfNeeded(file: File): Promise<File> {
    if (file.size <= 1024 * 1024 || !file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1920;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob && blob.size < file.size) {
                            const compressed = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressed);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    0.85
                );
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
}

export default function AddProductForm({ categories }: { categories: Category[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const currentCategory = categories.find(c => c.id === selectedCategoryId);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        if (!name.trim()) {
            setErrorMsg('Product name is required.');
            return;
        }
        if (!selectedCategoryId) {
            setErrorMsg('Please select a category.');
            return;
        }
        if (!description.trim() || description === '<p></p>') {
            setErrorMsg('Product description is required.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Compress files client-side if large
            const processedFiles: File[] = [];
            for (const file of selectedFiles) {
                const readyFile = await compressImageIfNeeded(file);
                processedFiles.push(readyFile);
            }

            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('categoryId', selectedCategoryId);
            if (selectedSubCategoryId) {
                formData.append('subCategoryId', selectedSubCategoryId);
            }
            formData.append('description', description);
            processedFiles.forEach((file) => {
                formData.append('images', file);
            });

            const res = await addProduct(formData);

            if (res && !res.success) {
                setErrorMsg(res.error || 'Failed to add product.');
                setIsSubmitting(false);
                return;
            }

            // Success: clear form and reload page so table updates immediately
            formRef.current?.reset();
            setName('');
            setDescription('');
            setSelectedFiles([]);
            setPreviews([]);
            setSelectedCategoryId('');
            setSelectedSubCategoryId('');

            alert('Product added successfully!');
            window.location.reload();
        } catch (error: any) {
            console.error('Error adding product:', error);
            setErrorMsg(error?.message || 'Failed to add product. Please verify your connection.');
            setIsSubmitting(false);
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
            const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            return newPreviews.filter((_, i) => i !== index);
        });
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {errorMsg && (
                <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-sans rounded-lg">
                    {errorMsg}
                </div>
            )}

            <div className="space-y-2">
                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">
                    Product Name *
                </label>
                <input
                    required
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Stainless Steel IP65 Enclosure"
                    className="w-full bg-brand-bg border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors rounded-full placeholder-brand-muted/40 font-sans text-sm"
                />
            </div>

            <div className="space-y-2">
                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">
                    Category *
                </label>
                <select
                    name="categoryId"
                    required
                    value={selectedCategoryId}
                    onChange={(e) => {
                        setSelectedCategoryId(e.target.value);
                        setSelectedSubCategoryId('');
                    }}
                    className="w-full bg-brand-panel border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-sans text-sm rounded-full"
                >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">
                    Sub-Category
                </label>
                <select
                    name="subCategoryId"
                    disabled={!selectedCategoryId || !currentCategory?.subCategories?.length}
                    value={selectedSubCategoryId}
                    onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50 rounded-full placeholder-brand-muted/40 font-sans text-sm"
                >
                    <option value="">
                        {!selectedCategoryId 
                            ? 'Select a category first' 
                            : !currentCategory?.subCategories?.length 
                                ? 'No subcategories in this category' 
                                : 'Select a sub-category'}
                    </option>
                    {currentCategory?.subCategories?.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">
                    Description *
                </label>
                <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Full product specifications and details..."
                />
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">
                    Product Images
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                    {previews.map((src, i) => (
                        <div key={i} className="aspect-square relative border border-brand-border bg-brand-panel p-1 rounded-lg overflow-hidden">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 bg-brand-accent text-white p-1 rounded-full shadow-sm hover:bg-black transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent hover:bg-brand-panel transition-all text-brand-muted hover:text-brand-accent">
                        <ImageIcon size={24} className="mb-2" />
                        <span className="text-[10px] uppercase tracking-widest font-sans">Add Image</span>
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
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-brand-accent text-white px-8 py-3 font-sans font-bold tracking-widest uppercase hover:bg-red-700 transition-colors rounded-full disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Adding Product...</span>
                        </>
                    ) : (
                        <span>Add Product</span>
                    )}
                </button>
            </div>
        </form>
    );
}
