'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { splitCombinedName } from '@/lib/contact';

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

export async function updateContactSubmission(id: string, data: {
    name: string;
    countryCode?: string;
    phone: string;
    email: string;
    type: string;
    content: string;
}) {
    try {
        const { firstName, lastName } = splitCombinedName(data.name);

        const countryCode = (data.countryCode || '+91').trim();
        const digitsOnly = data.phone.replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
            return { success: false, error: 'Phone number must be strictly 10 digits' };
        }
        const formattedPhone = `${countryCode} ${digitsOnly}`;

        const updated = await prisma.contactSubmission.update({
            where: { id },
            data: {
                firstName,
                lastName,
                phone: formattedPhone,
                email: data.email.trim(),
                type: data.type.trim().toUpperCase(),
                content: data.content.trim(),
            }
        });
        revalidatePath('/admin/messages');
        return { success: true, submission: updated };
    } catch (error) {
        console.error('Failed to update submission:', error);
        return { success: false, error: 'Failed to update contact' };
    }
}

export async function createContactSubmission(data: {
    name: string;
    countryCode?: string;
    phone: string;
    email: string;
    type: string;
    content: string;
}) {
    try {
        const { firstName, lastName } = splitCombinedName(data.name);

        const countryCode = (data.countryCode || '+91').trim();
        const digitsOnly = data.phone.replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
            return { success: false, error: 'Phone number must be strictly 10 digits' };
        }
        const formattedPhone = `${countryCode} ${digitsOnly}`;

        const created = await prisma.contactSubmission.create({
            data: {
                firstName,
                lastName,
                phone: formattedPhone,
                email: data.email.trim(),
                type: data.type.trim().toUpperCase() || 'ENQUIRY',
                content: data.content.trim(),
            }
        });
        revalidatePath('/admin/messages');
        return { success: true, submission: created };
    } catch (error) {
        console.error('Failed to create submission:', error);
        return { success: false, error: 'Failed to create contact' };
    }
}
