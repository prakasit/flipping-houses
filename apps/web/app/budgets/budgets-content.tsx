'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { currencyFormat, dateFormat } from '@renovate-tracker/utils';
import { useSession } from 'next-auth/react';

export default function BudgetsPageContent() {
  const { data: session } = useSession();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    totalBudget: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budget');
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          totalBudget: parseInt(formData.totalBudget),
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ title: '', totalBudget: '', startDate: '', endDate: '' });
        fetchBudgets();
      }
    } catch (error) {
      console.error('Failed to create budget:', error);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              {showForm ? 'Cancel' : 'New Budget'}
            </button>
          )}
        </div>

        {showForm && session?.user?.role === 'ADMIN' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Budget</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Budget
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Create Budget
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const totalWithdrawn = budget.withdraws
              .filter((w: any) => w.status === 'APPROVED')
              .reduce((sum: number, w: any) => sum + w.amount, 0);
            const totalExpenses = budget.withdraws
              .filter((w: any) => w.status === 'APPROVED')
              .reduce(
                (sum: number, w: any) =>
                  sum + w.expenses.reduce((eSum: number, e: any) => eSum + e.amount, 0),
                0
              );
            const remaining = budget.totalBudget - totalExpenses;

            return (
              <Link
                key={budget.id}
                href={`/budgets/${budget.id}`}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{budget.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Budget:</span>
                    <span className="font-medium">{currencyFormat(budget.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Withdrawn:</span>
                    <span className="font-medium">{currencyFormat(totalWithdrawn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expenses:</span>
                    <span className="font-medium">{currencyFormat(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700 font-medium">Remaining:</span>
                    <span
                      className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {currencyFormat(remaining)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {budgets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No budgets yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
