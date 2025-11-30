'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { Drawer } from '@/components/Drawer';
import { CurrencyInput } from '@/components/CurrencyInput';
import { currencyFormat, dateFormat } from '@renovate-tracker/utils';
import { useSession } from 'next-auth/react';

function WithdrawsPageContent() {
  const { data: session } = useSession();
  const [withdraws, setWithdraws] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    loanBudgetId: '',
    amount: '',
    description: '',
    requiresExpense: true,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchWithdraws();
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoadingBudgets(true);
      const res = await fetch('/api/budget');
      if (res.ok) {
        const data = await res.json();
        setBudgets(Array.isArray(data) ? data : []);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch budgets:', res.status, errorData);
        setBudgets([]);
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setBudgets([]);
    } finally {
      setLoadingBudgets(false);
    }
  };

  const fetchWithdraws = async () => {
    try {
      const res = await fetch('/api/withdraw');
      if (res.ok) {
        const data = await res.json();
        setWithdraws(data);
      }
    } catch (error) {
      console.error('Failed to fetch withdraws:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitFormData = new FormData();
      submitFormData.append('loanBudgetId', formData.loanBudgetId);
      submitFormData.append('amount', formData.amount);
      submitFormData.append('description', formData.description);
      submitFormData.append('requiresExpense', formData.requiresExpense.toString());
      
      // Append files
      selectedFiles.forEach((file) => {
        submitFormData.append('files', file);
      });

      const res = await fetch('/api/withdraw', {
        method: 'POST',
        body: submitFormData,
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ loanBudgetId: '', amount: '', description: '', requiresExpense: true });
        setSelectedFiles([]);
        fetchWithdraws();
      }
    } catch (error) {
      console.error('Failed to create withdraw:', error);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setFormData({ loanBudgetId: '', amount: '', description: '', requiresExpense: true });
    setSelectedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleOpenForm = () => {
    setShowForm(true);
    // Refresh budgets when opening the form
    fetchBudgets();
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Withdraw Requests</h1>
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={handleOpenForm}
              className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              New Request
            </button>
          )}
        </div>

        <Drawer isOpen={showForm} onClose={handleClose} title="Create Withdraw Request">
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project
                </label>
                <select
                  required
                  value={formData.loanBudgetId}
                  onChange={(e) => setFormData({ ...formData, loanBudgetId: e.target.value })}
                  disabled={loadingBudgets}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingBudgets ? 'Loading projects...' : 'Select a project'}
                  </option>
                  {!loadingBudgets && budgets.length === 0 && (
                    <option value="" disabled>No projects available</option>
                  )}
                  {!loadingBudgets && budgets.length > 0 && budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <CurrencyInput
                  value={formData.amount}
                  onChange={(value) => setFormData({ ...formData, amount: value })}
                  required
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresExpense"
                  checked={formData.requiresExpense}
                  onChange={(e) => setFormData({ ...formData, requiresExpense: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresExpense" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Requires Expense Tracking
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Supporting Documents
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileChange}
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
                  className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                >
                  Create Request
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Drawer>

        <div className="space-y-4">
          {withdraws.map((withdraw) => (
            <Link
              key={withdraw.id}
              href={`/withdraws/${withdraw.id}`}
              className="block bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {withdraw.description}
                    </h3>
                    {!withdraw.requiresExpense && (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        No Expense Required
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{withdraw.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Amount: {currencyFormat(withdraw.amount)}</span>
                    <span>Project: {withdraw.loanBudget.title}</span>
                    <span>Requested: {dateFormat(withdraw.requestedAt, 'short')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {withdraws.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No withdraw requests yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function WithdrawsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return <WithdrawsPageContent />;
}

