'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invite link');
      return;
    }

    const activateAccount = async () => {
      try {
        const res = await fetch(`/api/invite/activate?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('Account activated! You can now sign in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to activate account');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to activate account');
      }
    };

    activateAccount();
  }, [token]);

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Activate Account
          </h2>
        </div>
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Activating your account...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
            <button
              onClick={handleSignIn}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        )}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}

