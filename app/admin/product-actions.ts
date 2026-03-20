'use server'

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
  const email = session.user.email;
  return await prisma.user.findUnique({ where: { email } });
}

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const subCategoryId = formData.get('subCategoryId') as string;
  const description = formData.get('description') as string;
  const imageFiles = formData.getAll('images') as File[];

  if (!name || !categoryId || !description) return;

  const imageUrls: string[] = [];
  const isNetlify = !!process.env.NETLIFY;

  for (const file of imageFiles) {
    if (file.size > 0) {
      const buffer = await file.arrayBuffer();
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      try {
        if (!isNetlify && !(process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)) {
          throw new Error('Missing Netlify environment');
        }
        
        const store = getStore('products');
        await store.set(filename, buffer, {
          metadata: { name, type: file.type }
        });
        imageUrls.push(`/api/blobs/${filename}?store=products`);
      } catch (err) {
        // Fallback to local storage in development
        console.warn('Netlify Blobs upload failed, using local storage fallback:', err);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), Buffer.from(buffer));
        
        // We need to use the full URL if we're on a different port than the main site
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        imageUrls.push(`${baseUrl}/uploads/products/${filename}`);
      }
    }
  }

  await prisma.product.create({
    data: { 
      name, 
      categoryId, 
      subCategoryId: subCategoryId || null, 
      description,
      images: imageUrls
    }
  });

  revalidatePath('/admin/products');
}

export async function deleteProduct(formData: FormData) {
  const user = await getAdminUser();
  if (!user || !user.isApproved) return;

  const id = formData.get('id') as string;
  if (!id) return;

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
}

export async function updateProduct(formData: FormData) {
  const user = await getAdminUser();
  if (!user || !user.isApproved) return;

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const subCategoryId = formData.get('subCategoryId') as string;
  const description = formData.get('description') as string;
  const existingImages = formData.getAll('existingImages') as string[];
  const newImageFiles = formData.getAll('images') as File[];

  if (!id || !name || !categoryId || !description) return;

  const imageUrls: string[] = [...existingImages];
  const isNetlify = !!process.env.NETLIFY;

  for (const file of newImageFiles) {
    if (file.size > 0) {
      const buffer = await file.arrayBuffer();
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      try {
        if (!isNetlify && !(process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)) {
          throw new Error('Missing Netlify environment');
        }
        
        const store = getStore('products');
        await store.set(filename, buffer, {
          metadata: { name, type: file.type }
        });
        imageUrls.push(`/api/blobs/${filename}?store=products`);
      } catch (err) {
        console.warn('Netlify Blobs upload failed, using local storage fallback:', err);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), Buffer.from(buffer));
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        imageUrls.push(`${baseUrl}/uploads/products/${filename}`);
      }
    }
  }

  await prisma.product.update({
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
}
