'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAboutContent() {
  const p = prisma as any;
  if (!p.aboutContent) {
    console.warn("Prisma model 'aboutContent' not found in client. Please run 'npx prisma generate'.");
    return null;
  }

  let content = null;
  if (p.aboutContent) {
    try {
      content = await p.aboutContent.findUnique({
        where: { id: 'singleton' }
      });
    } catch (e) {
      console.warn("Database schema mismatch or fetch error. Falling back to defaults.", e);
    }
  }

  const defaults = {
    title: 'The Foundation of Excellence',
    subtitle: 'From humble beginnings to an industry leader in IP Standard Enclosures, BMS Panels, and Industrial Metal Arts.',
    profileContent: 'LOHANRAJO Metal Arts was established with a clear mandate: to provide uncompromising quality in electrical enclosures and industrial metal products. Over the years, we have grown from a local supplier to a trusted partner for major infrastructure projects nationwide.\n\nOur commitment to precision engineering, utilizing premium raw materials like Mild Steel and Stainless Steel, ensures that every product leaving our facility meets strict operational standards.',
    profileImage: '/our company.png',
    establishedText: 'Established Industry Leaders',
    infrastructureContent: 'Our expansive manufacturing facility is equipped with state-of-the-art CNC machinery, automated welding stations, and an advanced powder-coating line. This robust infrastructure allows us to maintain strict tolerances and scale production seamlessly.',
    infrastructureItems: ['CNC Fabrication', 'Automated Assembly', 'Polymer & Powder Coating'],
    accreditationContent: 'We operate under stringent ISO-certified quality management systems. Every enclosure and panel is tested for IP rating compliance, ensuring absolute protection against dust, water, and mechanical impact.',
    visionContent: 'To be the defining standard in industrial metal arts—pioneering solutions that integrate seamlessly with the automation and building management needs of tomorrow. We envision a future built on our resilient infrastructure.',
    founderNames: 'MR.L.L.BASKAR & L.L.SEKAR',
  };

  if (!content) {
    // Initial default content
    content = await (prisma as any).aboutContent.create({
      data: {
        id: 'singleton',
        ...defaults
      }
    });
  }

  return { ...defaults, ...content };
}

export async function updateAboutContent(formData: FormData) {
  const p = prisma as any;
  if (!p.aboutContent) {
    throw new Error("Prisma client not sync'd. Please stop the server and run 'npx prisma generate'.");
  }

  const title = formData.get('title') as string;
  const subtitle = formData.get('subtitle') as string;
  const profileContent = formData.get('profileContent') as string;
  const establishedText = formData.get('establishedText') as string;
  const accreditationContent = formData.get('accreditationContent') as string;
  const visionContent = formData.get('visionContent') as string;
  const infrastructureContent = formData.get('infrastructureContent') as string;
  const infrastructureItemsStr = formData.get('infrastructureItems') as string;
  const infrastructureItems = infrastructureItemsStr.split('\n').map(i => i.trim()).filter(Boolean);
  
  const founderNames = formData.get('founderNames') as string || 'MR.L.L.BASKAR & L.L.SEKAR';
  
  const profileImageFile = formData.get('profileImageFile') as File | null;
  let profileImage = formData.get('profileImage') as string;

  const foundersImageFile = formData.get('foundersImageFile') as File | null;
  let foundersImage = formData.get('foundersImage') as string;

  if (profileImageFile && profileImageFile.size > 0) {
    // Check size limit manually as a precaution
    if (profileImageFile.size > 10 * 1024 * 1024) {
      throw new Error("Image file size exceeds 10MB limit.");
    }

    try {
      const { getStore } = await import('@netlify/blobs');
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const buffer = await profileImageFile.arrayBuffer();
      const filename = `profile-${Date.now()}-${profileImageFile.name.replace(/\s+/g, '-')}`;
      const isNetlify = !!process.env.NETLIFY;

      try {
        if (!isNetlify && !(process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN)) {
          throw new Error('Missing Netlify environment');
        }
        const store = getStore('about');
        await store.set(filename, buffer, {
          metadata: { name: 'profile-image', type: profileImageFile.type }
        });
        profileImage = `/api/blobs/${filename}?store=about`;
      } catch (err) {
        console.warn('Netlify Blobs upload failed, using local storage fallback:', err);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'about');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), Buffer.from(buffer));
        
        // Use an absolute URL for local dev so the main site can access it
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
        profileImage = `${adminUrl}/uploads/about/${filename}`;
      }
    } catch (err: any) {
      console.error('Core upload error:', err);
      // We don't throw here, we just use the existing profileImage (fallback) or error out if it was required
    }
  }

  try {
    await p.aboutContent.upsert({
      where: { id: 'singleton' },
      update: { 
        title, 
        subtitle, 
        profileContent, 
        establishedText, 
        accreditationContent, 
        visionContent, 
        infrastructureContent, 
        infrastructureItems,
        profileImage,
        founderNames
      },
      create: { 
        id: 'singleton', 
        title, 
        subtitle, 
        profileContent, 
        establishedText, 
        accreditationContent, 
        visionContent, 
        infrastructureContent, 
        infrastructureItems,
        profileImage,
        founderNames
      },
    });

    revalidatePath('/admin/about');
    return { success: true };
  } catch (error: any) {
    console.error("Database upsert failed:", error);
    return { success: false, error: error.message || "Failed to save content." };
  }
}
