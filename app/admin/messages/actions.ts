'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleMessageRead(id: string, isRead: boolean) {
    try {
        await prisma.contactSubmission.update({
            where: { id },
            data: { isRead }
        });
        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle message read status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}
export async function deleteMessage(id: string) {
    try {
        await prisma.contactSubmission.delete({
            where: { id }
        });
        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete message:', error);
        return { success: false, error: 'Failed to delete message' };
    }
}
