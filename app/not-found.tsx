'use client';

import Link from 'next/link';
import { Home, LayoutDashboard, AlertTriangle } from 'lucide-react';

export default function NotFound() {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
    const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000';

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-brand-panel font-sans">
            {/* Geometric Background Pattern from globals.css */}
            <div 
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    background: `
                        linear-gradient(135deg, #0000 20.5%, #f8f8f8 0 29.5%, #0000 0) 0 10px,
                        linear-gradient(45deg, #0000 8%, #f8f8f8 0 17%, #0000 0 58%) 20px 0,
                        linear-gradient(135deg, #0000 8%, #f8f8f8 0 17%, #0000 0 58%, #f8f8f8 0 67%, #0000 0),
                        linear-gradient(45deg, #0000 8%, #f8f8f8 0 17%, #0000 0 58%, #f8f8f8 0 67%, #0000 0 83%, #f8f8f8 0 92%, #0000 0),
                        #ffffff
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 max-w-2xl w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="bg-brand-panel/90 backdrop-blur-xl border border-brand-border p-8 md:p-12 shadow-2xl relative overflow-hidden group border-t-4 border-t-brand-accent">
                    
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-brand-accent/5 rounded-full ring-1 ring-brand-accent/20 animate-pulse">
                            <AlertTriangle className="w-12 h-12 text-brand-accent" />
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-4xl md:text-5xl tracking-tight text-brand-text mb-2 fancy-text">
                            ADMIN ERROR <span className="text-brand-accent">404</span>
                        </h2>
                        <h3 className="text-xl font-sans font-medium uppercase tracking-widest text-brand-muted mb-6">
                            RESOURCE NOT FOUND
                        </h3>
                        
                        <p className="font-sans text-brand-muted text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                            The admin route or resource you are trying to access does not exist or has been moved.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                href={adminUrl}
                                className="flex items-center gap-3 px-8 py-4 bg-brand-text text-white font-sans font-bold uppercase tracking-widest hover:bg-brand-accent transition-all w-full sm:w-auto justify-center group"
                            >
                                <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Admin Dashboard
                            </Link>

                            <Link 
                                href={mainUrl}
                                className="flex items-center gap-3 px-8 py-4 bg-brand-panel border border-brand-border text-brand-text font-sans font-bold uppercase tracking-widest hover:border-brand-accent hover:text-brand-accent transition-all w-full sm:w-auto justify-center group"
                            >
                                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Public Site
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-2 text-brand-muted font-sans font-bold uppercase tracking-widest text-xs opacity-50">
                            <span>LOHANRAJO</span>
                            <div className="w-1 h-1 bg-brand-accent rounded-full" />
                            <span>ADMINISTRATION</span>
                        </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                </div>
            </div>
        </div>
    );
}
