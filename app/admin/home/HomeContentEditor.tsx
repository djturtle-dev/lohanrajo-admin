'use client';

import { useState } from 'react';
import { updateHomeContent } from './actions';
import { Save, Plus, Trash2, GripVertical, Info, Image as ImageIcon, Upload, Package } from 'lucide-react';

interface FeaturedProductItem {
    id?: string;
    categoryId?: string;
    name?: string;
    label: string;
    icon: string;
    imageUrl?: string;
    href?: string;
}

export default function HomeContentEditor({ 
    initialData,
    categories = [],
    products = []
}: { 
    initialData: any;
    categories?: any[];
    products?: any[];
}) {
    const [heroLines, setHeroLines] = useState<string[]>(initialData.heroLines || []);
    const [pillars, setPillars] = useState<{ icon: string; title: string; desc: string }[]>(
        (typeof initialData.pillars === 'string' ? JSON.parse(initialData.pillars) : initialData.pillars) || []
    );
    const [featuredProducts, setFeaturedProducts] = useState<FeaturedProductItem[]>(
        (typeof initialData.featuredProducts === 'string' ? JSON.parse(initialData.featuredProducts) : initialData.featuredProducts) || []
    );
    const [imageFiles, setImageFiles] = useState<{ [key: number]: File }>({});
    const [isSaving, setIsSaving] = useState(false);

    // --- Hero Lines logic ---
    const addHeroLine = () => setHeroLines([...heroLines, "New Line"]);
    const removeHeroLine = (index: number) => setHeroLines(heroLines.filter((_, i) => i !== index));
    const updateHeroLine = (index: number, val: string) => {
        const newLines = [...heroLines];
        newLines[index] = val;
        setHeroLines(newLines);
    };

    // --- Pillars logic ---
    const updatePillar = (index: number, field: 'icon' | 'title' | 'desc', val: string) => {
        const newPillars = [...pillars];
        newPillars[index] = { ...newPillars[index], [field]: val };
        setPillars(newPillars);
    };

    // --- Featured Products logic ---
    const addFeaturedProduct = () => {
        setFeaturedProducts([
            ...featuredProducts,
            { label: 'New Product Card', name: 'New Item', icon: 'Box', imageUrl: '' }
        ]);
    };

    const removeFeaturedProduct = (index: number) => {
        setFeaturedProducts(featuredProducts.filter((_, i) => i !== index));
        const updatedFiles = { ...imageFiles };
        delete updatedFiles[index];
        setImageFiles(updatedFiles);
    };

    const updateFeaturedField = (index: number, field: keyof FeaturedProductItem, val: string) => {
        const updated = [...featuredProducts];
        updated[index] = { ...updated[index], [field]: val };
        setFeaturedProducts(updated);
    };

    const handleSelectCategory = (index: number, catId: string) => {
        const selected = categories.find((c: any) => c.id === catId);
        if (selected) {
            const updated = [...featuredProducts];
            updated[index] = {
                ...updated[index],
                categoryId: selected.id,
                name: selected.name,
                label: selected.name
            };
            setFeaturedProducts(updated);
        }
    };

    const handleSelectProduct = (index: number, prodId: string) => {
        const selected = products.find((p: any) => p.id === prodId);
        if (selected) {
            const updated = [...featuredProducts];
            updated[index] = {
                ...updated[index],
                categoryId: selected.categoryId,
                id: selected.id,
                name: selected.name,
                label: selected.name,
                imageUrl: selected.images?.[0] || updated[index].imageUrl || ''
            };
            setFeaturedProducts(updated);
        }
    };

    const handleFileChange = (index: number, file: File | null) => {
        if (!file) return;
        setImageFiles({ ...imageFiles, [index]: file });
        // Create local preview URL
        const previewUrl = URL.createObjectURL(file);
        updateFeaturedField(index, 'imageUrl', previewUrl);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('heroLines', JSON.stringify(heroLines));
        formData.append('pillars', JSON.stringify(pillars));
        formData.append('featuredProducts', JSON.stringify(featuredProducts));

        // Append image files
        Object.entries(imageFiles).forEach(([indexStr, file]) => {
            formData.append(`featuredImage_${indexStr}`, file);
        });

        const res = await updateHomeContent(formData);
        if (res.success) {
            alert('Home Content Saved Successfully!');
        } else {
            alert(res.error || 'Failed to save');
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-12">
            {/* HEROLINES */}
            <section className="bg-brand-panel border border-brand-border p-8 relative">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl text-brand-text flex items-center gap-2 fancy-text">
                            Animated Hero Lines
                        </h2>
                        <p className="text-sm text-brand-muted mt-1 flex items-center gap-1">
                            <Info size={14} /> Wrap text in asterisks to highlight in red, e.g., <code className="bg-brand-bg px-1">*Metal Arts*</code>
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {heroLines.map((line, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="text-brand-muted/50 cursor-move">
                                <GripVertical size={18} />
                            </div>
                            <textarea
                                rows={2}
                                className="flex-1 px-4 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 font-sans resize-none rounded-2xl placeholder-brand-muted/40"
                                value={line}
                                onChange={(e) => updateHeroLine(index, e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeHeroLine(index)}
                                className="p-2 text-brand-muted hover:text-red-600 hover:bg-red-50 transition border border-transparent rounded"
                                title="Remove line"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addHeroLine}
                        className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest transition mt-4 px-3 py-1.5 btn-glass-secondary rounded-full"
                    >
                        <Plus size={16} /> Add Line
                    </button>
                </div>
            </section>

            {/* PILLARS */}
            <section className="bg-brand-panel border border-brand-border p-8 relative">
                <div className="mb-6">
                    <h2 className="text-2xl text-brand-text fancy-text">
                        The 3 Focus Pillars
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">Displayed directly below the hero section.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pillars.map((pillar, index) => (
                        <div key={index} className="p-6 border border-brand-border bg-brand-bg/20 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Lucide Icon Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent rounded-full placeholder-brand-muted/40"
                                    value={pillar.icon}
                                    placeholder="e.g. Factory, ShieldCheck"
                                    onChange={(e) => updatePillar(index, 'icon', e.target.value)}
                                />
                                <p className="text-[10px] text-brand-muted mt-1 truncate">Uses lucide-react icons</p>
                            </div>

                            <div>
                                <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-brand-border text-sm font-sans uppercase tracking-widest focus:outline-none focus:border-brand-accent rounded-full placeholder-brand-muted/40"
                                    value={pillar.title}
                                    onChange={(e) => updatePillar(index, 'title', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-brand-border text-sm font-sans focus:outline-none focus:border-brand-accent min-h-[100px] resize-none rounded-2xl placeholder-brand-muted/40"
                                    value={pillar.desc}
                                    onChange={(e) => updatePillar(index, 'desc', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* OUR PRODUCTS (FEATURED ON HOME PAGE) */}
            <section className="bg-brand-panel border border-brand-border p-8 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl text-brand-text flex items-center gap-2 fancy-text">
                            <Package className="w-6 h-6 text-brand-accent" />
                            &ldquo;Our Products&rdquo; (Featured on Home Page)
                        </h2>
                        <p className="text-sm text-brand-muted mt-1">
                            Select which products or categories are displayed on the home page Bento grid, and customize their titles, icons, and background images.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addFeaturedProduct}
                        className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest transition px-4 py-2 btn-glass-secondary rounded-full shrink-0"
                    >
                        <Plus size={16} /> Add Product Card
                    </button>
                </div>

                <div className="space-y-6">
                    {featuredProducts.map((item, index) => (
                        <div key={index} className="p-6 border border-brand-border bg-brand-bg/30 rounded-2xl relative space-y-5">
                            {/* Card Header & Remove Button */}
                            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                                <span className="font-mono text-xs uppercase tracking-wider text-brand-accent font-semibold">
                                    Card 0{index + 1} {index === 0 && "(Hero Wide Card)"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeFeaturedProduct(index)}
                                    className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition rounded"
                                    title="Remove this featured card"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Quick Autofill from Existing Products */}
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">
                                        Autofill from Product
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-brand-border bg-brand-panel text-sm text-brand-text focus:outline-none focus:border-brand-accent rounded-full"
                                        onChange={(e) => handleSelectProduct(index, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a product...</option>
                                        {products.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quick Autofill from Existing Categories */}
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">
                                        Or from Category
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-brand-border bg-brand-panel text-sm text-brand-text focus:outline-none focus:border-brand-accent rounded-full"
                                        onChange={(e) => handleSelectCategory(index, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a category...</option>
                                        {categories.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Display Label */}
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">
                                        Card Label / Title<span className="text-brand-accent ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent rounded-full"
                                        value={item.label}
                                        placeholder="e.g. BMS Panels"
                                        onChange={(e) => updateFeaturedField(index, 'label', e.target.value)}
                                    />
                                </div>

                                {/* Icon Name */}
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">
                                        Lucide Icon
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent rounded-full"
                                        value={item.icon || 'Box'}
                                        placeholder="Server, Box, Sun, Zap"
                                        onChange={(e) => updateFeaturedField(index, 'icon', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Image Controls: Upload File or Custom URL */}
                            <div className="pt-2 border-t border-brand-border/40 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                <div className="md:col-span-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    {/* Upload Button */}
                                    <label className="btn-glass-secondary px-4 py-2 rounded-full text-xs font-sans uppercase tracking-widest cursor-pointer inline-flex items-center justify-center gap-2 shrink-0">
                                        <Upload size={14} />
                                        <span>Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                                        />
                                    </label>

                                    {/* Direct Image URL input */}
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 pl-8 border border-brand-border text-xs font-mono focus:outline-none focus:border-brand-accent rounded-full"
                                            value={item.imageUrl || ''}
                                            placeholder="Image URL or uploaded path..."
                                            onChange={(e) => updateFeaturedField(index, 'imageUrl', e.target.value)}
                                        />
                                        <ImageIcon className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Image Preview Thumbnail */}
                                <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3">
                                    {item.imageUrl ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-12 rounded-lg border border-brand-border overflow-hidden bg-brand-dark relative shrink-0">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.label}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-[11px] font-mono text-brand-muted truncate max-w-[120px]">
                                                {item.imageUrl.split('/').pop()}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-brand-muted/50 italic">No image chosen</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {featuredProducts.length === 0 && (
                        <div className="py-8 text-center border border-dashed border-brand-border rounded-xl">
                            <p className="text-sm text-brand-muted mb-3">No custom products configured. The site will display default products.</p>
                            <button
                                type="button"
                                onClick={addFeaturedProduct}
                                className="px-4 py-2 btn-glass-secondary rounded-full text-xs font-sans uppercase tracking-widest inline-flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Add First Product
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* SAVE ACTION */}
            <div className="flex justify-end sticky bottom-8 z-20">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 btn-glass-primary text-lg uppercase tracking-widest transition shadow-lg shadow-brand-accent/20 disabled:opacity-50 rounded-full font-sans"
                >
                    <Save size={20} />
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
