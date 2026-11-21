'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateHomeContent(formData: FormData) {
    try {
        const heroLinesRaw = formData.get('heroLines') as string;
        const pillarsRaw = formData.get('pillars') as string;
        const featuredProductsRaw = formData.get('featuredProducts') as string;
        
        let heroLines = [];
        let pillars = [];
        let featuredProducts: any[] = [];

        try {
            heroLines = JSON.parse(heroLinesRaw);
            pillars = JSON.parse(pillarsRaw);
            if (featuredProductsRaw) {
                featuredProducts = JSON.parse(featuredProductsRaw);
            }
        } catch {
            return { error: 'Invalid JSON data format' };
        }

        // Process any uploaded image files for featured products
        const processedFeatured = await Promise.all(
            featuredProducts.map(async (item: any, idx: number) => {
                const file = formData.get(`featuredImage_${idx}`) as File | null;
                if (file && file.size > 0) {
                    try {
                        const { getStore } = await import('@netlify/blobs');
                        const fs = await import('fs/promises');
                        const path = await import('path');

                        const buffer = await file.arrayBuffer();
                        const filename = `featured-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                        const isNetlify = !!(
                            process.env.NETLIFY || 
                            process.env.NETLIFY_BLOBS_CONTEXT || 
                            process.env.NETLIFY_IMAGES_CDN_DOMAIN || 
                            process.env.SITE_NAME
                        );
                        const useBlobs = isNetlify || (!!process.env.NETLIFY_SITE_ID && !!process.env.NETLIFY_AUTH_TOKEN);

                        let imageUrl = '';
                        if (useBlobs) {
                            const store = getStore('products');
                            await store.set(filename, buffer, {
                                metadata: { name: 'featured-image', type: file.type }
                            });
                            imageUrl = `/api/blobs/${filename}?store=products`;
                        } else {
                            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
                            await fs.mkdir(uploadDir, { recursive: true });
                            await fs.writeFile(path.join(uploadDir, filename), Buffer.from(buffer));
                            imageUrl = `/uploads/products/${filename}`;
                        }
                        return { ...item, imageUrl };
                    } catch (uploadErr) {
                        console.error('Featured image upload failed:', uploadErr);
                        return item;
                    }
                }
                return item;
            })
        );

        await prisma.homeContent.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                heroLines,
                pillars,
                featuredProducts: processedFeatured
            },
            update: {
                heroLines,
                pillars,
                featuredProducts: processedFeatured
            }
        });

        revalidatePath('/admin/home');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Failed to update Home Content' };
    }
}
