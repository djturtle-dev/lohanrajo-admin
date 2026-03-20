'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/server';

async function getAdminUser() {
  const result = await auth.getSession();
  const session = result.data;
  if (!session?.user) return null;
  const email = (session.user as any).email || (session.user as any).emailAddress;
  return await prisma.user.findUnique({ where: { email } });
}

// -- CATEGORIES --

export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string;
    if (!name) return { error: 'Name is required' };

    try {
        await prisma.category.create({ data: { name } });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateCategory(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    if (!id || !name) return { error: 'ID and Name are required' };

    try {
        await prisma.category.update({
            where: { id },
            data: { name }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteCategory(formData: FormData) {
    const user = await getAdminUser();
    if (!user || !user.isApproved) return { error: 'Unauthorized' };

    const id = formData.get('id') as string;
    if (!id) return { error: 'ID is required' };

    try {
        if (user.role === 'ADMIN') {
            await prisma.category.delete({ where: { id } });
        } else {
            // EDITOR: Soft delete only
            await prisma.category.update({ 
                where: { id },
                data: { isDeleted: true }
            });
        }
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (e: any) {
        return { error: 'Cannot delete category with associated products or subcategories.' };
    }
}

// -- SUBCATEGORIES --

export async function createSubCategory(formData: FormData) {
    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;
    
    if (!name || !categoryId) return { error: 'Name and Category are required' };

    try {
        await prisma.subCategory.create({
            data: { name, categoryId }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateSubCategory(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;

    if (!id || !name || !categoryId) return { error: 'ID, Name, and Category are required' };

    try {
        await prisma.subCategory.update({
            where: { id },
            data: { name, categoryId }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteSubCategory(formData: FormData) {
    const user = await getAdminUser();
    if (!user || !user.isApproved) return { error: 'Unauthorized' };

    const id = formData.get('id') as string;
    if (!id) return { error: 'ID is required' };

    try {
        if (user.role === 'ADMIN') {
            await prisma.subCategory.delete({ where: { id } });
        } else {
            // EDITOR: Soft delete only
            await prisma.subCategory.update({ 
                where: { id },
                data: { isDeleted: true }
            });
        }
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (e: any) {
        return { error: 'Cannot delete subcategory with associated products.' };
    }
}
