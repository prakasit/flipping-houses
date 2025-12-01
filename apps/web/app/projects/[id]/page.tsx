import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ProjectDetailPageContent from './project-detail-content';

export default async function ProjectDetailPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return <ProjectDetailPageContent />;
}
