import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ExpenseDetailPageContent from './expense-detail-content';

export default async function ExpenseDetailPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return <ExpenseDetailPageContent />;
}
