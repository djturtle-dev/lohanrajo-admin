'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateFooterContent(formData: FormData) {
    try {
        const companyDesc = (formData.get('companyDesc') as string)?.trim() || 
            "Passionate about manufacturing high quality engineering products since 1992. Chennai, India.";
        const contactLinksRaw = formData.get('contactLinks') as string;
        const productLinksRaw = formData.get('productLinks') as string;

        let contactLinks = [];
        let productLinks = [];

        try {
            contactLinks = JSON.parse(contactLinksRaw || '[]');
            productLinks = JSON.parse(productLinksRaw || '[]');
        } catch {
            return { error: 'Invalid JSON format for footer links' };
        }

        await (prisma as any).footerContent.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                companyDesc,
                contactLinks,
                productLinks
            },
            update: {
                companyDesc,
                contactLinks,
                productLinks
            }
        });

        revalidatePath('/admin/footer');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Failed to update footer content' };
    }
}
