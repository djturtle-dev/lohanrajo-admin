import { getAboutContent } from './actions';
import AboutEditForm from '@/components/admin/AboutEditForm';
import InfrastructureCardsManager from '@/components/admin/InfrastructureCardsManager';

export default async function AboutAdminPage() {
  const content = await getAboutContent();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h1 className="text-4xl text-brand-text fancy-text">Edit About Page</h1>
          <p className="text-brand-muted font-sans">Manage the core narrative of Lohan Rajo Metal Arts.</p>
        </div>
      </div>

      <AboutEditForm content={content} />
      
      <div className="pt-8 border-t border-brand-border">
          <InfrastructureCardsManager initialCards={content?.infrastructureCards || []} />
      </div>
    </div>
  );
}
