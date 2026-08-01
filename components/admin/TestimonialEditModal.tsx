'use client';

import React, { useState } from 'react';
import { X, Heart, Trash2 } from 'lucide-react';
import { updateTestimonial, deleteTestimonial } from '@/app/admin/actions';

interface Testimonial {
    id: string;
    authorName: string | null;
    content: string;
    rating: number | null;
    source: string;
    featured: boolean;
}

interface Props {
    testimonial: Testimonial;
    onClose: () => void;
}

export default function TestimonialEditModal({ testimonial, onClose }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await updateTestimonial(formData);
        onClose();
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        setIsDeleting(true);
        const formData = new FormData();
        formData.append('id', testimonial.id);
        await deleteTestimonial(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-panel max-w-2xl w-full shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-brand-border flex justify-between items-center">
                    <h2 className="text-xl text-brand-text fancy-text">Edit Testimonial</h2>
 <button onClick={onClose} className="hover: transition-colors btn-glass-secondary rounded-full font-sans px-4 py-2 text-xs uppercase tracking-widest">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-6 flex-1">
                    <input type="hidden" name="id" value={testimonial.id} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Author Name</label>
                            <input 
                                name="authorName" 
                                defaultValue={testimonial.authorName || ''} 
                                className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-full placeholder-brand-muted/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Rating</label>
                            <select 
                                name="rating" 
                                defaultValue={testimonial.rating || 5}
                                className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-full placeholder-brand-muted/40"
                            >
                                {[5, 4, 3, 2, 1].map(r => (
                                    <option key={r} value={r}>{r} Stars</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Content</label>
                        <textarea 
                            name="content" 
                            defaultValue={testimonial.content} 
                            rows={4}
                            className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm resize-none rounded-2xl placeholder-brand-muted/40"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Source</label>
                            <select 
                                name="source" 
                                defaultValue={testimonial.source}
                                className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-full placeholder-brand-muted/40"
                            >
                                <option value="Google">Google</option>
                                <option value="Justdial">Justdial</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="E-mail">E-mail</option>
                                <option value="Direct">Direct</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-8 py-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    name="featured" 
                                    defaultChecked={testimonial.featured}
                                    className="peer sr-only placeholder-brand-muted/40"
                                />
                                <div className="w-5 h-5 border border-brand-border peer-checked:bg-red-500 peer-checked:border-red-500 transition-all" />
                                <div className="absolute inset-0 flex items-center justify-center text-brand-border peer-checked:text-brand-text transition-colors">
                                    <Heart size={12} fill="currentColor" />
                                </div>
                            </div>
                            <span className="font-sans text-xs tracking-widest uppercase text-brand-muted group-hover:text-brand-text transition-colors">Featured</span>
                        </label>
                    </div>

                    <div className="pt-6 border-t border-brand-border flex justify-between items-center bg-brand-panel sticky bottom-0">
                        <button 
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
 className="flex items-center gap-2 px-4 py-2 transition-colors disabled:opacity-50 btn-glass-secondary rounded-full font-sans "
                        >
                            <Trash2 size={18} />
                            <span className="font-sans text-xs tracking-widest uppercase">Delete</span>
                        </button>

                        <div className="flex gap-4">
                            <button 
                                type="button" 
                                onClick={onClose}
 className="px-8 py-3 btn-glass-secondary text-xs tracking-widest uppercase border border-brand-border transition-all rounded-full font-sans"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-8 py-3 btn-glass-primary text-xs tracking-widest uppercase transition-all rounded-full font-sans"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
