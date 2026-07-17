'use client';

import { useState } from 'react';
import { signUp } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signUp.email({
                email,
                password,
                name: "Admin"
            }, {
                onSuccess: () => { router.push('/admin'); },
                onError: (ctx) => {
                    setError(ctx.error.message || JSON.stringify(ctx.error));
                    setLoading(false);
                }
            });
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
            <div className="max-w-md w-full bg-brand-panel border border-brand-border p-8 shadow-sm">
                <div className="flex justify-center mb-6 text-brand-accent">
                    <UserPlus size={48} strokeWidth={1} />
                </div>
                <h1 className="text-3xl text-brand-text text-center mb-2 fancy-text">
                    Create Admin
                </h1>
                <p className="text-center text-brand-muted text-sm font-light mb-8">
                    Set up secure access to Lohanrajo CMS
                </p>

                {error && (
                    <div className="bg-red-50 border border-brand-accent/20 text-brand-accent px-4 py-3 text-sm mb-6">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-sans tracking-widest uppercase text-brand-text mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-brand-border bg-[#1d1d1d] focus:outline-none focus:border-brand-accent transition-colors rounded-full placeholder-brand-muted/40 font-sans"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-sans tracking-widest uppercase text-brand-text mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-brand-border bg-[#1d1d1d] focus:outline-none focus:border-brand-accent transition-colors rounded-full placeholder-brand-muted/40 font-sans"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-glass-primary uppercase tracking-[0.2em] py-5 font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-sans group transition-all duration-500"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Create Account
                                <div className="w-2 h-2 rounded-full bg-white/60 group-hover:bg-green-500 transition-colors" />
                            </>
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <Link
                            href="/login"
                            className="text-xs text-brand-muted hover:text-brand-accent font-sans tracking-widest uppercase transition-colors"
                        >
                            Already have an account? Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
