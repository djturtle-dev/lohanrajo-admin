import { getAboutContent, updateAboutContent } from './actions';
import { ShieldCheck, Factory, Lightbulb, UserCheck, CalendarDays } from 'lucide-react';
import AboutEditForm from '@/components/admin/AboutEditForm';

export default async function AboutAdminPage() {
  const content = await getAboutContent();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-4xl text-brand-text fancy-text">Edit About Page</h1>
          <p className="text-brand-muted font-sans">Manage the core narrative of Lohan Rajo Metal Arts.</p>
        </div>
      </div>

      <AboutEditForm content={content} />
    </div>
  );
}
