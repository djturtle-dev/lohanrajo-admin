'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Eye, Users, Activity } from 'lucide-react';

interface ClarityMetrics {
    projectId: string;
    isActive: boolean;
    dashboardUrl: string;
}

export default function ClarityMetrics() {
    const [metrics, setMetrics] = useState<ClarityMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

        if (!projectId) {
            setIsLoading(false);
            return;
        }

        // Check if Clarity is initialized
        const checkClarityStatus = () => {
            const clarityActive = !!(window as any).clarity;
            setMetrics({
                projectId,
                isActive: clarityActive,
                dashboardUrl: `https://clarity.microsoft.com/projects/${projectId}/dashboard`,
            });
            setIsLoading(false);
        };

        // Small delay to ensure Clarity script has loaded
        const timer = setTimeout(checkClarityStatus, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="bg-brand-white border border-brand-border p-6 animate-pulse">
                <div className="h-6 bg-brand-muted/20 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-brand-muted/20 rounded w-1/2"></div>
                    <div className="h-4 bg-brand-muted/20 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="bg-brand-white border border-brand-border p-6">
                <h3 className="font-oswald text-lg uppercase tracking-widest text-brand-text mb-4">Clarity Analytics</h3>
                <p className="text-brand-muted text-sm">Clarity project ID is not configured. Add NEXT_PUBLIC_CLARITY_PROJECT_ID to your environment variables.</p>
            </div>
        );
    }

    return (
        <div className="bg-brand-white border border-brand-border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-oswald text-lg uppercase tracking-widest text-brand-text">Clarity Analytics</h3>
                <BarChart3 className="text-brand-accent h-5 w-5" />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-brand-dark/50 rounded border border-brand-border/50">
                    <div className="flex items-center gap-3">
                        <Activity className={`h-4 w-4 ${metrics.isActive ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="text-sm text-brand-muted">Tracking Status</span>
                    </div>
                    <span className={`text-sm font-semibold ${metrics.isActive ? 'text-green-500' : 'text-red-500'}`}>
                        {metrics.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-brand-dark/50 rounded border border-brand-border/50">
                    <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-brand-accent" />
                        <span className="text-sm text-brand-muted">Project ID</span>
                    </div>
                    <span className="text-sm font-mono text-brand-accent">{metrics.projectId}</span>
                </div>

                <a
                    href={metrics.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-sm font-semibold text-center rounded border border-brand-accent/30 transition-colors"
                >
                    View Full Dashboard →
                </a>

                <p className="text-xs text-brand-muted/70 pt-2 border-t border-brand-border/50">
                    Clarity tracks user sessions, heatmaps, and session recordings. Visit the dashboard to view detailed analytics.
                </p>
            </div>
        </div>
    );
}
