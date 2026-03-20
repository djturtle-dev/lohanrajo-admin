export function getAssetUrl(path: string | null | undefined): string {
    if (!path) return '';
    
    // If it's already an absolute URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // On the admin app, it can serve its own local assets
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
    
    // Remove trailing slash from adminUrl if present
    const base = adminUrl.endsWith('/') ? adminUrl.slice(0, -1) : adminUrl;
    
    return `${base}${normalizedPath}`;
}

export function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
