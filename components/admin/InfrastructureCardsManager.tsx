'use client';

import { useState } from 'react';
import { createInfrastructureCard, updateInfrastructureCard, deleteInfrastructureCard } from '@/app/admin/about/actions';
import { Plus, Edit2, Trash2, Save, X, Factory, ShieldCheck, Lightbulb, UserCheck, CalendarDays, LucideIcon } from 'lucide-react';

const availableIcons: Record<string, LucideIcon> = {
    Factory,
    ShieldCheck,
    Lightbulb,
    UserCheck,
    CalendarDays
};

export default function InfrastructureCardsManager({ initialCards }: { initialCards: any[] }) {
    const [cards, setCards] = useState(initialCards || []);

    // Editing states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', icon: 'Factory' });

    // Creation states
    const [isCreating, setIsCreating] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', description: '', icon: 'Factory' });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', createForm.title);
        formData.append('description', createForm.description);
        formData.append('icon', createForm.icon);
        const res = await createInfrastructureCard(formData);
        if (res.success) {
            setIsCreating(false);
            setCreateForm({ title: '', description: '', icon: 'Factory' });
            window.location.reload();
        } else {
            alert(res.error || 'Failed to create card');
        }
    };

    const handleUpdate = async (e: React.FormEvent, id: string) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('description', editForm.description);
        formData.append('icon', editForm.icon);
        const res = await updateInfrastructureCard(id, formData);
        if (res.success) {
            setEditingId(null);
            window.location.reload();
        } else {
            alert(res.error || 'Failed to update card');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this card?')) return;
        const res = await deleteInfrastructureCard(id);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error || 'Failed to delete card');
        }
    };

    return (
        <div className="space-y-6 block">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl text-brand-text flex items-center gap-2 fancy-text">
                        Infrastructure
                    </h2>
                    <p className="text-sm text-brand-muted font-sans mt-1">Manage infrastructure cards displayed on the About page.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white font-sans text-sm uppercase tracking-widest hover:bg-red-700 transition-colors rounded-full"
                    >
                        <Plus size={16} /> Add Card
                    </button>
                )}
            </div>

            {/* Create Form */}
            {isCreating && (
                <form onSubmit={handleCreate} className="p-6 border border-brand-accent/50 bg-brand-bg/50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Title</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Mission"
                                value={createForm.title}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-brand-border bg-brand-panel text-sm focus:outline-none focus:border-brand-accent rounded-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Icon</label>
                            <select
                                value={createForm.icon}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, icon: e.target.value }))}
                                className="w-full px-3 py-2 border border-brand-border bg-brand-panel text-sm focus:outline-none focus:border-brand-accent rounded-full"
                            >
                                {Object.keys(availableIcons).map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Description</label>
                            <textarea
                                placeholder="Description..."
                                value={createForm.description}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-brand-border bg-brand-panel text-sm focus:outline-none focus:border-brand-accent min-h-[80px] rounded-2xl resize-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-brand-panel border border-brand-border text-brand-muted hover:bg-gray-50 hover:text-black transition text-sm font-sans uppercase tracking-widest rounded-full">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 btn-glass-primary transition text-sm uppercase tracking-widest rounded-full font-sans">
                            Save Card
                        </button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className="bg-brand-panel border border-brand-border divide-y divide-brand-border">
                {cards.length === 0 && !isCreating && (
                    <div className="p-12 text-center text-brand-muted font-sans">
                        No cards found. Create one to get started.
                    </div>
                )}
                
                {cards.map((card) => {
                    const IconComponent = availableIcons[card.icon] || Factory;
                    
                    return (
                        <div key={card.id} className="p-6 hover:bg-brand-bg/10 transition-colors">
                            {editingId === card.id ? (
                                <form onSubmit={(e) => handleUpdate(e, card.id)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-3 py-2 border border-brand-border bg-brand-panel text-sm focus:outline-none focus:border-brand-accent rounded-full"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <select
                                                value={editForm.icon}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, icon: e.target.value }))}
                                                className="w-full px-3 py-2 border border-brand-border bg-brand-panel text-sm focus:outline-none focus:border-brand-accent rounded-full"
                                            >
                                                {Object.keys(availableIcons).map(iconName => (
                                                    <option key={iconName} value={iconName}>{iconName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-3 py-2 border border-brand-border bg-brand-panel text-sm focus:outline-none focus:border-brand-accent min-h-[80px] rounded-2xl resize-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 bg-brand-panel border border-brand-border text-brand-muted hover:bg-gray-50 hover:text-black transition text-xs font-sans uppercase tracking-widest rounded-full">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-3 py-1 btn-glass-primary text-white">
                                            Save
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-6">
                                        <div className="p-4 bg-brand-bg/50 border border-brand-border rounded-2xl text-brand-accent shrink-0">
                                            <IconComponent size={28} />
                                        </div>
                                        <div>
                                            <h4 className="font-sans text-lg tracking-wide uppercase text-brand-text mb-2">
                                                {card.title}
                                            </h4>
                                            <p className="text-sm text-brand-muted font-sans whitespace-pre-wrap leading-relaxed">
                                                {card.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                        <button onClick={() => { setEditingId(card.id); setEditForm({ title: card.title, description: card.description, icon: card.icon }); }} className="p-2 text-brand-muted hover:text-blue-600 hover:bg-blue-50 transition rounded-full" title="Edit"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(card.id)} className="p-2 text-brand-muted hover:text-red-600 hover:bg-red-50 transition rounded-full" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
