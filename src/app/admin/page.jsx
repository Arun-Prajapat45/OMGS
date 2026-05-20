import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return <AdminDashboardClient />;
}
