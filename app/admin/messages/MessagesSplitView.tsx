'use client';

import { useState, useMemo, useTransition } from 'react';
import { ContactSubmission } from '@prisma/client';
import { 
    Search, Trash2, Mail, MailOpen, Download, 
    UserCircle, Briefcase, HelpCircle, Phone, 
    Info, FileText, Filter, ArrowLeft, ArrowDownToLine
} from 'lucide-react';
import { toggleMessageRead, deleteMessage } from './actions';
import { cn } from '@/lib/utils';

interface MessagesSplitViewProps {
    initialMessages: ContactSubmission[];
}

type FilterTab = 'All' | 'Read' | 'Unread';

export default function MessagesSplitView({ initialMessages }: MessagesSplitViewProps) {
    const [messages, setMessages] = useState<ContactSubmission[]>(initialMessages);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('All');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
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
            filtered = filtered.filter(m => 
                m.firstName.toLowerCase().includes(q) ||
                m.lastName.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                m.type.toLowerCase().includes(q) ||
                m.content.toLowerCase().includes(q)
            );
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

    const getIconForType = (type: string) => {
        switch (type) {
            case 'CAREER': return <Briefcase size={16} />;
            case 'SUPPORT': return <HelpCircle size={16} />;
            case 'ENQUIRY': return <Info size={16} />;
            default: return <Mail size={16} />;
        }
    };

    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="flex h-full overflow-hidden bg-brand-panel border-y sm:border-t-0 border-brand-border">
            
            {/* LEFT PANE - MASTER LIST */}
            <div className={cn(
                "w-full md:w-96 flex flex-col border-r border-brand-border bg-[var(--theme-bg)] transition-transform duration-300",
                selectedId ? "hidden md:flex" : "flex"
            )}>
                {/* Header */}
                <div className="p-4 border-b border-brand-border flex items-center justify-between relative">
                    <h2 className="text-xl fancy-text text-brand-text">Inbox</h2>
                    <div className="relative">
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={cn("transition-colors relative p-1 rounded-md", 
                                typeFilter || isFilterOpen ? "text-brand-accent bg-brand-accent/10" : "text-brand-muted hover:text-brand-text"
                            )}
                        >
                            <Filter size={18} />
                            {typeFilter && (
                                <span className="absolute 1 top-0 right-0 w-2 h-2 bg-brand-accent rounded-full border border-brand-panel" />
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
                                                typeFilter === cat ? "bg-brand-accent/10 text-brand-accent" : "text-brand-text hover:bg-brand-border"
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

                {/* Search */}
                <div className="p-4 border-b border-brand-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-lg py-2 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-brand-bg border-b border-brand-border">
                    {(['All', 'Read', 'Unread'] as FilterTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilterTab(tab)}
                            className={cn(
                                "flex-1 text-center py-1.5 text-xs font-sans tracking-wide rounded-md transition-all",
                                filterTab === tab 
                                    ? "bg-[var(--theme-panel)] text-brand-text shadow-sm border border-brand-border" 
                                    : "text-brand-muted hover:text-brand-text hover:bg-brand-border"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredMessages.length === 0 ? (
                        <div className="p-8 text-center text-brand-muted text-sm">
                            No messages found.
                        </div>
                    ) : (
                        <div className="divide-y divide-brand-border/50">
                            {filteredMessages.map(msg => (
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
                                            {msg.firstName} {msg.lastName}
                                        </h3>
                                        <span className="text-[10px] text-brand-muted shrink-0">
                                            {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
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
                                    <p className="text-xs text-brand-muted line-clamp-2 pr-4">
                                        {msg.content}
                                    </p>
                                    
                                    {!msg.isRead && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-accent rounded-full" />
                                    )}
                                </div>
                            ))}
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
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                
                                <button 
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    title="Delete Message"
                                    className="p-2 text-brand-muted hover:text-brand-accent transition-colors rounded-lg hover:bg-brand-accent/10"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.isRead)}
                                    title={selectedMessage.isRead ? "Mark as Unread" : "Mark as Read"}
                                    className="p-2 text-brand-muted hover:text-brand-text transition-colors rounded-lg hover:bg-brand-border"
                                >
                                    {selectedMessage.isRead ? <Mail size={18} /> : <MailOpen size={18} />}
                                </button>
                            </div>
                            <div className="text-xs text-brand-muted font-sans">
                                {messages.findIndex(m => m.id === selectedMessage.id) + 1} of {messages.length}
                            </div>
                        </div>

                        {/* Detail Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                            
                            {/* Header Info */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--theme-panel)] border border-brand-border flex items-center justify-center text-brand-text font-bold font-sans tracking-wider">
                                        {getInitials(selectedMessage.firstName, selectedMessage.lastName)}
                                    </div>
                                    <div>
                                        <h2 className="text-brand-text font-sans font-bold text-lg">
                                            {selectedMessage.firstName} {selectedMessage.lastName}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-brand-muted mt-0.5">
                                            <span>{selectedMessage.email}</span>
                                            <span className="text-brand-text/20">•</span>
                                            <span className="flex items-center gap-1">
                                                <Phone size={12} /> {selectedMessage.phone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-brand-muted hidden sm:block">
                                    {new Date(selectedMessage.createdAt).toLocaleString('en-GB', { 
                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            {/* Subject / Type Header */}
                            <h1 className="text-3xl text-brand-text mb-6 fancy-text border-b border-brand-border/50 pb-6">
                                {selectedMessage.type} SUBMISSION
                            </h1>

                            {/* Message Body */}
                            <div className="prose prose-invert max-w-none font-sans text-brand-muted leading-relaxed whitespace-pre-wrap">
                                {selectedMessage.content}
                            </div>

                            {/* Attachment Block */}
                            {selectedMessage.cvUrl && (
                                <div className="mt-12 p-4 rounded-xl border border-brand-border bg-[var(--theme-bg)] inline-block min-w-[300px]">
                                    <h3 className="text-brand-text font-sans font-bold mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-brand-accent" />
                                        Attachment
                                    </h3>
                                    <div className="flex items-center justify-between p-3 bg-brand-bg border border-brand-border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-brand-accent/10 text-brand-accent rounded">
                                                <FileText size={20} />
                                            </div>
                                            <span className="text-sm text-brand-text font-sans truncate max-w-[150px]" title={selectedMessage.cvUrl.split('/').pop()}>
                                                {selectedMessage.cvUrl.split('/').pop() || `${selectedMessage.firstName}_CV.pdf`}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <a 
                                                href={selectedMessage.cvUrl.startsWith('http') ? selectedMessage.cvUrl : `${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}${selectedMessage.cvUrl.startsWith('/') ? '' : '/'}${selectedMessage.cvUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-brand-accent hover:text-brand-text transition-colors px-2 py-1"
                                            >
                                                View
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
                        <Mail className="w-16 h-16 text-brand-text/5 mb-4" />
                        <h3 className="text-xl text-brand-text fancy-text">Select a message</h3>
                        <p className="text-brand-muted text-sm mt-2 max-w-xs">
                            Choose a message from the list to read its contents and manage attachments.
                        </p>
                    </div>
                )}
            </div>
            
        </div>
    );
}
