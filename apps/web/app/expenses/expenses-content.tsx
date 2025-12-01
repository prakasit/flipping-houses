'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Drawer } from '@/components/Drawer';
import { CurrencyInput } from '@/components/CurrencyInput';
import { currencyFormat, dateFormat } from '@renovate-tracker/utils';

export default function ExpensesPageContent() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [withdraws, setWithdraws] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    withdrawId: '',
    amount: '',
    description: '',
    spentDate: new Date().toISOString().split('T')[0],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchExpenses();
    fetchWithdraws();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expense');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdraws = async () => {
    try {
      const res = await fetch('/api/withdraw');
      if (res.ok) {
        const data = await res.json();
        // Filter: only APPROVED withdraws that require expense tracking
        const approved = data.filter((w: any) => w.status === 'APPROVED' && w.requiresExpense === true);
        setWithdraws(approved);
      }
    } catch (error) {
      console.error('Failed to fetch withdraws:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('withdrawId', formData.withdrawId);
      submitFormData.append('amount', formData.amount);
      submitFormData.append('description', formData.description);
      submitFormData.append('spentDate', new Date(formData.spentDate).toISOString());
      
      // Append files
      selectedFiles.forEach((file) => {
        submitFormData.append('files', file);
      });

      const res = await fetch('/api/expense', {
        method: 'POST',
        body: submitFormData,
      });

      if (res.ok) {
        const expense = await res.json();
        setShowForm(false);
        setFormData({
          withdrawId: '',
          amount: '',
          description: '',
          spentDate: new Date().toISOString().split('T')[0],
        });
        setSelectedFiles([]);
        fetchExpenses();
        router.push(`/expenses/${expense.id}`);
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setFormData({
      withdrawId: '',
      amount: '',
      description: '',
      spentDate: new Date().toISOString().split('T')[0],
    });
    setSelectedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
          >
            New Expense
          </button>
        </div>

        <Drawer isOpen={showForm} onClose={handleClose} title="Create New Expense">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Withdraw Request
              </label>
              <select
                required
                value={formData.withdrawId}
                onChange={(e) => setFormData({ ...formData, withdrawId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a withdraw request</option>
                {withdraws.map((withdraw) => (
                  <option key={withdraw.id} value={withdraw.id}>
                    {withdraw.description} - {withdraw.loanBudget.title} ({currencyFormat(withdraw.amount)})
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                value={formData.spentDate}
                onChange={(e) => setFormData({ ...formData, spentDate: e.target.value })}
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
                disabled={formLoading}
                className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {formLoading ? 'Creating...' : 'Create Expense'}
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
          {expenses.map((expense) => (
            <Link
              key={expense.id}
              href={`/expenses/${expense.id}`}
              className="block bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {expense.description}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {expense.withdraw.description} - {expense.withdraw.loanBudget.title}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Amount: {currencyFormat(expense.amount)}</span>
                    <span>Date: {dateFormat(expense.spentDate, 'short')}</span>
                    {expense.slips.length > 0 && (
                      <span>{expense.slips.length} slip(s)</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No expenses yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
