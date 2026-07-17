import { prisma } from '@/lib/prisma';
import MessagesSplitView from './MessagesSplitView';
import { Mailbox } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
    const messages = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const unreadCount = messages.filter(m => !m.isRead).length;

    return (
        <div className="-m-4 sm:-m-8 h-[calc(100vh-64px)] md:h-[calc(100vh-96px)]">
            <MessagesSplitView initialMessages={messages} />
        </div>
    );
}
