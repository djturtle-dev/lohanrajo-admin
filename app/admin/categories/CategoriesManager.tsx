'use client';

import { useState } from 'react';
import { createCategory, updateCategory, deleteCategory, createSubCategory, updateSubCategory, deleteSubCategory } from './actions';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Save, X, FolderTree, Folder, Loader2 } from 'lucide-react';

export default function CategoriesManager({ initialCategories }: { initialCategories: any[] }) {
    const [categories, setCategories] = useState(initialCategories);
    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

    // Editing states
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [editingSubId, setEditingSubId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Creation states
    const [isCreatingCat, setIsCreatingCat] = useState(false);
    const [creatingSubForCatId, setCreatingSubForCatId] = useState<string | null>(null);
    const [newValue, setNewValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const toggleExpand = (id: string) => {
        setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // --- Category Actions ---
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim() || isSaving) return;

        setIsSaving(true);
        const formData = new FormData();
        formData.append('name', newValue.trim());
        const res = await createCategory(formData);
        setIsSaving(false);

        if (res.success) {
            setIsCreatingCat(false);
            setNewValue('');
            window.location.reload();
        } else {
            alert(res.error || 'Failed to create category');
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent, id: string) => {
        e.preventDefault();
        if (!editValue.trim() || isSaving) return;

        setIsSaving(true);
        const formData = new FormData();
        formData.append('id', id);
        formData.append('name', editValue.trim());
        const res = await updateCategory(formData);
        setIsSaving(false);

        if (res.success) {
            setEditingCatId(null);
            window.location.reload();
        } else {
            alert(res.error || 'Failed to update category');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? Ensure no products are using it.')) return;
        const formData = new FormData();
        formData.append('id', id);
        const res = await deleteCategory(formData);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error || 'Failed to delete category');
        }
    };

    // --- Subcategory Actions ---
    const handleCreateSubCategory = async (e: React.FormEvent, categoryId: string) => {
        e.preventDefault();
        if (!newValue.trim() || isSaving) return;

        setIsSaving(true);
        const formData = new FormData();
        formData.append('name', newValue.trim());
        formData.append('categoryId', categoryId);
        const res = await createSubCategory(formData);
        setIsSaving(false);

        if (res.success) {
            setCreatingSubForCatId(null);
            setNewValue('');
            window.location.reload();
        } else {
            alert(res.error || 'Failed to create subcategory');
        }
    };

    const handleUpdateSubCategory = async (e: React.FormEvent, subId: string, categoryId: string) => {
        e.preventDefault();
        if (!editValue.trim() || isSaving) return;

        setIsSaving(true);
        const formData = new FormData();
        formData.append('id', subId);
        formData.append('name', editValue.trim());
        formData.append('categoryId', categoryId);
        const res = await updateSubCategory(formData);
        setIsSaving(false);

        if (res.success) {
            setEditingSubId(null);
            window.location.reload();
        } else {
            alert(res.error || 'Failed to update subcategory');
        }
    };

    const handleDeleteSubCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subcategory?')) return;
        const formData = new FormData();
        formData.append('id', id);
        const res = await deleteSubCategory(formData);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error || 'Failed to delete subcategory');
        }
    };

    return (
        <div className="space-y-6 block">
            {/* Create Category Button */}
            {!isCreatingCat ? (
                <button
                    onClick={() => setIsCreatingCat(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white font-sans text-sm uppercase tracking-widest hover:bg-red-700 transition-colors rounded-lg shadow-sm"
                >
                    <Plus size={16} /> New Category
                </button>
            ) : (
                <form onSubmit={handleCreateCategory} className="flex items-center gap-2 p-4 border border-brand-border bg-brand-bg/30 rounded-lg">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Category Name"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-brand-border bg-brand-panel text-sm text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 rounded-lg"
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 btn-glass-primary text-white transition rounded-lg font-sans text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button 
                        type="button" 
                        onClick={() => { setIsCreatingCat(false); setNewValue(''); }} 
                        className="px-4 py-2 bg-brand-panel border border-brand-border text-brand-muted hover:bg-brand-border transition text-xs font-sans uppercase tracking-wider rounded-lg"
                    >
                        <X size={16} />
                    </button>
                </form>
            )}

            {/* List */}
            <div className="bg-brand-panel border border-brand-border divide-y divide-brand-border rounded-xl overflow-hidden shadow-sm">
                {categories.length === 0 && (
                    <div className="p-12 text-center text-brand-muted font-sans text-sm">
                        No categories found. Create one above to get started.
                    </div>
                )}
                
                {categories.map((cat) => (
                    <div key={cat.id} className="flex flex-col">
                        {/* Category Row */}
                        <div className="flex items-center justify-between p-4 bg-brand-bg/10 hover:bg-brand-bg/30 transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                                <button onClick={() => toggleExpand(cat.id)} className="text-brand-muted hover:text-brand-accent p-1">
                                    {expandedCats[cat.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                                <FolderTree size={18} className="text-brand-accent shrink-0" />
                                
                                {editingCatId === cat.id ? (
                                    <form onSubmit={(e) => handleUpdateCategory(e, cat.id)} className="flex items-center gap-2 flex-1 max-w-md">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-1 px-3 py-1.5 border border-brand-border bg-brand-panel text-sm text-brand-text focus:outline-none focus:border-brand-accent rounded-lg"
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="p-2 btn-glass-primary text-white rounded-lg font-sans disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setEditingCatId(null)} 
                                            className="text-brand-muted p-2 hover:bg-brand-border rounded-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                    </form>
                                ) : (
                                    <span className="font-sans text-base font-semibold tracking-wide uppercase text-brand-text truncate">
                                        {cat.name}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-brand-muted font-sans mr-2 hidden sm:inline">
                                    {cat.subCategories?.length || 0} sub, {cat._count?.products || 0} prod
                                </span>
                                <button 
                                    onClick={() => { setCreatingSubForCatId(cat.id); setNewValue(''); setExpandedCats(prev => ({ ...prev, [cat.id]: true })); }} 
                                    className="p-1.5 text-brand-muted hover:text-brand-accent hover:bg-brand-bg transition rounded-lg" 
                                    title="Add Subcategory"
                                >
                                    <Plus size={16} />
                                </button>
                                <button 
                                    onClick={() => { setEditingCatId(cat.id); setEditValue(cat.name); }} 
                                    className="p-1.5 text-brand-muted hover:text-blue-500 hover:bg-blue-500/10 transition rounded-lg" 
                                    title="Edit Category"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteCategory(cat.id)} 
                                    className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition rounded-lg" 
                                    title="Delete Category"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Subcategories (if expanded) */}
                        {expandedCats[cat.id] && (
                            <div className="bg-brand-panel border-t border-brand-border/50 divide-y divide-brand-border/30 pl-10 pr-4 py-2 space-y-1">
                                {(!cat.subCategories || cat.subCategories.length === 0) && !creatingSubForCatId ? (
                                    <div className="text-xs text-brand-muted italic py-2 px-4 font-sans">No subcategories yet.</div>
                                ) : (
                                    cat.subCategories.map((sub: any) => (
                                        <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-brand-bg/20 transition-colors">
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-4">
                                                <Folder size={15} className="text-brand-muted shrink-0" />
                                                
                                                {editingSubId === sub.id ? (
                                                    <form onSubmit={(e) => handleUpdateSubCategory(e, sub.id, cat.id)} className="flex items-center gap-2 flex-1 max-w-sm">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="flex-1 px-2.5 py-1 border border-brand-border bg-brand-panel text-sm text-brand-text focus:outline-none focus:border-brand-accent rounded-lg"
                                                        />
                                                        <button 
                                                            type="submit" 
                                                            disabled={isSaving}
                                                            className="p-1.5 btn-glass-primary text-white rounded-lg font-sans disabled:opacity-50"
                                                        >
                                                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setEditingSubId(null)} 
                                                            className="text-brand-muted p-1.5 hover:bg-brand-border rounded-lg"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <span className="font-sans text-xs tracking-wider uppercase text-brand-text truncate">
                                                        {sub.name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button 
                                                    onClick={() => { setEditingSubId(sub.id); setEditValue(sub.name); }} 
                                                    className="p-1.5 text-brand-muted hover:text-blue-500 hover:bg-blue-500/10 transition rounded-lg"
                                                    title="Edit Subcategory"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteSubCategory(sub.id)} 
                                                    className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition rounded-lg"
                                                    title="Delete Subcategory"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Create Subcategory Form */}
                                {creatingSubForCatId === cat.id && (
                                    <form onSubmit={(e) => handleCreateSubCategory(e, cat.id)} className="flex items-center gap-2 p-3 mt-2 border border-brand-accent/20 bg-brand-bg/30 rounded-lg">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Subcategory Name"
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            className="flex-1 px-3 py-1.5 border border-brand-border bg-brand-panel text-sm text-brand-text focus:outline-none focus:border-brand-accent rounded-lg"
                                            required
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="flex items-center gap-1 px-3 py-1.5 btn-glass-primary text-white transition text-xs uppercase tracking-wider rounded-lg font-sans disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                            <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { setCreatingSubForCatId(null); setNewValue(''); }} 
                                            className="px-3 py-1.5 bg-brand-panel border border-brand-border text-brand-muted hover:bg-brand-border transition text-xs font-sans uppercase tracking-wider rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
