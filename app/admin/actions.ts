'use server'

import { prisma } from '@/lib/prisma';
import { getStore } from '@netlify/blobs';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function uploadTestimonial(formData: FormData) {
  const authorName = formData.get('authorName') as string;
  const content = formData.get('content') as string || 'Screenshot Review';
  const rating = parseInt(formData.get('rating') as string) || 5;
  const source = formData.get('source') as string || 'Direct';

  await prisma.testimonial.create({
    data: {
      authorName,
      content,
      rating,
      source,
      featured: false,
    }
  });

  revalidatePath('/admin/testimonials');
}

export async function deleteTestimonial(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath('/admin/testimonials');
}

export async function toggleTestimonialFeatured(formData: FormData) {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('currentStatus') === 'true';

  await prisma.testimonial.update({
    where: { id },
    data: { featured: !currentStatus }
  });

  revalidatePath('/admin/testimonials');
}

export async function updateTestimonial(formData: FormData) {
  const id = formData.get('id') as string;
  const authorName = formData.get('authorName') as string;
  const content = formData.get('content') as string;
  const rating = parseInt(formData.get('rating') as string) || 5;
  const source = formData.get('source') as string;
  const featured = formData.get('featured') === 'on';

  await prisma.testimonial.update({
    where: { id },
    data: { authorName, content, rating, source, featured }
  });

  revalidatePath('/admin/testimonials');
}

// ── User Actions ─────────────────────────────────────────────────────────────

export async function toggleUserApproval(formData: FormData) {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('currentStatus') === 'true';

  await prisma.user.update({
    where: { id },
    data: { isApproved: !currentStatus }
  });

  revalidatePath('/admin/users');
}

export async function toggleUserRole(formData: FormData) {
  const id = formData.get('id') as string;
  const currentRole = formData.get('currentRole') as string;
  const nextRole = currentRole === 'ADMIN' ? 'EDITOR' : 'ADMIN';

  await prisma.user.update({
    where: { id },
    data: { role: nextRole }
  });

  revalidatePath('/admin/users');
}
