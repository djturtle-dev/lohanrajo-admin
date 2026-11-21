'use client';

import { useState } from 'react';
import { updateFooterContent } from './actions';
import { 
    Save, Plus, Trash2, Link as LinkIcon, Mail, 
    Package, Building2, ChevronUp, ChevronDown, 
    Loader2, CheckCircle2 
} from 'lucide-react';

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
    const [saveSuccess, setSaveSuccess] = useState(false);

    // --- Contact Links Handlers ---
    const addContactLink = (label = 'New Link', href = '/contact') => {
        setContactLinks([...contactLinks, { label, href }]);
    };

    const removeContactLink = (index: number) => {
        setContactLinks(contactLinks.filter((_, i) => i !== index));
    };

    const updateContactLink = (index: number, field: keyof FooterLinkItem, val: string) => {
        const updated = [...contactLinks];
        updated[index] = { ...updated[index], [field]: val };
        setContactLinks(updated);
    };

    const moveContactLink = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= contactLinks.length) return;
        const updated = [...contactLinks];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);
        setContactLinks(updated);
    };

    // --- Product Links Handlers ---
    const addProductLink = (label = 'New Product Link', href = '/products') => {
        setProductLinks([...productLinks, { label, href }]);
    };

    const removeProductLink = (index: number) => {
        setProductLinks(productLinks.filter((_, i) => i !== index));
    };

    const updateProductLink = (index: number, field: keyof FooterLinkItem, val: string) => {
        const updated = [...productLinks];
        updated[index] = { ...updated[index], [field]: val };
        setProductLinks(updated);
    };

    const moveProductLink = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= productLinks.length) return;
        const updated = [...productLinks];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);
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
        setSaveSuccess(false);

        const formData = new FormData();
        formData.append('companyDesc', companyDesc);
        formData.append('contactLinks', JSON.stringify(contactLinks));
        formData.append('productLinks', JSON.stringify(productLinks));

        const res = await updateFooterContent(formData);
        setIsSaving(false);

        if (res.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            alert('Footer content saved successfully!');
        } else {
            alert(res.error || 'Failed to save footer content');
        }
    };

    return (
        <div className="space-y-12">
            {/* COMPANY DESCRIPTION */}
            <section className="bg-brand-panel border border-brand-border p-6 md:p-8 rounded-2xl relative shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-brand-accent" />
                    <h2 className="text-xl text-brand-text fancy-text font-bold">
                        Company Tagline &amp; Description
                    </h2>
                </div>
                <p className="text-xs text-brand-muted font-sans mb-4">
                    Appears directly beneath the brand logo in the footer brand column.
                </p>
                <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-brand-bg text-brand-text border border-brand-border text-sm focus:outline-none focus:border-brand-accent rounded-xl font-sans resize-none transition-colors"
                    value={companyDesc}
                    onChange={(e) => setCompanyDesc(e.target.value)}
                    placeholder="Enter company description..."
                />
            </section>

            {/* CONTACT LINKS */}
            <section className="bg-brand-panel border border-brand-border p-6 md:p-8 rounded-2xl relative shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl text-brand-text flex items-center gap-2 fancy-text font-bold">
                            <Mail className="w-5 h-5 text-brand-accent" />
                            Footer &ldquo;Contact&rdquo; Links
                        </h2>
                        <p className="text-xs text-brand-muted font-sans mt-1">
                            Add, edit, reorder, or remove navigation links shown under the Contact column in the footer.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => addContactLink('Send a Message', '/contact')}
                            className="text-[11px] font-sans px-3 py-1.5 border border-brand-border bg-brand-bg text-brand-text hover:border-brand-accent hover:text-brand-accent rounded-lg transition"
                        >
                            + Form Link
                        </button>
                        <button
                            type="button"
                            onClick={() => addContactLink('Careers', '/contact?type=CAREER')}
                            className="text-[11px] font-sans px-3 py-1.5 border border-brand-border bg-brand-bg text-brand-text hover:border-brand-accent hover:text-brand-accent rounded-lg transition"
                        >
                            + Careers Link
                        </button>
                        <button
                            type="button"
                            onClick={() => addContactLink('Custom Link', '/contact')}
                            className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest transition px-4 py-2 btn-glass-primary text-white rounded-lg shrink-0"
                        >
                            <Plus size={14} /> Add Link
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {contactLinks.map((link, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-brand-bg/40 border border-brand-border rounded-xl">
                            {/* Reorder Buttons */}
                            <div className="flex sm:flex-col items-center justify-center gap-1 shrink-0 text-brand-muted">
                                <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => moveContactLink(index, 'up')}
                                    className="p-1 hover:text-brand-accent hover:bg-brand-border/50 rounded disabled:opacity-20 transition"
                                    title="Move up"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    disabled={index === contactLinks.length - 1}
                                    onClick={() => moveContactLink(index, 'down')}
                                    className="p-1 hover:text-brand-accent hover:bg-brand-border/50 rounded disabled:opacity-20 transition"
                                    title="Move down"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <label className="block text-[10px] font-mono text-brand-muted uppercase mb-1">Link Label</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border text-xs focus:outline-none focus:border-brand-accent rounded-lg font-sans transition-colors"
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
                                        className="w-full px-3 py-2 pl-7 bg-brand-bg text-brand-text border border-brand-border text-xs font-mono focus:outline-none focus:border-brand-accent rounded-lg transition-colors"
                                        value={link.href}
                                        placeholder="/contact or mailto:user@email.com"
                                        onChange={(e) => updateContactLink(index, 'href', e.target.value)}
                                    />
                                    <LinkIcon className="w-3.5 h-3.5 text-brand-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={() => removeContactLink(index)}
                                className="p-2 self-end sm:self-center text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition rounded-lg"
                                title="Remove link"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {contactLinks.length === 0 && (
                        <p className="text-xs text-brand-muted italic py-6 text-center border border-dashed border-brand-border rounded-xl font-sans">
                            No contact links configured. Click &ldquo;Add Link&rdquo; to add one.
                        </p>
                    )}
                </div>
            </section>

            {/* PRODUCT LINKS */}
            <section className="bg-brand-panel border border-brand-border p-6 md:p-8 rounded-2xl relative shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl text-brand-text flex items-center gap-2 fancy-text font-bold">
                            <Package className="w-5 h-5 text-brand-accent" />
                            Footer &ldquo;Products&rdquo; Links
                        </h2>
                        <p className="text-xs text-brand-muted font-sans mt-1">
                            Add, edit, reorder, or remove category and product quick links in the footer.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {categories.length > 0 && (
                            <select
                                className="px-3 py-2 border border-brand-border bg-brand-bg text-xs text-brand-text focus:outline-none focus:border-brand-accent rounded-lg font-sans"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleQuickAddCategory(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Quick Add From Category...</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                        <button
                            type="button"
                            onClick={() => addProductLink('New Product Link', '/products')}
                            className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest transition px-4 py-2 btn-glass-primary text-white rounded-lg shrink-0"
                        >
                            <Plus size={14} /> Add Custom Link
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {productLinks.map((link, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-brand-bg/40 border border-brand-border rounded-xl">
                            {/* Reorder Buttons */}
                            <div className="flex sm:flex-col items-center justify-center gap-1 shrink-0 text-brand-muted">
                                <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => moveProductLink(index, 'up')}
                                    className="p-1 hover:text-brand-accent hover:bg-brand-border/50 rounded disabled:opacity-20 transition"
                                    title="Move up"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    disabled={index === productLinks.length - 1}
                                    onClick={() => moveProductLink(index, 'down')}
                                    className="p-1 hover:text-brand-accent hover:bg-brand-border/50 rounded disabled:opacity-20 transition"
                                    title="Move down"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <label className="block text-[10px] font-mono text-brand-muted uppercase mb-1">Link Label</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border text-xs focus:outline-none focus:border-brand-accent rounded-lg font-sans transition-colors"
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
                                        className="w-full px-3 py-2 pl-7 bg-brand-bg text-brand-text border border-brand-border text-xs font-mono focus:outline-none focus:border-brand-accent rounded-lg transition-colors"
                                        value={link.href}
                                        placeholder="/products?category=..."
                                        onChange={(e) => updateProductLink(index, 'href', e.target.value)}
                                    />
                                    <LinkIcon className="w-3.5 h-3.5 text-brand-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={() => removeProductLink(index)}
                                className="p-2 self-end sm:self-center text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition rounded-lg"
                                title="Remove link"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {productLinks.length === 0 && (
                        <p className="text-xs text-brand-muted italic py-6 text-center border border-dashed border-brand-border rounded-xl font-sans">
                            No product links configured. Click &ldquo;Add Custom Link&rdquo; or use the dropdown above.
                        </p>
                    )}
                </div>
            </section>

            {/* SAVE BUTTON */}
            <div className="flex items-center justify-end gap-3 sticky bottom-8 z-20">
                {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-sans font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg">
                        <CheckCircle2 size={14} /> Saved Successfully
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3.5 btn-glass-primary text-sm font-sans font-bold uppercase tracking-widest transition shadow-xl disabled:opacity-50 rounded-full text-white"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{isSaving ? 'Saving...' : 'Save Footer Content'}</span>
                </button>
            </div>
        </div>
    );
}
