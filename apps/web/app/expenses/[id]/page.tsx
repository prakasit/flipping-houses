'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { currencyFormat, dateFormat } from '@renovate-tracker/utils';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (params.id && params.id !== 'new') {
      fetchExpense();
    }
  }, [params.id]);

  const fetchExpense = async () => {
    try {
      const res = await fetch('/api/expense');
      if (res.ok) {
        const expenses = await res.json();
        const found = expenses.find((e: any) => e.id === params.id);
        setExpense(found);
      }
    } catch (error) {
      console.error('Failed to fetch expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !expense) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expenseId', expense.id);

    try {
      const res = await fetch('/api/slip/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchExpense();
      }
    } catch (error) {
      console.error('Failed to upload slip:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!expense) return;

    if (!confirm(`Are you sure you want to delete this expense? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/expense/${expense.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/expenses');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!expense) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Expense not found</p>
          <Link href="/expenses" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to Expenses
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/expenses"
              className="text-primary-600 hover:underline text-sm mb-2 inline-block"
            >
              ← Back to Expenses
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{expense.description}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <Link href={`/withdraws/${expense.withdraw.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                {expense.withdraw.description}
              </Link>
              {' - '}
              <Link href={`/projects/${expense.withdraw.loanBudget.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                {expense.withdraw.loanBudget.title}
              </Link>
            </p>
          </div>
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              Delete Expense
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">{currencyFormat(expense.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium">{dateFormat(expense.spentDate, 'short')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Slips</h2>
            <label className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors cursor-pointer text-sm">
              {uploading ? 'Uploading...' : 'Upload Slip'}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expense.slips.map((slip: any) => (
              <div key={slip.id} className="border border-gray-200 rounded-lg p-4">
                <a
                  href={slip.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {slip.fileUrl.split('/').pop()}
                    </span>
                    <span className="text-primary-600 text-sm">View →</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {dateFormat(slip.uploadedAt, 'short')}
                  </p>
                </a>
              </div>
            ))}
          </div>
          {expense.slips.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No slips uploaded yet</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

