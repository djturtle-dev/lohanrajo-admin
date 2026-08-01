'use client';

import React, { useState, useMemo } from 'react';
import { Star, Edit, MessageSquare, Mail, Globe, Heart, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { toggleTestimonialFeatured } from '@/app/admin/actions';
import TestimonialEditModal from './TestimonialEditModal';

interface Testimonial {
    id: string;
    createdAt: Date;
    authorName: string | null;
    content: string;
    rating: number | null;
    source: string;
    featured: boolean;
}

type SortField = 'authorName' | 'rating' | 'createdAt' | 'source' | 'featured';
type SortDir = 'asc' | 'desc';

export default function TestimonialsTable({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [filterSource, setFilterSource] = useState<string>('all');

    const getSourceIcon = (source: string) => {
        switch (source?.toLowerCase()) {
            case 'google':
                return (
                    <div className="w-5 h-5 flex-shrink-0" title="Google">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                            <path fill="#4285F4" d="M 22.56 12.25 c 0 -0.78 -0.07 -1.53 -0.2 -2.25 H 12 v 4.26 h 5.92 c -0.26 1.37 -1.04 2.53 -2.21 3.31 v 2.77 h 3.57 c 2.08 -1.92 3.28 -4.74 3.28 -8.09 z" />
                            <path fill="#34A853" d="M 12 23 c 2.97 0 5.46 -0.98 7.28 -2.66 l -3.57 -2.77 c -0.98 0.66 -2.23 1.06 -3.71 1.06 -2.86 0 -5.29 -1.93 -6.16 -4.53 H 2.18 v 2.84 C 3.99 20.53 7.7 23 12 23 z" />
                            <path fill="#FBBC05" d="M 5.84 14.1 c -0.22 -0.66 -0.35 -1.36 -0.35 -2.1 s 0.13 -1.44 0.35 -2.1 V 7.06 H 2.18 C 1.43 8.55 1 10.22 1 12 s 0.43 3.45 1.18 4.94 l 3.66 -2.84 z" />
                            <path fill="#EA4335" d="M 12 5.38 c 1.62 0 3.06 0.56 4.21 1.64 l 3.15 -3.15 C 17.45 2.09 14.97 1 12 1 c -4.3 0 -8.01 2.47 -9.82 6.06 l 3.66 2.84 c 0.87 -2.6 3.3 -4.52 6.16 -4.52 z" />
                        </svg>
                    </div>
                );
            case 'justdial':
                return (
                    <div className="w-8 h-5 flex-shrink-0 flex items-center justify-center bg-[#005c99] rounded-sm p-0.5" title="Justdial">
                        <span className="text-[10px] font-bold text-brand-text tracking-tighter italic">jd</span>
                    </div>
                );
            case 'whatsapp':
                return (
                    <div className="w-5 h-5 bg-[#25D366] rounded-sm flex items-center justify-center p-[2px]" title="WhatsApp">
                        <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </div>
                );
            case 'e-mail':
            case 'email':
                return <span title="Email"><Mail size={18} className="text-blue-500 flex-shrink-0" /></span>;
            case 'direct':
                return <span title="Direct"><Globe size={18} className="text-brand-accent flex-shrink-0" /></span>;
            default:
                return <span title={source || "Unknown"}><Globe size={18} className="text-brand-muted flex-shrink-0" /></span>;
        }
    };

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

    const processedTestimonials = useMemo(() => {
        let result = [...initialTestimonials];
        if (filterSource !== 'all') {
            result = result.filter(t => t.source?.toLowerCase() === filterSource);
        }
        result.sort((a, b) => {
            let valA: any = a[sortField];
            let valB: any = b[sortField];
            
            if (sortField === 'authorName') {
                valA = valA || 'anonymous';
                valB = valB || 'anonymous';
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [initialTestimonials, sortField, sortDir, filterSource]);

    // unique sources for filter
    const sources = Array.from(new Set(initialTestimonials.map(t => t.source?.toLowerCase() || 'unknown')));

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-2 relative">
                <div className="flex items-center gap-2 bg-brand-panel border border-brand-border px-3 py-1.5 focus-within:border-brand-accent">
                    <Filter size={14} className="text-brand-muted" />
                    <select 
                        value={filterSource} 
                        onChange={e => setFilterSource(e.target.value)}
                        className="bg-transparent text-sm font-sans tracking-wide uppercase focus:outline-none text-brand-text outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Sources</option>
                        {sources.map(s => (
                            <option key={s} value={s}>{s === 'e-mail' ? 'E-MAIL' : s.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-brand-panel border border-brand-border overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-brand-border bg-brand-bg/50">
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('authorName')}
                            >
                                <div className="flex items-center gap-1">Author <SortIcon field="authorName" /></div>
                            </th>
                            <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted">Content</th>
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('rating')}
                            >
                                <div className="flex items-center gap-1">Rating <SortIcon field="rating" /></div>
                            </th>
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('source')}
                            >
                                <div className="flex items-center gap-1">Source <SortIcon field="source" /></div>
                            </th>
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('createdAt')}
                            >
                                <div className="flex items-center gap-1">Date <SortIcon field="createdAt" /></div>
                            </th>
                            <th 
                                className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted text-center cursor-pointer group hover:text-brand-accent select-none"
                                onClick={() => handleSort('featured')}
                            >
                                <div className="flex items-center justify-center gap-1">Featured <SortIcon field="featured" /></div>
                            </th>
                            <th className="p-4 font-sans text-xs tracking-widest uppercase text-brand-muted text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {processedTestimonials.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-brand-muted text-sm font-sans">No testimonials found matching your criteria.</td>
                            </tr>
                        ) : processedTestimonials.map((t) => (
                            <tr key={t.id} className="hover:bg-brand-bg/20 transition-colors group">
                                <td className="p-4 font-sans text-sm text-brand-text font-medium">{t.authorName || 'Anonymous'}</td>
                                <td className="p-4 font-sans text-sm text-brand-muted max-w-xs">
                                    <span className="line-clamp-2" title={t.content}>
                                        {t.content}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={12} 
                                                className={`${i < (t.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-brand-border'}`} 
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center w-8">
                                        {getSourceIcon(t.source)}
                                    </div>
                                </td>
                                <td className="p-4 font-sans text-sm text-brand-muted whitespace-nowrap">
                                    {new Date(t.createdAt).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </td>
                                <td className="p-4 text-center">
                                    <form action={toggleTestimonialFeatured}>
                                        <input type="hidden" name="id" value={t.id} />
                                        <input type="hidden" name="currentStatus" value={String(t.featured)} />
 <button type="submit" className="group/heart relative btn-glass-secondary rounded-full font-sans px-4 py-2 text-xs uppercase tracking-widest">
                                            <Heart 
                                                size={20} 
                                                className={`${t.featured ? 'fill-red-500 text-red-500' : 'text-brand-border group-hover/heart:text-red-300'} transition-all`}
                                            />
                                        </button>
                                    </form>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => setSelectedTestimonial(t)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-bg border border-brand-border text-brand-text hover:bg-brand-border transition-all font-sans text-[10px] uppercase tracking-widest"
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

            {selectedTestimonial && (
                <TestimonialEditModal 
                    testimonial={selectedTestimonial} 
                    onClose={() => setSelectedTestimonial(null)} 
                />
            )}
        </div>
    );
}

