import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import WithdrawsPageContent from './withdraws-content';

export default async function WithdrawsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return <WithdrawsPageContent />;
}
