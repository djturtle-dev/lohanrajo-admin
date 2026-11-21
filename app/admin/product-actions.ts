'use server';

import { prisma } from '@/lib/prisma';
import { getStore } from '@netlify/blobs';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { auth } from '@/lib/auth/server';

async function getAdminUser() {
  const result = await auth.getSession();
  const session = result.data;
  if (!session?.user) return null;
  const email = (session.user as any).email || (session.user as any).emailAddress;
  return await prisma.user.findUnique({ where: { email } });
}

export async function addProduct(formData: FormData) {
  const rawName = formData.get('name') as string;
  const name = rawName?.trim();
  const categoryId = formData.get('categoryId') as string;
  const subCategoryId = (formData.get('subCategoryId') as string)?.trim() || null;
  const rawDescription = formData.get('description') as string;
  const description = rawDescription?.trim() || '';
  const imageFiles = formData.getAll('images') as File[];

  if (!name) {
    return { success: false, error: 'Product name is required.' };
  }
  if (!categoryId) {
    return { success: false, error: 'Please select a category.' };
  }
  if (!description || description === '<p></p>') {
    return { success: false, error: 'Product description is required.' };
  }

  const imageUrls: string[] = [];
  const isNetlify = !!(
    process.env.NETLIFY || 
    process.env.NETLIFY_BLOBS_CONTEXT || 
    process.env.NETLIFY_IMAGES_CDN_DOMAIN || 
    process.env.SITE_NAME
  );
  const useBlobs = isNetlify || (!!process.env.NETLIFY_SITE_ID && !!process.env.NETLIFY_AUTH_TOKEN);

  for (const file of imageFiles) {
    if (file && file.size > 0 && typeof file.arrayBuffer === 'function') {
      const buffer = await file.arrayBuffer();
      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      let uploaded = false;

      // 1. Try Netlify Blobs if in Netlify environment
      if (useBlobs) {
        try {
          const store = getStore('products');
          await store.set(safeFilename, buffer, {
            metadata: { name, type: file.type }
          });
          imageUrls.push(`/api/blobs/${safeFilename}?store=products`);
          uploaded = true;
        } catch (err) {
          console.warn('Netlify Blobs upload attempt failed, attempting fallback:', err);
        }
      }

      // 2. Try local disk storage fallback
      if (!uploaded) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
          await fs.mkdir(uploadDir, { recursive: true });
          await fs.writeFile(path.join(uploadDir, safeFilename), Buffer.from(buffer));
          imageUrls.push(`/uploads/products/${safeFilename}`);
          uploaded = true;
        } catch (localErr) {
          console.warn('Local disk write failed:', localErr);
          // 3. Fallback to inline Base64 data URI if under 3MB so image is not lost
          if (buffer.byteLength < 3 * 1024 * 1024) {
            const base64 = Buffer.from(buffer).toString('base64');
            const mime = file.type || 'image/jpeg';
            imageUrls.push(`data:${mime};base64,${base64}`);
            uploaded = true;
          }
        }
      }
    }
  }

  try {
    const product = await prisma.product.create({
      data: { 
        name, 
        categoryId, 
        subCategoryId: subCategoryId || null, 
        description,
        images: imageUrls
      }
    });

    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');
    return { success: true, product };
  } catch (dbErr: any) {
    console.error('Failed to create product in DB:', dbErr);
    return { success: false, error: dbErr?.message || 'Failed to save product to database.' };
  }
}

export async function deleteProduct(formData: FormData) {
  const user = await getAdminUser();
  if (!user || !user.isApproved) return { success: false, error: 'Unauthorized' };

  const id = formData.get('id') as string;
  if (!id) return { success: false, error: 'Product ID is required.' };

  try {
    if (user.role === 'ADMIN') {
      await prisma.product.delete({ where: { id } });
    } else {
      // EDITOR: Soft delete only
      await prisma.product.update({ 
        where: { id },
        data: { isDeleted: true }
      });
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete product:', err);
    return { success: false, error: err?.message || 'Failed to delete product.' };
  }
}

export async function updateProduct(formData: FormData) {
  const user = await getAdminUser();
  if (!user || !user.isApproved) return { success: false, error: 'Unauthorized' };

  const id = formData.get('id') as string;
  const rawName = formData.get('name') as string;
  const name = rawName?.trim();
  const categoryId = formData.get('categoryId') as string;
  const subCategoryId = (formData.get('subCategoryId') as string)?.trim() || null;
  const rawDescription = formData.get('description') as string;
  const description = rawDescription?.trim() || '';
  const existingImages = formData.getAll('existingImages') as string[];
  const newImageFiles = formData.getAll('images') as File[];

  if (!id || !name || !categoryId || !description) {
    return { success: false, error: 'Missing required product fields.' };
  }

  const imageUrls: string[] = [...existingImages];
  const isNetlify = !!(
    process.env.NETLIFY || 
    process.env.NETLIFY_BLOBS_CONTEXT || 
    process.env.NETLIFY_IMAGES_CDN_DOMAIN || 
    process.env.SITE_NAME
  );
  const useBlobs = isNetlify || (!!process.env.NETLIFY_SITE_ID && !!process.env.NETLIFY_AUTH_TOKEN);

  for (const file of newImageFiles) {
    if (file && file.size > 0 && typeof file.arrayBuffer === 'function') {
      const buffer = await file.arrayBuffer();
      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      let uploaded = false;

      if (useBlobs) {
        try {
          const store = getStore('products');
          await store.set(safeFilename, buffer, {
            metadata: { name, type: file.type }
          });
          imageUrls.push(`/api/blobs/${safeFilename}?store=products`);
          uploaded = true;
        } catch (err) {
          console.warn('Netlify Blobs upload attempt failed, attempting fallback:', err);
        }
      }

      if (!uploaded) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
          await fs.mkdir(uploadDir, { recursive: true });
          await fs.writeFile(path.join(uploadDir, safeFilename), Buffer.from(buffer));
          imageUrls.push(`/uploads/products/${safeFilename}`);
          uploaded = true;
        } catch (localErr) {
          console.warn('Local disk write failed:', localErr);
          if (buffer.byteLength < 3 * 1024 * 1024) {
            const base64 = Buffer.from(buffer).toString('base64');
            const mime = file.type || 'image/jpeg';
            imageUrls.push(`data:${mime};base64,${base64}`);
            uploaded = true;
          }
        }
      }
    }
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { 
        name, 
        categoryId, 
        subCategoryId: subCategoryId || null, 
        description,
        images: imageUrls
      }
    });

    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');
    return { success: true, product: updated };
  } catch (err: any) {
    console.error('Failed to update product:', err);
    return { success: false, error: err?.message || 'Failed to update product.' };
  }
}
