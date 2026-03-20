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
            className="flex items-center text-sm font-oswald tracking-widest hover:text-brand-accent transition-colors uppercase w-full text-brand-muted"
        >
            <LogOut className="w-4 h-4 mr-3" /> Sign Out
        </button>
    );
}
