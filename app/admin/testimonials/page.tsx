import { prisma } from '@/lib/prisma';
import { uploadTestimonial } from '@/app/admin/actions';
import { Upload } from 'lucide-react';
import TestimonialsTable from '@/components/admin/TestimonialsTable';

export default async function TestimonialsAdmin() {
    const testimonials = await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div>
                <h1 className="font-oswald text-3xl uppercase tracking-widest text-brand-text mb-8 border-b border-brand-border pb-4">Testimonial Moderation</h1>

                <div className="bg-brand-panel border border-brand-border p-8 mb-12 max-w-5xl">
                    <h2 className="font-oswald text-xl uppercase tracking-widest text-brand-text mb-6 flex items-center">
                        <Upload className="mr-3 w-5 h-5 text-brand-accent" /> Upload New Testimonial
                    </h2>
                    <form action={uploadTestimonial} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Client Author Name</label>
                                <input required type="text" name="authorName" className="w-full bg-brand-light border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-inter text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Source</label>
                                <select name="source" className="w-full bg-brand-light border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-inter text-sm appearance-none cursor-pointer">
                                    <option value="Google">Google</option>
                                    <option value="Justdial">Justdial</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="E-mail">E-mail</option>
                                    <option value="Direct">Direct</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Review Content</label>
                            <textarea required name="content" rows={3} className="w-full bg-brand-light border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-inter text-sm resize-none" placeholder="Enter the testimonial content..."></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Rating</label>
                                <div className="flex bg-brand-light border border-brand-border p-1">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <label key={num} className="flex-1 cursor-pointer">
                                            <input type="radio" name="rating" value={num} defaultChecked={num === 5} className="sr-only peer" />
                                            <div className="py-2 text-center text-xs font-oswald text-brand-muted peer-checked:bg-brand-accent peer-checked:text-white transition-all">
                                                {num} ★
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-oswald text-xs tracking-widest uppercase text-brand-muted block">Screenshot (Optional)</label>
                                <input type="file" name="screenshot" accept="image/*" className="w-full bg-brand-light border border-brand-border px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors file:mr-4 file:py-1 file:px-3 file:border-0 file:text-[10px] file:font-oswald file:tracking-widest file:uppercase file:bg-brand-panel file:text-brand-text hover:file:bg-brand-border cursor-pointer font-inter text-xs" />
                            </div>
                            <button type="submit" className="bg-brand-accent text-brand-white px-8 py-3.5 font-oswald font-bold tracking-widest uppercase hover:bg-brand-dark transition-colors">
                                Upload Testimonial
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-oswald text-xl uppercase tracking-widest text-brand-text">Manage Reviews</h2>
                        <span className="text-xs font-oswald tracking-widest uppercase text-brand-muted">{testimonials.length} Total</span>
                    </div>

                    <TestimonialsTable initialTestimonials={testimonials} />
                </div>
            </div>
        </div>
    );
}
