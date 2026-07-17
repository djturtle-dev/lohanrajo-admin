'use client';

import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/login');
                }
            }
        });
    };

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center text-sm font-sans tracking-widest transition-colors uppercase w-full btn-glass-secondary rounded-full text-white px-4 py-2 text-xs"
        >
            <LogOut className="w-4 h-4 mr-3" /> Sign Out
        </button>
    );
}
