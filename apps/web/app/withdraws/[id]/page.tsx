import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import WithdrawDetailPageContent from './withdraw-detail-content';

export default async function WithdrawDetailPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return <WithdrawDetailPageContent />;
}
