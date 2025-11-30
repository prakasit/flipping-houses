'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Drawer } from '@/components/Drawer';
import { CurrencyInput } from '@/components/CurrencyInput';
import { currencyFormat, dateFormat, calculateWithdrawSummary } from '@renovate-tracker/utils';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function WithdrawDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [withdraw, setWithdraw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    withdrawId: '',
    amount: '',
    description: '',
    spentDate: new Date().toISOString().split('T')[0],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expenseFormLoading, setExpenseFormLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchWithdraw();
    }
  }, [params.id]);

  const fetchWithdraw = async () => {
    try {
      const res = await fetch('/api/withdraw');
      if (res.ok) {
        const withdraws = await res.json();
        const found = withdraws.find((w: any) => w.id === params.id);
        setWithdraw(found);
      }
    } catch (error) {
      console.error('Failed to fetch withdraw:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: 'APPROVED' | 'REJECTED') => {
    if (!session?.user || session.user.role !== 'ADMIN') return;

    try {
      const res = await fetch(`/api/withdraw/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchWithdraw();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !withdraw) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('withdrawId', withdraw.id);

    try {
      const res = await fetch('/api/withdraw-slip/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchWithdraw();
      }
    } catch (error) {
      console.error('Failed to upload slip:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!withdraw) return;

    if (!confirm(`Are you sure you want to delete this withdraw request? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/withdraw/${withdraw.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/withdraws');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete withdraw');
      }
    } catch (error) {
      console.error('Failed to delete withdraw:', error);
      alert('Failed to delete withdraw');
    }
  };

  const handleOpenExpenseForm = () => {
    if (withdraw) {
      setExpenseFormData({
        withdrawId: withdraw.id,
        amount: '',
        description: '',
        spentDate: new Date().toISOString().split('T')[0],
      });
      setSelectedFiles([]);
      setShowExpenseForm(true);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdraw) return;

    setExpenseFormLoading(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append('withdrawId', expenseFormData.withdrawId);
      submitFormData.append('amount', expenseFormData.amount);
      submitFormData.append('description', expenseFormData.description);
      submitFormData.append('spentDate', new Date(expenseFormData.spentDate).toISOString());
      
      // Append files
      selectedFiles.forEach((file) => {
        submitFormData.append('files', file);
      });

      const res = await fetch('/api/expense', {
        method: 'POST',
        body: submitFormData,
      });

      if (res.ok) {
        setShowExpenseForm(false);
        setExpenseFormData({
          withdrawId: withdraw.id,
          amount: '',
          description: '',
          spentDate: new Date().toISOString().split('T')[0],
        });
        setSelectedFiles([]);
        fetchWithdraw(); // Refresh withdraw data
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setExpenseFormLoading(false);
    }
  };

  const handleExpenseFormClose = () => {
    setShowExpenseForm(false);
    if (withdraw) {
      setExpenseFormData({
        withdrawId: withdraw.id,
        amount: '',
        description: '',
        spentDate: new Date().toISOString().split('T')[0],
      });
      setSelectedFiles([]);
    }
  };

  const handleExpenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
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

  if (!withdraw) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Withdraw request not found</p>
          <Link href="/withdraws" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to Withdraws
          </Link>
        </div>
      </Layout>
    );
  }

  const summary = calculateWithdrawSummary(withdraw);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/withdraws"
              className="text-primary-600 hover:underline text-sm mb-2 inline-block"
            >
              ← Back to Withdraws
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{withdraw.description}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <Link href={`/projects/${withdraw.loanBudget?.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                {withdraw.loanBudget?.title || 'Unknown Project'}
              </Link>
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded ${
              withdraw.status === 'APPROVED'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : withdraw.status === 'REJECTED'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
            }`}
          >
            {withdraw.status}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Amount:</span>
              <span className="font-medium text-gray-900 dark:text-white">{currencyFormat(withdraw.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Description:</span>
              <span className="font-medium text-gray-900 dark:text-white">{withdraw.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Requested:</span>
              <span className="font-medium text-gray-900 dark:text-white">{dateFormat(withdraw.requestedAt, 'short')}</span>
            </div>
            {withdraw.approvedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Approved:</span>
                <span className="font-medium text-gray-900 dark:text-white">{dateFormat(withdraw.approvedAt, 'short')}</span>
              </div>
            )}
          </div>

          {session?.user?.role === 'ADMIN' && (
            <div className="mt-6 flex gap-2">
              {withdraw.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleStatusChange('APPROVED')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange('REJECTED')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supporting Documents</h2>
            <label className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors cursor-pointer text-sm">
              {uploading ? 'Uploading...' : 'Upload Document'}
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
            {(withdraw.slips || []).map((slip: any) => (
              <div key={slip.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <a
                  href={slip.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {slip.fileUrl.split('/').pop()}
                    </span>
                    <span className="text-primary-600 dark:text-primary-400 text-sm">View →</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dateFormat(slip.uploadedAt, 'short')}
                  </p>
                </a>
              </div>
            ))}
          </div>
          {(!withdraw.slips || withdraw.slips.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No documents uploaded yet</p>
          )}
        </div>

        {withdraw.status === 'APPROVED' && (
          <>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Withdrawn Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currencyFormat(summary.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total Expenses:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currencyFormat(summary.totalExpenses)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Difference:</span>
                  <span
                    className={`font-bold ${
                      summary.status === 'OK'
                        ? 'text-green-600 dark:text-green-400'
                        : summary.status === 'OVERSPENT'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {currencyFormat(Math.abs(summary.difference))} ({summary.status})
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses</h2>
                <button
                  onClick={handleOpenExpenseForm}
                  className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm"
                >
                  Add Expense
                </button>
              </div>
              <div className="space-y-4">
                {(withdraw.expenses || []).map((expense: any) => (
                  <Link
                    key={expense.id}
                    href={`/expenses/${expense.id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{expense.description}</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {dateFormat(expense.spentDate, 'short')}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {currencyFormat(expense.amount)}
                        </p>
                        {(expense.slips || []).length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {expense.slips.length} slip(s) attached
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {(!withdraw.expenses || withdraw.expenses.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No expenses yet</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Create Expense Drawer */}
        <Drawer isOpen={showExpenseForm} onClose={handleExpenseFormClose} title="Create New Expense">
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <CurrencyInput
                value={expenseFormData.amount}
                onChange={(value) => setExpenseFormData({ ...expenseFormData, amount: value })}
                required
                min={1}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                required
                rows={3}
                value={expenseFormData.description}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={expenseFormData.spentDate}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, spentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supporting Documents
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleExpenseFileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              {selectedFiles.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={expenseFormLoading}
                className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {expenseFormLoading ? 'Creating...' : 'Create Expense'}
              </button>
              <button
                type="button"
                onClick={handleExpenseFormClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Drawer>
      </div>
    </Layout>
  );
}

