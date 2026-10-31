export function getAssetUrl(path: string | null | undefined): string {
    if (!path) return '';
    
    // If it's a localhost URL from previous database entries, strip host to load from current origin
    if (path.startsWith('http://localhost') || path.startsWith('http://127.0.0.1')) {
        try {
            const url = new URL(path);
            return url.pathname + url.search;
        } catch {}
    }

    // If it's an external remote URL (like production Netlify CDN), return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // On the admin app, serve assets directly as relative paths
    return normalizedPath;
}

export function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
