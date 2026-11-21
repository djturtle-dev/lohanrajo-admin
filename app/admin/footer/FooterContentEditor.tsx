'use client';

import { useState } from 'react';
import { updateFooterContent } from './actions';
import { Save, Plus, Trash2, GripVertical, Link as LinkIcon, Mail, Package, Building2 } from 'lucide-react';

interface FooterLinkItem {
    label: string;
    href: string;
}

export default function FooterContentEditor({
    initialData,
    categories = [],
    products = []
}: {
    initialData: any;
    categories?: any[];
    products?: any[];
}) {
    const [companyDesc, setCompanyDesc] = useState<string>(
        initialData?.companyDesc || "Passionate about manufacturing high quality engineering products since 1992. Chennai, India."
    );
    const [contactLinks, setContactLinks] = useState<FooterLinkItem[]>(
        initialData?.contactLinks || [
            { label: 'lohanrajoliat@gmail.com', href: 'mailto:lohanrajoliat@gmail.com' },
            { label: 'Send a Message', href: '/contact' },
            { label: 'Careers', href: '/contact?type=CAREER' },
        ]
    );
    const [productLinks, setProductLinks] = useState<FooterLinkItem[]>(
        initialData?.productLinks || [
            { label: 'BMS Panels', href: '/products' },
            { label: 'IP Enclosures', href: '/products' },
            { label: 'Reflectors', href: '/products' },
            { label: 'Industrial Poles', href: '/products' },
        ]
    );
    const [isSaving, setIsSaving] = useState(false);

    // --- Contact Links Handlers ---
    const addContactLink = () => {
        setContactLinks([...contactLinks, { label: 'New Link', href: '/contact' }]);
    };
    const removeContactLink = (index: number) => {
        setContactLinks(contactLinks.filter((_, i) => i !== index));
    };
    const updateContactLink = (index: number, field: keyof FooterLinkItem, val: string) => {
        const updated = [...contactLinks];
        updated[index] = { ...updated[index], [field]: val };
        setContactLinks(updated);
    };

    // --- Product Links Handlers ---
    const addProductLink = () => {
        setProductLinks([...productLinks, { label: 'New Product Link', href: '/products' }]);
    };
    const removeProductLink = (index: number) => {
        setProductLinks(productLinks.filter((_, i) => i !== index));
    };
    const updateProductLink = (index: number, field: keyof FooterLinkItem, val: string) => {
        const updated = [...productLinks];
        updated[index] = { ...updated[index], [field]: val };
        setProductLinks(updated);
    };

    const handleQuickAddCategory = (catId: string) => {
        const cat = categories.find((c: any) => c.id === catId);
        if (cat) {
            setProductLinks([...productLinks, { label: cat.name, href: `/products?category=${cat.id}` }]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('companyDesc', companyDesc);
        formData.append('contactLinks', JSON.stringify(contactLinks));
        formData.append('productLinks', JSON.stringify(productLinks));

        const res = await updateFooterContent(formData);
        if (res.success) {
            alert('Footer content saved successfully!');
        } else {
            alert(res.error || 'Failed to save footer content');
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-12">
            {/* COMPANY DESCRIPTION */}
            <section className="bg-brand-panel border border-brand-border p-8 rounded-2xl relative">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-brand-accent" />
                    <h2 className="text-xl text-brand-text fancy-text font-bold">
                        Company Tagline &amp; Description
                    </h2>
                </div>
                <p className="text-xs text-brand-muted mb-4">
                    Appears directly beneath the brand logo in the left footer column.
                </p>
                <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-brand-border text-sm focus:outline-none focus:border-brand-accent rounded-2xl font-sans resize-none"
                    value={companyDesc}
                    onChange={(e) => setCompanyDesc(e.target.value)}
                />
            </section>

            {/* CONTACT LINKS */}
            <section className="bg-brand-panel border border-brand-border p-8 rounded-2xl relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl text-brand-text flex items-center gap-2 fancy-text font-bold">
                            <Mail className="w-5 h-5 text-brand-accent" />
                            Footer &ldquo;Contact&rdquo; Links
                        </h2>
                        <p className="text-xs text-brand-muted mt-1">
                            Add, modify, or remove links listed under the Contact column in the footer.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addContactLink}
                        className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest transition px-4 py-2 btn-glass-secondary rounded-full shrink-0"
                    >
                        <Plus size={14} /> Add Contact Link
                    </button>
                </div>

                <div className="space-y-3">
                    {contactLinks.map((link, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-brand-bg/30 border border-brand-border rounded-xl">
                            <div className="text-brand-muted/40 cursor-move hidden sm:block">
                                <GripVertical size={16} />
                            </div>
                            {/* Label */}
                            <div className="flex-1">
                                <label className="block text-[10px] font-mono text-brand-muted uppercase mb-1">Link Label</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-brand-border text-xs focus:outline-none focus:border-brand-accent rounded-full"
                                    value={link.label}
                                    placeholder="e.g. info@example.com or Send a Message"
                                    onChange={(e) => updateContactLink(index, 'label', e.target.value)}
                                />
                            </div>
                            {/* URL */}
                            <div className="flex-1">
                                <label className="block text-[10px] font-mono text-brand-muted uppercase mb-1">Target URL</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 pl-7 border border-brand-border text-xs font-mono focus:outline-none focus:border-brand-accent rounded-full"
                                        value={link.href}
                                        placeholder="/contact or mailto:user@email.com"
                                        onChange={(e) => updateContactLink(index, 'href', e.target.value)}
                                    />
                                    <LinkIcon className="w-3.5 h-3.5 text-brand-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            {/* Delete */}
                            <button
                                type="button"
                                onClick={() => removeContactLink(index)}
                                className="p-2 self-end sm:self-center text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition rounded"
                                title="Remove link"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {contactLinks.length === 0 && (
                        <p className="text-xs text-brand-muted italic py-4 text-center border border-dashed border-brand-border rounded-xl">
                            No contact links configured. Click &ldquo;Add Contact Link&rdquo; to add one.
                        </p>
                    )}
                </div>
            </section>

            {/* PRODUCT LINKS */}
            <section className="bg-brand-panel border border-brand-border p-8 rounded-2xl relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl text-brand-text flex items-center gap-2 fancy-text font-bold">
                            <Package className="w-5 h-5 text-brand-accent" />
                            Footer &ldquo;Products&rdquo; Links
                        </h2>
                        <p className="text-xs text-brand-muted mt-1">
                            Add, modify, or remove category and product quick links in the footer.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {categories.length > 0 && (
                            <select
                                className="px-3 py-2 border border-brand-border bg-brand-panel text-xs text-brand-text focus:outline-none focus:border-brand-accent rounded-full"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleQuickAddCategory(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Quick Add Category...</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                        <button
                            type="button"
                            onClick={addProductLink}
                            className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest transition px-4 py-2 btn-glass-secondary rounded-full shrink-0"
                        >
                            <Plus size={14} /> Custom Link
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {productLinks.map((link, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-brand-bg/30 border border-brand-border rounded-xl">
                            <div className="text-brand-muted/40 cursor-move hidden sm:block">
                                <GripVertical size={16} />
                            </div>
                            {/* Label */}
                            <div className="flex-1">
                                <label className="block text-[10px] font-mono text-brand-muted uppercase mb-1">Link Label</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-brand-border text-xs focus:outline-none focus:border-brand-accent rounded-full"
                                    value={link.label}
                                    placeholder="e.g. BMS Panels"
                                    onChange={(e) => updateProductLink(index, 'label', e.target.value)}
                                />
                            </div>
                            {/* URL */}
                            <div className="flex-1">
                                <label className="block text-[10px] font-mono text-brand-muted uppercase mb-1">Target URL</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 pl-7 border border-brand-border text-xs font-mono focus:outline-none focus:border-brand-accent rounded-full"
                                        value={link.href}
                                        placeholder="/products?category=..."
                                        onChange={(e) => updateProductLink(index, 'href', e.target.value)}
                                    />
                                    <LinkIcon className="w-3.5 h-3.5 text-brand-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            {/* Delete */}
                            <button
                                type="button"
                                onClick={() => removeProductLink(index)}
                                className="p-2 self-end sm:self-center text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition rounded"
                                title="Remove link"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {productLinks.length === 0 && (
                        <p className="text-xs text-brand-muted italic py-4 text-center border border-dashed border-brand-border rounded-xl">
                            No product links configured. Click &ldquo;Custom Link&rdquo; or use the dropdown above.
                        </p>
                    )}
                </div>
            </section>

            {/* SAVE BUTTON */}
            <div className="flex justify-end sticky bottom-8 z-20">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 btn-glass-primary text-lg uppercase tracking-widest transition shadow-lg shadow-brand-accent/20 disabled:opacity-50 rounded-full font-sans"
                >
                    <Save size={20} />
                    {isSaving ? 'Saving...' : 'Save Footer Content'}
                </button>
            </div>
        </div>
    );
}
