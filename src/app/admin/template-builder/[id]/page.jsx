import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TemplateBuilderClient from './TemplateBuilderClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: id === 'new' ? 'New Template — OMGS Builder' : 'Edit Template — OMGS Builder',
  };
}

export default async function TemplateBuilderPage({ params }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const { id } = await params;
  return <TemplateBuilderClient templateId={id} />;
}
