'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, User, Mail, Tag, MessageSquare, AlertCircle } from 'lucide-react';
import { ContactSubmission } from '@prisma/client';
import { getCombinedName, parsePhoneNumber } from '@/lib/contact';
import { updateContactSubmission, createContactSubmission } from '@/app/admin/messages/actions';

interface ContactEditModalProps {
    contact?: ContactSubmission | null;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (saved: ContactSubmission) => void;
}

const COUNTRY_CODES = [
    { code: '+91', label: 'India (+91)' },
    { code: '+1', label: 'USA / Canada (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+65', label: 'Singapore (+65)' },
    { code: '+61', label: 'Australia (+61)' },
    { code: '+966', label: 'Saudi Arabia (+966)' },
    { code: '+974', label: 'Qatar (+974)' },
];

export default function ContactEditModal({
    contact,
    isOpen,
    onClose,
    onSave,
}: ContactEditModalProps) {
    const isEdit = Boolean(contact);

    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState('ENQUIRY');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (contact) {
            setName(getCombinedName(contact.firstName, contact.lastName));
            const parsed = parsePhoneNumber(contact.phone);
            setCountryCode(parsed.countryCode || '+91');
            setPhoneNumber(parsed.nationalNumber || '');
            setEmail(contact.email || '');
            setType(contact.type || 'ENQUIRY');
            setContent(contact.content || '');
            setError(null);
        } else {
            setName('');
            setCountryCode('+91');
            setPhoneNumber('');
            setEmail('');
            setType('ENQUIRY');
            setContent('');
            setError(null);
        }
    }, [contact, isOpen]);

    if (!isOpen) return null;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers, max 10 digits
        const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhoneNumber(raw);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Please enter a name');
            return;
        }

        if (phoneNumber.length !== 10) {
            setError('Phone number must be strictly 10 digits');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEdit && contact) {
                const res = await updateContactSubmission(contact.id, {
                    name,
                    countryCode,
                    phone: phoneNumber,
                    email,
                    type,
                    content,
                });
                if (res.success && res.submission) {
                    onSave?.(res.submission);
                    onClose();
                } else {
                    setError(res.error || 'Failed to update contact');
                }
            } else {
                const res = await createContactSubmission({
                    name,
                    countryCode,
                    phone: phoneNumber,
                    email,
                    type,
                    content,
                });
                if (res.success && res.submission) {
                    onSave?.(res.submission);
                    onClose();
                } else {
                    setError(res.error || 'Failed to create contact');
                }
            }
        } catch (err: any) {
            setError(err?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-brand-panel max-w-2xl w-full border border-brand-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-brand-border flex justify-between items-center bg-[var(--theme-bg)]">
                    <div>
                        <h2 className="text-xl text-brand-text fancy-text">
                            {isEdit ? 'Edit Contact' : 'New Contact Submission'}
                        </h2>
                        <p className="text-xs text-brand-muted font-sans mt-0.5">
                            {isEdit 
                                ? 'Update contact details, combined name, and phone format.' 
                                : 'Add a new contact entry directly to the database.'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-brand-muted hover:text-brand-text transition-colors rounded-lg hover:bg-brand-border"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Combined Name Field */}
                    <div className="space-y-1.5">
                        <label className="font-sans text-xs tracking-widest uppercase text-brand-muted flex items-center gap-2">
                            <User size={14} className="text-brand-accent" />
                            Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-lg text-brand-text placeholder-brand-muted/40 transition-colors"
                        />
                        <p className="text-[11px] text-brand-muted font-sans">
                            Single combined name (automatically stored as first and last name for database compatibility).
                        </p>
                    </div>

                    {/* Phone Number with Separate Country Code */}
                    <div className="space-y-1.5">
                        <label className="font-sans text-xs tracking-widest uppercase text-brand-muted flex items-center gap-2">
                            <Phone size={14} className="text-brand-accent" />
                            Phone Number & Country Code
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="w-40 px-3 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-lg text-brand-text transition-colors"
                            >
                                {COUNTRY_CODES.map((c) => (
                                    <option key={c.code} value={c.code} className="bg-brand-panel text-brand-text">
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <input
                                    type="tel"
                                    required
                                    placeholder="10 digit number"
                                    maxLength={10}
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-lg text-brand-text placeholder-brand-muted/40 tracking-wider transition-colors"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted font-mono">
                                    {phoneNumber.length}/10
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-brand-muted font-sans">
                            <span>Strictly 10 digits required.</span>
                            <span className="font-mono text-brand-accent">
                                Stored format: {countryCode} {phoneNumber.padEnd(10, '•')}
                            </span>
                        </div>
                    </div>

                    {/* Email and Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="font-sans text-xs tracking-widest uppercase text-brand-muted flex items-center gap-2">
                                <Mail size={14} className="text-brand-accent" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-lg text-brand-text placeholder-brand-muted/40 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-sans text-xs tracking-widest uppercase text-brand-muted flex items-center gap-2">
                                <Tag size={14} className="text-brand-accent" />
                                Category
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-lg text-brand-text transition-colors"
                            >
                                <option value="ENQUIRY" className="bg-brand-panel text-brand-text">ENQUIRY</option>
                                <option value="CONTACT" className="bg-brand-panel text-brand-text">CONTACT</option>
                                <option value="CAREER" className="bg-brand-panel text-brand-text">CAREER</option>
                                <option value="SUPPORT" className="bg-brand-panel text-brand-text">SUPPORT</option>
                            </select>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="space-y-1.5">
                        <label className="font-sans text-xs tracking-widest uppercase text-brand-muted flex items-center gap-2">
                            <MessageSquare size={14} className="text-brand-accent" />
                            Message Content
                        </label>
                        <textarea
                            rows={4}
                            required
                            placeholder="Enter the message or inquiry details..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3 bg-brand-bg border border-brand-border focus:border-brand-accent outline-none font-sans text-sm rounded-xl text-brand-text placeholder-brand-muted/40 resize-none transition-colors"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-brand-border flex justify-end gap-3 sticky bottom-0 bg-brand-panel">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 btn-glass-secondary text-xs uppercase tracking-widest rounded-lg font-sans transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 btn-glass-primary text-xs uppercase tracking-widest rounded-lg font-sans transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
