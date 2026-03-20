'use client';

import { useState } from 'react';
import { updateHomeContent } from './actions';
import { Save, Plus, Trash2, GripVertical, AlertCircle, Info } from 'lucide-react';

export default function HomeContentEditor({ initialData }: { initialData: any }) {
    const [heroLines, setHeroLines] = useState<string[]>(initialData.heroLines || []);
    const [pillars, setPillars] = useState<{ icon: string; title: string; desc: string }[]>(
        (typeof initialData.pillars === 'string' ? JSON.parse(initialData.pillars) : initialData.pillars) || []
    );
    const [isSaving, setIsSaving] = useState(false);

    // --- Hero Lines logic ---
    const addHeroLine = () => setHeroLines([...heroLines, "New Line"]);
    const removeHeroLine = (index: number) => setHeroLines(heroLines.filter((_, i) => i !== index));
    const updateHeroLine = (index: number, val: string) => {
        const newLines = [...heroLines];
        newLines[index] = val;
        setHeroLines(newLines);
    };

    // --- Pillars logic ---
    const updatePillar = (index: number, field: 'icon' | 'title' | 'desc', val: string) => {
        const newPillars = [...pillars];
        newPillars[index] = { ...newPillars[index], [field]: val };
        setPillars(newPillars);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('heroLines', JSON.stringify(heroLines));
        formData.append('pillars', JSON.stringify(pillars));

        const res = await updateHomeContent(formData);
        if (res.success) {
            alert('Home Content Saved Successfully!');
        } else {
            alert(res.error || 'Failed to save');
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-12">
            {/* HEROLINES */}
            <section className="bg-white border border-brand-border p-8 relative">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-oswald text-2xl uppercase tracking-widest text-brand-text flex items-center gap-2">
                            Animated Hero Lines
                        </h2>
                        <p className="text-sm text-brand-muted mt-1 flex items-center gap-1">
                            <Info size={14} /> Wrap text in asterisks to highlight in red, e.g., <code className="bg-brand-light px-1">*Metal Arts*</code>
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {heroLines.map((line, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="text-brand-muted/50 cursor-move">
                                <GripVertical size={18} />
                            </div>
                            <textarea
                                rows={2}
                                className="flex-1 px-4 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 font-inter resize-none"
                                value={line}
                                onChange={(e) => updateHeroLine(index, e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeHeroLine(index)}
                                className="p-2 text-brand-muted hover:text-red-600 hover:bg-red-50 transition border border-transparent rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addHeroLine}
                        className="flex items-center gap-2 text-sm font-oswald uppercase tracking-widest text-brand-muted hover:text-brand-accent transition mt-4 px-2"
                    >
                        <Plus size={16} /> Add Line
                    </button>
                </div>
            </section>

            {/* PILLARS */}
            <section className="bg-white border border-brand-border p-8 relative">
                <div className="mb-6">
                    <h2 className="font-oswald text-2xl uppercase tracking-widest text-brand-text">
                        The 3 Focus Pillars
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">Displayed directly below the hero section.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pillars.map((pillar, index) => (
                        <div key={index} className="p-6 border border-brand-border bg-brand-light/20 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-oswald uppercase tracking-widest text-brand-muted mb-1">Lucide Icon Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-accent"
                                    value={pillar.icon}
                                    placeholder="e.g. Factory, ShieldCheck"
                                    onChange={(e) => updatePillar(index, 'icon', e.target.value)}
                                />
                                <p className="text-[10px] text-brand-muted mt-1 truncate">Uses lucide-react icons</p>
                            </div>

                            <div>
                                <label className="block text-xs font-oswald uppercase tracking-widest text-brand-muted mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-brand-border text-sm font-oswald uppercase tracking-widest focus:outline-none focus:border-brand-accent"
                                    value={pillar.title}
                                    onChange={(e) => updatePillar(index, 'title', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-oswald uppercase tracking-widest text-brand-muted mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-brand-border text-sm font-inter focus:outline-none focus:border-brand-accent min-h-[100px] resize-none"
                                    value={pillar.desc}
                                    onChange={(e) => updatePillar(index, 'desc', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SAVE ACTION */}
            <div className="flex justify-end sticky bottom-8">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 bg-brand-accent text-white font-oswald text-lg uppercase tracking-widest hover:bg-red-700 transition shadow-lg shadow-brand-accent/20 disabled:opacity-50"
                >
                    <Save size={20} />
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
