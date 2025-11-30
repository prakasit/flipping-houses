'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { Drawer } from '@/components/Drawer';
import { CurrencyInput } from '@/components/CurrencyInput';
import { currencyFormat, dateFormat } from '@renovate-tracker/utils';
import { useSession } from 'next-auth/react';

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    totalBudget: '',
    purchasePrice: '',
    expectedSellingPrice: '',
    actualSellingPrice: '',
    bankClosingBalance: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/budget');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
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
          purchasePrice: parseInt(formData.purchasePrice),
          expectedSellingPrice: formData.expectedSellingPrice ? parseInt(formData.expectedSellingPrice) : undefined,
          actualSellingPrice: formData.actualSellingPrice ? parseInt(formData.actualSellingPrice) : undefined,
          bankClosingBalance: formData.bankClosingBalance ? parseInt(formData.bankClosingBalance) : undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ title: '', totalBudget: '', purchasePrice: '', expectedSellingPrice: '', actualSellingPrice: '', bankClosingBalance: '', startDate: '', endDate: '' });
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setFormData({ title: '', totalBudget: '', purchasePrice: '', expectedSellingPrice: '', actualSellingPrice: '', bankClosingBalance: '', startDate: '', endDate: '' });
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              New Project
            </button>
          )}
        </div>

        {session?.user?.role === 'ADMIN' && (
          <Drawer isOpen={showForm} onClose={handleClose} title="Create New Project">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Budget
                </label>
                <CurrencyInput
                  value={formData.totalBudget}
                  onChange={(value) => setFormData({ ...formData, totalBudget: value })}
                  required
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Price
                </label>
                <CurrencyInput
                  value={formData.purchasePrice}
                  onChange={(value) => setFormData({ ...formData, purchasePrice: value })}
                  required
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Selling Price
                </label>
                <CurrencyInput
                  value={formData.expectedSellingPrice}
                  onChange={(value) => setFormData({ ...formData, expectedSellingPrice: value })}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Actual Selling Price
                </label>
                <CurrencyInput
                  value={formData.actualSellingPrice}
                  onChange={(value) => setFormData({ ...formData, actualSellingPrice: value })}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Closing Balance
                </label>
                <CurrencyInput
                  value={formData.bankClosingBalance}
                  onChange={(value) => setFormData({ ...formData, bankClosingBalance: value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                >
                  Create Project
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
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const totalWithdrawn = project.withdraws
              .filter((w: any) => w.status === 'APPROVED')
              .reduce((sum: number, w: any) => sum + w.amount, 0);
            const totalExpenses = project.withdraws
              .filter((w: any) => w.status === 'APPROVED')
              .reduce(
                (sum: number, w: any) =>
                  sum + w.expenses.reduce((eSum: number, e: any) => eSum + e.amount, 0),
                0
              );
            const remaining = project.totalBudget - totalExpenses;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Budget:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{currencyFormat(project.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Withdrawn:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{currencyFormat(totalWithdrawn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Expenses:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{currencyFormat(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Remaining:</span>
                    <span
                      className={`font-bold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {currencyFormat(remaining)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

