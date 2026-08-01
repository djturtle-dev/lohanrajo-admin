'use client'

import { useActionState, useState, useEffect } from 'react';
import { updateAboutContent } from '@/app/admin/about/actions';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAssetUrl } from '@/lib/utils';

interface AboutEditFormProps {
    content: any;
}

export default function AboutEditForm({ content }: AboutEditFormProps) {
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            return await updateAboutContent(formData);
        },
        null
    );

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [state?.success]);

    return (
        <form action={formAction} className="space-y-12">
            {state?.error && (
                <div className="bg-red-50 border border-red-200 p-4 text-red-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{state.error}</p>
                </div>
            )}

            {/* Hero Section */}
            <section className="bg-brand-panel border border-brand-border p-8 relative">
                <div className="mb-6">
                    <h2 className="text-2xl text-brand-text flex items-center gap-2 fancy-text">
                        Hero Header
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Main Text</label>
                        <input
                            name="title"
                            defaultValue={content.title}
                            className="w-full px-4 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 rounded-full placeholder-brand-muted/40"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Sub Text</label>
                        <textarea
                            name="subtitle"
                            defaultValue={content.subtitle}
                            className="w-full px-4 py-2 border border-brand-border text-sm font-sans focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 min-h-[80px] resize-none rounded-2xl placeholder-brand-muted/40"
                            required
                        />
                    </div>
                </div>
            </section>

            {/* Our Profile */}
            <section className="bg-brand-panel border border-brand-border p-8 relative">
                <div className="mb-6">
                    <h2 className="text-2xl text-brand-text flex items-center gap-2 fancy-text">
                        Our Profile
                    </h2>
                </div>
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Profile Image</label>
                            <div className="space-y-3">
                                <div className="w-full aspect-video border border-brand-border bg-brand-bg/20 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={getAssetUrl(content.profileImage) || "/our company.png"}
                                        alt="Current Profile"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <input
                                    type="file"
                                    name="profileImageFile"
                                    accept="image/*"
                                    className="w-full px-4 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 rounded-full placeholder-brand-muted/40"
                                />
                                <input type="hidden" name="profileImage" value={content.profileImage} />
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted">Max size: 10MB. Upload new image to replace.</p>
                            </div>
                        </div>
                        <div className="w-full md:w-2/3 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Established Date</label>
                                    <input
                                        name="establishedText"
                                        defaultValue={content.establishedText}
                                        placeholder="e.g. Since 1992"
                                        className="w-full px-4 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 rounded-full placeholder-brand-muted/40"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Founder Names</label>
                                    <input
                                        name="founderNames"
                                        defaultValue={content.founderNames}
                                        placeholder="e.g. MR.L.L.BASKAR & L.L.SEKAR"
                                        className="w-full px-4 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 rounded-full placeholder-brand-muted/40"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Description</label>
                                <textarea
                                    name="profileContent"
                                    defaultValue={content.profileContent}
                                    className="w-full px-4 py-2 border border-brand-border text-sm font-sans leading-relaxed focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 min-h-[160px] resize-none rounded-2xl placeholder-brand-muted/40"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Accreditation & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-brand-panel border border-brand-border p-8 relative">
                    <div className="mb-6">
                        <h2 className="text-2xl text-brand-text flex items-center gap-2 fancy-text">
                            Accreditation
                        </h2>
                    </div>
                    <div>
                        <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Description</label>
                        <textarea
                            name="accreditationContent"
                            defaultValue={content.accreditationContent}
                            className="w-full px-4 py-2 border border-brand-border text-sm font-sans leading-relaxed focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 min-h-[100px] resize-none rounded-2xl placeholder-brand-muted/40"
                            required
                        />
                    </div>
                </section>

                <section className="bg-brand-panel border border-brand-border p-8 relative">
                    <div className="mb-6">
                        <h2 className="text-2xl text-brand-text flex items-center gap-2 fancy-text">
                            Vision
                        </h2>
                    </div>
                    <div>
                        <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Description</label>
                        <textarea
                            name="visionContent"
                            defaultValue={content.visionContent}
                            className="w-full px-4 py-2 border border-brand-border text-sm font-sans leading-relaxed focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 min-h-[100px] resize-none rounded-2xl placeholder-brand-muted/40"
                            required
                        />
                    </div>
                </section>
            </div>

            {/* Save Action */}
            <div className="flex justify-end sticky bottom-8">
                {showSuccess && (
                    <div className="bg-green-50 border border-green-200 p-4 text-green-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 mr-4">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">Updated successfully!</p>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-10 py-4 btn-glass-primary text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md rounded-full font-sans"
                >
                    {isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-brand-border border-t-white rounded-full animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Update About Content'
                    )}
                </button>
            </div>
        </form>
    );
}
