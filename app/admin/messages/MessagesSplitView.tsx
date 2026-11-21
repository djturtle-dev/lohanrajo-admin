'use client';

import { useState, useMemo, useTransition } from 'react';
import { ContactSubmission } from '@prisma/client';
import { 
    Search, Trash2, Mail, MailOpen, Download, 
    Briefcase, HelpCircle, Phone, Info, FileText, 
    Filter, ArrowLeft, Edit3, Plus, Table as TableIcon, 
    Columns2, ExternalLink, Calendar, CheckCircle2,
    Eye, Tag, Package
} from 'lucide-react';
import { toggleMessageRead, deleteMessage } from './actions';
import { cn } from '@/lib/utils';
import { 
    getCombinedName, 
    getInitials, 
    formatPhoneNumber, 
    exportContactsToCSV 
} from '@/lib/contact';
import ContactEditModal from '@/components/admin/ContactEditModal';

interface TaggedProductMeta {
    id: string;
    name: string;
    image?: string;
    category?: string;
    subCategory?: string;
}

function parseTaggedProducts(content: string): { cleanContent: string; taggedProducts: TaggedProductMeta[] } {
    if (!content) return { cleanContent: '', taggedProducts: [] };

    let taggedProducts: TaggedProductMeta[] = [];

    // 1. Try parsing JSON metadata comment
    const jsonMatch = content.match(/<!--\s*TAGGED_PRODUCTS_JSON:\s*([\s\S]*?)\s*-->/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            taggedProducts = JSON.parse(jsonMatch[1]);
        } catch (e) {
            console.error('Failed to parse tagged products JSON:', e);
        }
    }

    // 2. Fallback: Parse from "Referenced Products:" lines if JSON wasn't present
    if (taggedProducts.length === 0) {
        const refMatch = content.match(/---\s*Referenced Products:\s*([\s\S]*)$/i);
        if (refMatch && refMatch[1]) {
            const lines = refMatch[1].split('\n').filter(l => l.trim().startsWith('•') || l.trim().startsWith('-'));
            taggedProducts = lines.map((line, idx) => {
                const cleaned = line.replace(/^[•\-]\s*/, '').trim();
                const catMatch = cleaned.match(/\[(.*?)\]/);
                const name = catMatch ? cleaned.replace(/\[.*?\]/, '').trim() : cleaned;
                return {
                    id: `ref-${idx}`,
                    name,
                    category: catMatch ? catMatch[1] : undefined
                };
            });
        }
    }

    // Clean up content for display in message body
    let cleanContent = content
        .replace(/<!--\s*TAGGED_PRODUCTS_JSON:\s*[\s\S]*?\s*-->/g, '')
        .replace(/---\s*Referenced Products:[\s\S]*$/i, '')
        .trim();

    if (!cleanContent) {
        cleanContent = "(No additional message provided)";
    }

    return { cleanContent, taggedProducts };
}

interface MessagesSplitViewProps {
    initialMessages: ContactSubmission[];
}

type FilterTab = 'All' | 'Read' | 'Unread';
type ViewMode = 'split' | 'table';

export default function MessagesSplitView({ initialMessages }: MessagesSplitViewProps) {
    const [messages, setMessages] = useState<ContactSubmission[]>(initialMessages);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('All');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<ContactSubmission | null>(null);
    const [isPending, startTransition] = useTransition();

    const selectedMessage = useMemo(() => 
        messages.find(m => m.id === selectedId), 
    [messages, selectedId]);

    const filteredMessages = useMemo(() => {
        let filtered = messages;
        if (filterTab === 'Read') filtered = filtered.filter(m => m.isRead);
        if (filterTab === 'Unread') filtered = filtered.filter(m => !m.isRead);
        
        if (typeFilter) {
            filtered = filtered.filter(m => m.type === typeFilter);
        }
        
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(m => {
                const combinedName = getCombinedName(m.firstName, m.lastName).toLowerCase();
                const formattedPhone = formatPhoneNumber(m.phone).toLowerCase();
                const rawPhone = (m.phone || '').toLowerCase();
                return (
                    combinedName.includes(q) ||
                    (m.firstName || '').toLowerCase().includes(q) ||
                    (m.lastName || '').toLowerCase().includes(q) ||
                    (m.email || '').toLowerCase().includes(q) ||
                    rawPhone.includes(q) ||
                    formattedPhone.includes(q) ||
                    (m.type || '').toLowerCase().includes(q) ||
                    (m.content || '').toLowerCase().includes(q)
                );
            });
        }
        return filtered;
    }, [messages, filterTab, searchQuery, typeFilter]);

    const handleToggleRead = (id: string, currentReadStatus: boolean) => {
        // Optimistic update
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: !currentReadStatus } : m));
        startTransition(() => {
            toggleMessageRead(id, !currentReadStatus);
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        // Optimistic update
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedId === id) setSelectedId(null);

        startTransition(() => {
            deleteMessage(id);
        });
    };

    const handleSavedContact = (saved: ContactSubmission) => {
        setMessages(prev => {
            const exists = prev.some(m => m.id === saved.id);
            if (exists) {
                return prev.map(m => m.id === saved.id ? saved : m);
            }
            return [saved, ...prev];
        });
        setSelectedId(saved.id);
    };

    const handleExportCSV = () => {
        const toExport = filteredMessages.length > 0 ? filteredMessages : messages;
        const dateStr = new Date().toISOString().slice(0, 10);
        exportContactsToCSV(toExport, `lohanrajo_contacts_${dateStr}.csv`);
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'CAREER': return <Briefcase size={16} />;
            case 'SUPPORT': return <HelpCircle size={16} />;
            case 'ENQUIRY': return <Info size={16} />;
            default: return <Mail size={16} />;
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-brand-panel border-y sm:border-t-0 border-brand-border">
            
            {/* TOP GLOBAL CONTROLS BAR */}
            <div className="px-4 py-3 border-b border-brand-border bg-[var(--theme-bg)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl fancy-text text-brand-text flex items-center gap-2">
                        <span>Messages</span>
                        <span className="text-xs font-sans font-normal px-2 py-0.5 rounded-full bg-brand-border text-brand-muted">
                            {filteredMessages.length}
                        </span>
                    </h2>

                    {/* View Switcher: Split vs Table */}
                    <div className="flex items-center bg-brand-panel border border-brand-border rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={() => setViewMode('split')}
                            title="Inbox Split View"
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans rounded-md transition-colors",
                                viewMode === 'split' 
                                    ? "bg-brand-accent text-white shadow-sm font-semibold" 
                                    : "text-brand-muted hover:text-brand-text"
                            )}
                        >
                            <Columns2 size={14} />
                            <span className="hidden sm:inline">Split</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            title="Table View"
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans rounded-md transition-colors",
                                viewMode === 'table' 
                                    ? "bg-brand-accent text-white shadow-sm font-semibold" 
                                    : "text-brand-muted hover:text-brand-text"
                            )}
                        >
                            <TableIcon size={14} />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                    </div>
                </div>

                {/* Global Actions: Export CSV & New Contact */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        title="Export contacts to CSV"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-lg border border-brand-border bg-brand-panel text-brand-text hover:border-brand-accent hover:text-brand-accent transition-colors"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setContactToEdit(null);
                            setEditModalOpen(true);
                        }}
                        title="Add New Contact"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-lg btn-glass-primary text-white transition-colors"
                    >
                        <Plus size={14} />
                        <span className="hidden sm:inline">New Contact</span>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {viewMode === 'table' ? (
                /* ======================== TABLE VIEW ======================== */
                <div className="flex-1 flex flex-col overflow-hidden bg-brand-panel">
                    {/* Filter & Search Bar */}
                    <div className="p-4 border-b border-brand-border bg-[var(--theme-bg)] flex flex-wrap items-center justify-between gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[240px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by name, phone (+91 XXXXXXXXXX), email, content..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-border rounded-lg py-2 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent/50 transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Read / Unread Tabs */}
                            <div className="flex p-1 bg-brand-bg border border-brand-border rounded-lg">
                                {(['All', 'Read', 'Unread'] as FilterTab[]).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilterTab(tab)}
                                        className={cn(
                                            "px-3 py-1 text-xs font-sans tracking-wide rounded-md transition-all",
                                            filterTab === tab 
                                                ? "bg-[var(--theme-panel)] text-brand-text shadow-sm border border-brand-border font-semibold" 
                                                : "text-brand-muted hover:text-brand-text"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Category Filter Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans rounded-lg border transition-colors", 
                                        typeFilter || isFilterOpen 
                                            ? "text-brand-accent bg-brand-accent/10 border-brand-accent/30" 
                                            : "border-brand-border text-brand-muted hover:text-brand-text bg-brand-bg"
                                    )}
                                >
                                    <Filter size={14} />
                                    <span>{typeFilter || 'All Categories'}</span>
                                </button>

                                {isFilterOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                        <div className="absolute top-10 right-0 w-48 bg-brand-bg border border-brand-border rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                                            <div className="px-3 py-1.5 text-[10px] font-sans tracking-widest uppercase text-brand-muted mb-1">Filter by Category</div>
                                            {[null, 'ENQUIRY', 'CONTACT', 'CAREER', 'SUPPORT'].map(cat => (
                                                <button
                                                    key={cat || 'ALL'}
                                                    onClick={() => {
                                                        setTypeFilter(cat);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-4 py-2 text-sm font-sans transition-colors",
                                                        typeFilter === cat ? "bg-brand-accent/10 text-brand-accent font-semibold" : "text-brand-text hover:bg-brand-border"
                                                    )}
                                                >
                                                    {cat || 'All Categories'}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        {filteredMessages.length === 0 ? (
                            <div className="p-16 text-center text-brand-muted text-sm font-sans">
                                No contact submissions found matching the criteria.
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-left text-sm font-sans">
                                <thead>
                                    <tr className="border-b border-brand-border bg-[var(--theme-bg)] text-[11px] font-sans uppercase tracking-widest text-brand-muted sticky top-0 z-10 backdrop-blur-sm">
                                        <th className="py-3 px-4 w-12 text-center">Status</th>
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Phone Number</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4 min-w-[200px]">Message</th>
                                        <th className="py-3 px-4 whitespace-nowrap">Date</th>
                                        <th className="py-3 px-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/40">
                                    {filteredMessages.map(msg => {
                                        const combinedName = getCombinedName(msg.firstName, msg.lastName);
                                        const formattedPhone = formatPhoneNumber(msg.phone);
                                        return (
                                            <tr 
                                                key={msg.id}
                                                className={cn(
                                                    "transition-colors group",
                                                    !msg.isRead ? "bg-brand-accent/5 hover:bg-brand-accent/10" : "hover:bg-[var(--theme-bg)]"
                                                )}
                                            >
                                                {/* Status indicator */}
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleRead(msg.id, msg.isRead)}
                                                        title={msg.isRead ? "Mark as unread" : "Mark as read"}
                                                        className="p-1 text-brand-muted hover:text-brand-accent transition-colors"
                                                    >
                                                        {msg.isRead ? (
                                                            <CheckCircle2 size={16} className="text-emerald-500/70" />
                                                        ) : (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-brand-accent mx-auto" />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Combined Name */}
                                                <td className="py-3 px-4 font-semibold text-brand-text whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-[var(--theme-panel)] border border-brand-border flex items-center justify-center text-xs font-bold text-brand-text shrink-0">
                                                            {getInitials(combinedName)}
                                                        </div>
                                                        <span>{combinedName}</span>
                                                    </div>
                                                </td>

                                                {/* Phone Number in "+91 XXXXXXXXXX" format */}
                                                <td className="py-3 px-4 font-mono text-xs text-brand-text whitespace-nowrap">
                                                    <a
                                                        href={`tel:${msg.phone.replace(/\s+/g, '')}`}
                                                        className="flex items-center gap-1.5 hover:text-brand-accent transition-colors"
                                                        title="Click to call"
                                                    >
                                                        <Phone size={13} className="text-brand-accent/80 shrink-0" />
                                                        <span>{formattedPhone}</span>
                                                    </a>
                                                </td>

                                                {/* Email */}
                                                <td className="py-3 px-4 text-xs text-brand-muted whitespace-nowrap">
                                                    <a 
                                                        href={`mailto:${msg.email}`}
                                                        className="hover:text-brand-accent transition-colors"
                                                        title="Send email"
                                                    >
                                                        {msg.email}
                                                    </a>
                                                </td>

                                                {/* Category */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans font-semibold uppercase tracking-wider rounded-md bg-brand-border/60 text-brand-text">
                                                        <span className="text-brand-accent">{getIconForType(msg.type)}</span>
                                                        {msg.type}
                                                    </span>
                                                </td>

                                                {/* Message content */}
                                                <td className="py-3 px-4 text-xs text-brand-muted max-w-xs truncate" title={msg.content}>
                                                    {(() => {
                                                        const { cleanContent, taggedProducts } = parseTaggedProducts(msg.content);
                                                        return (
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                {taggedProducts.length > 0 && (
                                                                    <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-accent/15 text-brand-accent text-[10px] font-semibold border border-brand-accent/30">
                                                                        <Tag size={10} /> {taggedProducts.length}
                                                                    </span>
                                                                )}
                                                                <span className="truncate">{cleanContent}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Date */}
                                                <td className="py-3 px-4 text-xs text-brand-muted whitespace-nowrap">
                                                    {new Date(msg.createdAt).toLocaleDateString('en-GB', { 
                                                        day: 'numeric', month: 'short', year: 'numeric' 
                                                    })}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4 text-right pr-6 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedId(msg.id);
                                                                setViewMode('split');
                                                                if (!msg.isRead) handleToggleRead(msg.id, false);
                                                            }}
                                                            title="View in Split View"
                                                            className="p-1.5 text-brand-muted hover:text-brand-text rounded-md hover:bg-brand-border transition-colors"
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setContactToEdit(msg);
                                                                setEditModalOpen(true);
                                                            }}
                                                            title="Edit Contact"
                                                            className="p-1.5 text-brand-muted hover:text-brand-accent rounded-md hover:bg-brand-accent/10 transition-colors"
                                                        >
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(msg.id)}
                                                            title="Delete"
                                                            className="p-1.5 text-brand-muted hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                /* ======================== SPLIT VIEW (MASTER-DETAIL) ======================== */
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT PANE - MASTER LIST */}
                    <div className={cn(
                        "w-full md:w-96 flex flex-col border-r border-brand-border bg-[var(--theme-bg)] transition-transform duration-300",
                        selectedId ? "hidden md:flex" : "flex"
                    )}>
                        {/* Search and Filters */}
                        <div className="p-4 border-b border-brand-border flex items-center justify-between gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name, phone, email..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-brand-bg border border-brand-border rounded-lg py-2 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent/50 transition-colors"
                                />
                            </div>

                            <div className="relative">
                                <button 
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={cn("transition-colors relative p-2 rounded-lg border", 
                                        typeFilter || isFilterOpen 
                                            ? "text-brand-accent bg-brand-accent/10 border-brand-accent/30" 
                                            : "border-brand-border text-brand-muted hover:text-brand-text bg-brand-bg"
                                    )}
                                    title="Filter by category"
                                >
                                    <Filter size={16} />
                                    {typeFilter && (
                                        <span className="absolute 1 top-1 right-1 w-2 h-2 bg-brand-accent rounded-full border border-brand-panel" />
                                    )}
                                </button>

                                {isFilterOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                        <div className="absolute top-10 right-0 w-48 bg-brand-bg border border-brand-border rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                                            <div className="px-3 py-1.5 text-[10px] font-sans tracking-widest uppercase text-brand-muted mb-1">Filter by Category</div>
                                            {[null, 'ENQUIRY', 'CONTACT', 'CAREER', 'SUPPORT'].map(cat => (
                                                <button
                                                    key={cat || 'ALL'}
                                                    onClick={() => {
                                                        setTypeFilter(cat);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-4 py-2 text-sm font-sans transition-colors",
                                                        typeFilter === cat ? "bg-brand-accent/10 text-brand-accent font-semibold" : "text-brand-text hover:bg-brand-border"
                                                    )}
                                                >
                                                    {cat || 'All Categories'}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Read / Unread Tabs */}
                        <div className="flex p-2 bg-brand-bg border-b border-brand-border">
                            {(['All', 'Read', 'Unread'] as FilterTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterTab(tab)}
                                    className={cn(
                                        "flex-1 text-center py-1.5 text-xs font-sans tracking-wide rounded-md transition-all",
                                        filterTab === tab 
                                            ? "bg-[var(--theme-panel)] text-brand-text shadow-sm border border-brand-border font-semibold" 
                                            : "text-brand-muted hover:text-brand-text hover:bg-brand-border"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Message Cards List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredMessages.length === 0 ? (
                                <div className="p-8 text-center text-brand-muted text-sm font-sans">
                                    No messages found.
                                </div>
                            ) : (
                                <div className="divide-y divide-brand-border/50">
                                    {filteredMessages.map(msg => {
                                        const combinedName = getCombinedName(msg.firstName, msg.lastName);
                                        const formattedPhone = formatPhoneNumber(msg.phone);
                                        return (
                                            <div 
                                                key={msg.id}
                                                onClick={() => {
                                                    setSelectedId(msg.id);
                                                    if (!msg.isRead) handleToggleRead(msg.id, false);
                                                }}
                                                className={cn(
                                                    "p-4 cursor-pointer transition-colors relative group",
                                                    selectedId === msg.id 
                                                        ? "bg-[var(--theme-bg)] border-l-2 border-brand-accent" 
                                                        : "hover:bg-brand-bg border-l-2 border-transparent"
                                                )}
                                            >
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className={cn(
                                                        "text-sm font-sans truncate pr-2",
                                                        !msg.isRead ? "text-brand-text font-bold" : "text-brand-muted"
                                                    )}>
                                                        {combinedName}
                                                    </h3>
                                                    <span className="text-[10px] text-brand-muted shrink-0">
                                                        {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-brand-accent/80">
                                                            {getIconForType(msg.type)}
                                                        </span>
                                                        <span className={cn(
                                                            "text-xs font-sans uppercase tracking-widest",
                                                            !msg.isRead ? "text-brand-text font-bold" : "text-brand-muted"
                                                        )}>
                                                            {msg.type}
                                                        </span>
                                                    </div>

                                                    <span className="text-[11px] font-mono text-brand-muted">
                                                        {formattedPhone}
                                                    </span>
                                                </div>

                                                {(() => {
                                                    const { cleanContent, taggedProducts } = parseTaggedProducts(msg.content);
                                                    return (
                                                        <>
                                                            {taggedProducts.length > 0 && (
                                                                <div className="flex items-center gap-1.5 my-1">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-brand-accent/10 border border-brand-accent/30 text-brand-accent">
                                                                        <Tag size={10} />
                                                                        {taggedProducts.length} {taggedProducts.length === 1 ? 'Product' : 'Products'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <p className="text-xs text-brand-muted line-clamp-2 pr-4">
                                                                {cleanContent}
                                                            </p>
                                                        </>
                                                    );
                                                })()}
                                                
                                                {!msg.isRead && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-accent rounded-full" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANE - DETAIL VIEW */}
                    <div className={cn(
                        "flex-1 flex-col bg-brand-panel",
                        !selectedId ? "hidden md:flex" : "flex"
                    )}>
                        {selectedMessage ? (
                            <>
                                {/* Detail Toolbar */}
                                <div className="h-14 border-b border-brand-border flex items-center justify-between px-4 sticky top-0 bg-brand-panel z-10">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setSelectedId(null)}
                                            className="md:hidden p-2 text-brand-muted hover:text-brand-text"
                                            title="Back to inbox"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                        
                                        <button 
                                            onClick={() => {
                                                setContactToEdit(selectedMessage);
                                                setEditModalOpen(true);
                                            }}
                                            title="Edit Contact"
                                            className="p-2 text-brand-muted hover:text-brand-accent transition-colors rounded-lg hover:bg-brand-accent/10"
                                        >
                                            <Edit3 size={18} />
                                        </button>

                                        <button 
                                            onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.isRead)}
                                            title={selectedMessage.isRead ? "Mark as Unread" : "Mark as Read"}
                                            className="p-2 text-brand-muted hover:text-brand-text transition-colors rounded-lg hover:bg-brand-border"
                                        >
                                            {selectedMessage.isRead ? <Mail size={18} /> : <MailOpen size={18} />}
                                        </button>

                                        <button 
                                            onClick={() => handleDelete(selectedMessage.id)}
                                            title="Delete Message"
                                            className="p-2 text-brand-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-brand-muted font-sans">
                                        {messages.findIndex(m => m.id === selectedMessage.id) + 1} of {messages.length}
                                    </div>
                                </div>

                                {/* Detail Content */}
                                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                                    
                                    {/* Header Info */}
                                    {(() => {
                                        const combinedName = getCombinedName(selectedMessage.firstName, selectedMessage.lastName);
                                        const formattedPhone = formatPhoneNumber(selectedMessage.phone);
                                        return (
                                            <div className="flex items-start justify-between mb-8 pb-6 border-b border-brand-border/60">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-[var(--theme-panel)] border border-brand-border flex items-center justify-center text-brand-text font-bold font-sans tracking-wider text-lg shadow-sm">
                                                        {getInitials(combinedName)}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-brand-text font-sans font-bold text-xl">
                                                            {combinedName}
                                                        </h2>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-brand-muted mt-1">
                                                            <a 
                                                                href={`mailto:${selectedMessage.email}`} 
                                                                className="hover:text-brand-accent transition-colors"
                                                            >
                                                                {selectedMessage.email}
                                                            </a>
                                                            <span className="text-brand-text/20">•</span>
                                                            <a 
                                                                href={`tel:${selectedMessage.phone.replace(/\s+/g, '')}`}
                                                                className="flex items-center gap-1.5 hover:text-brand-accent font-mono text-xs transition-colors"
                                                                title="Call phone number"
                                                            >
                                                                <Phone size={13} className="text-brand-accent" /> 
                                                                <span>{formattedPhone}</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-brand-muted hidden sm:block">
                                                    {new Date(selectedMessage.createdAt).toLocaleString('en-GB', { 
                                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Subject / Type Header */}
                                    <h1 className="text-2xl md:text-3xl text-brand-text mb-6 fancy-text border-b border-brand-border/40 pb-4 flex items-center justify-between">
                                        <span>{selectedMessage.type} SUBMISSION</span>
                                        <span className="text-xs font-sans tracking-widest uppercase px-3 py-1 bg-brand-border text-brand-muted rounded-full">
                                            {selectedMessage.isRead ? 'Read' : 'Unread'}
                                        </span>
                                    </h1>

                                    {(() => {
                                        const { cleanContent, taggedProducts } = parseTaggedProducts(selectedMessage.content);
                                        const siteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000';

                                        return (
                                            <>
                                                {/* Tagged Products Showcase */}
                                                {taggedProducts.length > 0 && (
                                                    <div className="mb-6 p-5 rounded-xl border border-brand-accent/40 bg-brand-accent/5 space-y-3.5 shadow-xs">
                                                        <div className="flex items-center justify-between border-b border-brand-accent/20 pb-2.5">
                                                            <div className="flex items-center gap-2 text-brand-accent">
                                                                <Tag size={15} />
                                                                <h3 className="text-xs font-sans font-bold tracking-widest uppercase">
                                                                    Tagged Product Inquiry ({taggedProducts.length})
                                                                </h3>
                                                            </div>
                                                            <span className="text-[10px] font-sans text-brand-muted">
                                                                Selected via Contact Form
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {taggedProducts.map((prod, idx) => {
                                                                const prodUrl = `${siteUrl}/products/${prod.id}`;
                                                                const rawImg = prod.image;
                                                                const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${siteUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : null;

                                                                return (
                                                                    <div 
                                                                        key={prod.id || idx}
                                                                        className="flex items-center gap-3 p-3 rounded-lg border border-brand-border bg-brand-bg/90 hover:border-brand-accent/60 transition-colors shadow-xs group"
                                                                    >
                                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-brand-panel shrink-0 border border-brand-border/80 flex items-center justify-center relative">
                                                                            {imgUrl ? (
                                                                                <img 
                                                                                    src={imgUrl} 
                                                                                    alt={prod.name}
                                                                                    className="w-full h-full object-cover" 
                                                                                />
                                                                            ) : (
                                                                                <Package size={22} className="text-brand-muted" />
                                                                            )}
                                                                        </div>

                                                                        <div className="min-w-0 flex-1">
                                                                            <h4 className="text-sm font-sans font-bold text-brand-text truncate group-hover:text-brand-accent transition-colors" title={prod.name}>
                                                                                {prod.name}
                                                                            </h4>
                                                                            {prod.category ? (
                                                                                <p className="text-[11px] font-sans text-brand-muted truncate">
                                                                                    {prod.category}{prod.subCategory ? ` • ${prod.subCategory}` : ''}
                                                                                </p>
                                                                            ) : (
                                                                                <p className="text-[11px] font-sans text-brand-muted truncate">
                                                                                    Catalog Product
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        {prod.id && !prod.id.startsWith('ref-') && !prod.id.startsWith('param-') && (
                                                                            <a 
                                                                                href={prodUrl} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer"
                                                                                className="p-2 rounded-md text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 border border-transparent hover:border-brand-accent/30 shrink-0 transition-colors"
                                                                                title="View Product in Store"
                                                                            >
                                                                                <ExternalLink size={14} />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Message Body */}
                                                <div className="prose prose-invert max-w-none font-sans text-brand-text/90 leading-relaxed whitespace-pre-wrap text-base bg-brand-bg/50 p-6 rounded-xl border border-brand-border">
                                                    {cleanContent}
                                                </div>
                                            </>
                                        );
                                    })()}

                                    {/* Attachment Block */}
                                    {selectedMessage.cvUrl && (
                                        <div className="mt-8 p-4 rounded-xl border border-brand-border bg-[var(--theme-bg)] inline-block min-w-[320px]">
                                            <h3 className="text-brand-text font-sans font-bold mb-3 flex items-center gap-2">
                                                <FileText size={16} className="text-brand-accent" />
                                                Attachment (CV / Document)
                                            </h3>
                                            <div className="flex items-center justify-between p-3 bg-brand-bg border border-brand-border rounded-lg gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="p-2 bg-brand-accent/10 text-brand-accent rounded shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <span className="text-sm text-brand-text font-sans truncate max-w-[180px]" title={selectedMessage.cvUrl.split('/').pop()}>
                                                        {selectedMessage.cvUrl.split('/').pop() || `${getCombinedName(selectedMessage.firstName, selectedMessage.lastName).replace(/\s+/g, '_')}_CV.pdf`}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <a 
                                                        href={selectedMessage.cvUrl.startsWith('http') ? selectedMessage.cvUrl : `${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}${selectedMessage.cvUrl.startsWith('/') ? '' : '/'}${selectedMessage.cvUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-brand-accent hover:text-brand-text transition-colors px-2 py-1 flex items-center gap-1"
                                                    >
                                                        <span>View</span>
                                                        <ExternalLink size={12} />
                                                    </a>
                                                    <span className="text-brand-text/20">|</span>
                                                    <a 
                                                        href={selectedMessage.cvUrl.startsWith('http') ? selectedMessage.cvUrl : `${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}${selectedMessage.cvUrl.startsWith('/') ? '' : '/'}${selectedMessage.cvUrl}`} 
                                                        download
                                                        target="_blank"
                                                        className="text-xs text-brand-accent hover:text-brand-text transition-colors px-2 py-1"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </>
                        ) : (
                            // Empty State
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <Mail className="w-16 h-16 text-brand-text/10 mb-4" />
                                <h3 className="text-xl text-brand-text fancy-text">Select a message</h3>
                                <p className="text-brand-muted text-sm mt-2 max-w-xs font-sans">
                                    Choose a message from the inbox list or switch to Table view to see all contact submissions at a glance.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CONTACT EDIT / CREATE MODAL */}
            <ContactEditModal
                contact={contactToEdit}
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setContactToEdit(null);
                }}
                onSave={handleSavedContact}
            />

        </div>
    );
}
