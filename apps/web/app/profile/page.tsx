'use client';

import { useSession, signOut } from 'next-auth/react';
import { Layout } from '@/components/Layout';
import { useEffect, useState } from 'react';

function ProfilePageContent() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      setIsAdmin(true);
    }
  }, [session]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (res.ok) {
        alert('Invite sent successfully!');
        setInviteEmail('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
      alert('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
              <p className="mt-1 text-gray-900 dark:text-white">{session?.user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p className="mt-1 text-gray-900 dark:text-white">{session?.user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
              <p className="mt-1 text-gray-900 dark:text-white">{session?.user?.role || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
              <p className="mt-1 text-gray-900 dark:text-white">{session?.user?.status || 'N/A'}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Send Invite</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="user@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="w-full px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </Layout>
  );
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return <ProfilePageContent />;
}

