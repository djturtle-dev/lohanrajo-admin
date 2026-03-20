'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateHomeContent(formData: FormData) {
    try {
        const heroLinesRaw = formData.get('heroLines') as string;
        const pillarsRaw = formData.get('pillars') as string;
        
        let heroLines = [];
        let pillars = [];

        try {
            heroLines = JSON.parse(heroLinesRaw);
            pillars = JSON.parse(pillarsRaw);
        } catch (e) {
            return { error: 'Invalid JSON data format' };
        }

        await prisma.homeContent.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                heroLines,
                pillars
            },
            update: {
                heroLines,
                pillars
            }
        });

        revalidatePath('/admin/home');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Failed to update Home Content' };
    }
}
