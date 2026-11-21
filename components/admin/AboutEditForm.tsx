'use client'

import { useActionState, useState, useEffect } from 'react';
import { updateAboutContent } from '@/app/admin/about/actions';
import { AlertCircle, CheckCircle2, Plus, Trash2, Image as ImageIcon, Star } from 'lucide-react';
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
    const [galleryImages, setGalleryImages] = useState<string[]>(
        Array.isArray(content.galleryImages) ? content.galleryImages : []
    );
    const [currentProfileImage, setCurrentProfileImage] = useState<string>(content.profileImage || '');
    const [newImageUrl, setNewImageUrl] = useState('');

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
                            <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted mb-1">Primary Profile Photo</label>
                            <div className="space-y-3">
                                <div className="w-full aspect-video border border-brand-border bg-brand-bg/20 flex items-center justify-center overflow-hidden rounded-xl">
                                    <img
                                        src={getAssetUrl(currentProfileImage) || "/our company.png"}
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
                                <input type="hidden" name="profileImage" value={currentProfileImage} />
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted">Upload a new photo to replace primary image, or pick from gallery below.</p>
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

            {/* About & Facility Photo Gallery */}
            <section className="bg-brand-panel border border-brand-border p-8 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-border">
                    <div>
                        <h2 className="text-2xl text-brand-text flex items-center gap-2 fancy-text">
                            <ImageIcon className="w-5 h-5 text-brand-accent" /> Photo Gallery & Facility Images
                        </h2>
                        <p className="text-xs text-brand-muted font-sans mt-1">
                            Add multiple photos to showcase in the About page interactive gallery and facility tour ({galleryImages.length} photos configured).
                        </p>
                    </div>
                </div>

                <input type="hidden" name="galleryImages" value={JSON.stringify(galleryImages)} />

                {/* Upload & Add Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Multi-file upload */}
                    <div className="p-4 border border-brand-border rounded-xl bg-brand-bg/10 space-y-2">
                        <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted">
                            Upload Photos (Select Multiple)
                        </label>
                        <input
                            type="file"
                            name="galleryImageFiles"
                            accept="image/*"
                            multiple
                            className="w-full text-xs text-brand-text file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-accent/20 file:text-brand-accent hover:file:bg-brand-accent/30 cursor-pointer"
                        />
                        <p className="text-[10px] text-brand-muted font-sans">
                            Hold Shift / Ctrl to select multiple JPG/PNG images (up to 10MB each).
                        </p>
                    </div>

                    {/* Add Image by URL */}
                    <div className="p-4 border border-brand-border rounded-xl bg-brand-bg/10 space-y-2">
                        <label className="block text-xs font-sans uppercase tracking-widest text-brand-muted">
                            Add Image by URL or Path
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="e.g. /uploads/about/photo1.jpg"
                                className="flex-1 px-3 py-1.5 border border-brand-border text-xs rounded-full focus:outline-none focus:border-brand-accent bg-transparent text-brand-text placeholder-brand-muted/40"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (newImageUrl.trim()) {
                                        setGalleryImages([...galleryImages, newImageUrl.trim()]);
                                        setNewImageUrl('');
                                    }
                                }}
                                className="px-4 py-1.5 rounded-full bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent/90 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Current Gallery Images Grid */}
                {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {galleryImages.map((imgUrl, idx) => (
                            <div key={idx} className="relative group border border-brand-border rounded-xl overflow-hidden bg-brand-bg/20 flex flex-col justify-between">
                                <div className="aspect-[4/3] w-full relative overflow-hidden flex items-center justify-center p-2">
                                    <img
                                        src={getAssetUrl(imgUrl) || imgUrl}
                                        alt={`Gallery ${idx + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                    <span className="absolute top-1.5 left-1.5 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                                        #{idx + 1}
                                    </span>
                                </div>
                                <div className="p-2 border-t border-brand-border/60 bg-brand-panel/90 flex items-center justify-between gap-1 text-[10px]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentProfileImage(imgUrl);
                                        }}
                                        title="Set as main profile photo"
                                        className={`px-2 py-1 rounded text-[10px] font-sans flex items-center gap-1 transition-colors cursor-pointer ${
                                            currentProfileImage === imgUrl
                                                ? 'bg-brand-accent text-white font-semibold'
                                                : 'text-brand-muted hover:text-brand-accent'
                                        }`}
                                    >
                                        <Star className="w-3 h-3" /> {currentProfileImage === imgUrl ? 'Main' : 'Set Main'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGalleryImages(galleryImages.filter((_, i) => i !== idx));
                                        }}
                                        title="Delete photo"
                                        className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border border-dashed border-brand-border rounded-xl">
                        <ImageIcon className="w-8 h-8 text-brand-muted/40 mx-auto mb-2" />
                        <p className="text-xs text-brand-muted font-sans">No additional gallery photos added yet.</p>
                        <p className="text-[11px] text-brand-muted/60 font-sans mt-0.5">Use the upload tool above to add facility and factory images.</p>
                    </div>
                )}
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
