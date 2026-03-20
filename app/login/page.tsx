'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
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
            await signIn.email({
                email,
                password,
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
            <div className="max-w-md w-full bg-white border border-brand-border p-8 shadow-sm">
                <div className="flex justify-center mb-6 text-brand-accent">
                    <Lock size={48} strokeWidth={1} />
                </div>
                <h1 className="text-3xl font-oswald tracking-widest uppercase text-brand-text text-center mb-2">
                    Admin Login
                </h1>
                <p className="text-center text-brand-muted text-sm font-light mb-8">
                    Secure access to Lohanrajo CMS
                </p>

                {error && (
                    <div className="bg-red-50 border border-brand-accent/20 text-brand-accent px-4 py-3 text-sm mb-6">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-oswald tracking-widest uppercase text-brand-text mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-brand-border bg-brand-panel focus:outline-none focus:border-brand-accent transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-oswald tracking-widest uppercase text-brand-text mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-brand-border bg-brand-panel focus:outline-none focus:border-brand-accent transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-accent text-white font-oswald uppercase tracking-widest py-4 hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>

                    <div className="text-center mt-4">
                        <Link
                            href="/signup"
                            className="text-xs text-brand-muted hover:text-brand-accent font-oswald tracking-widest uppercase transition-colors"
                        >
                            Need to create an account? Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
