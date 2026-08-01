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
                <h1 className="text-3xl text-brand-text mb-8 border-b border-brand-border pb-4 fancy-text">Testimonial Moderation</h1>

                <div className="bg-brand-panel border border-brand-border p-8 mb-12 max-w-5xl">
                    <h2 className="text-xl text-brand-text mb-6 flex items-center fancy-text">
                        <Upload className="mr-3 w-5 h-5 text-brand-accent" /> Upload New Testimonial
                    </h2>
                    <form action={uploadTestimonial} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Client Author Name</label>
                                <input required type="text" name="authorName" className="w-full bg-brand-bg border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-sans text-sm rounded-full placeholder-brand-muted/40" />
                            </div>
                            <div className="space-y-2">
                                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Source</label>
                                <select name="source" className="w-full bg-brand-bg border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-sans text-sm appearance-none cursor-pointer rounded-full placeholder-brand-muted/40">
                                    <option value="Google">Google</option>
                                    <option value="Justdial">Justdial</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="E-mail">E-mail</option>
                                    <option value="Direct">Direct</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Review Content</label>
                            <textarea required name="content" rows={3} className="w-full bg-brand-bg border border-brand-border px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors font-sans text-sm resize-none rounded-2xl placeholder-brand-muted/40" placeholder="Enter the testimonial content..."></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Rating</label>
                                <div className="flex bg-brand-bg border border-brand-border p-1">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <label key={num} className="flex-1 cursor-pointer">
                                            <input type="radio" name="rating" value={num} defaultChecked={num === 5} className="sr-only peer placeholder-brand-muted/40" />
                                            <div className="py-2 text-center text-xs font-sans text-brand-muted peer-checked:bg-brand-accent peer-checked:text-white transition-all">
                                                {num} ★
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-sans text-xs tracking-widest uppercase text-brand-muted block">Screenshot (Optional)</label>
                                <input type="file" name="screenshot" accept="image/*" className="w-full bg-brand-bg border border-brand-border px-4 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors file:mr-4 file:py-1 file:px-3 file:border-0 file:text-[10px] file:font-sans file:tracking-widest file:uppercase file:bg-brand-bg file:text-brand-text hover:file:bg-brand-border cursor-pointer font-sans text-xs rounded-full placeholder-brand-muted/40" />
                            </div>
 <button type="submit" className="bg-brand-accent px-8 py-3.5 font-sans font-bold tracking-widest uppercase hover:bg-brand-dark transition-colors btn-glass-secondary rounded-full ">
                                Upload Testimonial
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl text-brand-text fancy-text">Manage Reviews</h2>
                        <span className="text-xs font-sans tracking-widest uppercase text-brand-muted">{testimonials.length} Total</span>
                    </div>

                    <TestimonialsTable initialTestimonials={testimonials} />
                </div>
            </div>
        </div>
    );
}
