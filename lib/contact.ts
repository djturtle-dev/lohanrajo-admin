export function getCombinedName(firstName?: string | null, lastName?: string | null): string {
    return [firstName, lastName].filter(Boolean).join(' ').trim() || 'Anonymous';
}

export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

/**
 * Ensures phone numbers are formatted in the standard "+91 XXXXXXXXXX" format.
 * Defaults country code to "+91" (India) and formats 10 digits with a single space.
 */
export function formatPhoneNumber(phone?: string | null): string {
    if (!phone) return 'N/A';
    const trimmed = phone.trim();
    if (!trimmed) return 'N/A';

    // If already in "+<country_code> <digits>" format (e.g. "+91 9876543210")
    if (/^\+\d{1,4}\s+\d{4,14}$/.test(trimmed)) {
        return trimmed;
    }

    // Format "+919876543210" -> "+91 9876543210"
    const plusMatch = trimmed.match(/^(\+\d{1,4})(\d{10})$/);
    if (plusMatch) {
        return `${plusMatch[1]} ${plusMatch[2]}`;
    }

    const digits = trimmed.replace(/\D/g, '');
    
    // 10 digits without country code -> default to "+91 <10-digits>"
    if (digits.length === 10) {
        return `+91 ${digits}`;
    }

    // 12 digits starting with 91 -> "+91 <10-digits>"
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+91 ${digits.slice(2)}`;
    }

    // 11 digits starting with 0 -> "+91 <10-digits>"
    if (digits.length === 11 && digits.startsWith('0')) {
        return `+91 ${digits.slice(1)}`;
    }

    // If string has a plus followed by code and separators
    if (trimmed.startsWith('+')) {
        const parts = trimmed.split(/[\s-]+/).filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0]} ${parts.slice(1).join('')}`;
        }
    }

    return trimmed;
}

/**
 * Extracts country code and 10-digit national number from an existing phone string.
 */
export function parsePhoneNumber(phone?: string | null): { countryCode: string; nationalNumber: string } {
    if (!phone) return { countryCode: '+91', nationalNumber: '' };
    const trimmed = phone.trim();

    const matchWithSpace = trimmed.match(/^(\+\d{1,4})\s+(\d+)$/);
    if (matchWithSpace) {
        return { countryCode: matchWithSpace[1], nationalNumber: matchWithSpace[2].slice(-10) };
    }

    const matchNoSpace = trimmed.match(/^(\+\d{1,4})(\d{10})$/);
    if (matchNoSpace) {
        return { countryCode: matchNoSpace[1], nationalNumber: matchNoSpace[2] };
    }

    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) {
        return { countryCode: '+91', nationalNumber: digits };
    }
    if (digits.length === 12 && digits.startsWith('91')) {
        return { countryCode: '+91', nationalNumber: digits.slice(2) };
    }
    if (digits.length === 11 && digits.startsWith('0')) {
        return { countryCode: '+91', nationalNumber: digits.slice(1) };
    }

    return { countryCode: '+91', nationalNumber: digits.slice(-10) };
}

/**
 * Splits a combined name into firstName and lastName for database compatibility.
 */
export function splitCombinedName(name: string): { firstName: string; lastName: string } {
    const trimmed = name.trim();
    if (!trimmed) return { firstName: 'Anonymous', lastName: '' };
    const [firstName = '', ...lastNameParts] = trimmed.split(/\s+/);
    return {
        firstName,
        lastName: lastNameParts.join(' ')
    };
}

function escapeCSVField(field: any): string {
    if (field === null || field === undefined) return '""';
    const stringified = String(field);
    return `"${stringified.replace(/"/g, '""')}"`;
}

/**
 * Exports submissions to CSV format with RFC 4180 escaping and UTF-8 BOM.
 */
export function exportContactsToCSV(
    contacts: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        type: string;
        content: string;
        cvUrl?: string | null;
        createdAt: string | Date;
        isRead: boolean;
    }>,
    filename = `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`
) {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Category', 'Status', 'Date', 'Message', 'Attachment'];
    const rows = contacts.map(c => [
        c.id,
        getCombinedName(c.firstName, c.lastName),
        c.email,
        formatPhoneNumber(c.phone),
        c.type,
        c.isRead ? 'Read' : 'Unread',
        new Date(c.createdAt).toLocaleString('en-GB'),
        c.content,
        c.cvUrl || ''
    ]);

    const csvContent = [
        headers.map(escapeCSVField).join(','),
        ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
