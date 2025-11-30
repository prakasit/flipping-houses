'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { currencyFormat, dateFormat } from '@renovate-tracker/utils';

export default function DashboardPageContent() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">💰</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Projects
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.totalBudgets || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">💸</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Withdrawn
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {currencyFormat(stats?.totalWithdrawn || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📝</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Expenses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {currencyFormat(stats?.totalExpenses || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Remaining
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {currencyFormat(stats?.remaining || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Recent Projects
              </h3>
              <div className="space-y-3">
                {stats?.recentBudgets?.length > 0 ? (
                  stats.recentBudgets.map((budget: any) => (
                    <Link
                      key={budget.id}
                      href={`/projects/${budget.id}`}
                      className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{budget.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currencyFormat(budget.totalBudget)}
                          </p>
                        </div>
                        <span className="text-primary-600 dark:text-primary-400">→</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No projects yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Pending Withdraws
              </h3>
              <div className="space-y-3">
                {stats?.pendingWithdraws?.length > 0 ? (
                  stats.pendingWithdraws.map((withdraw: any) => (
                    <Link
                      key={withdraw.id}
                      href={`/withdraws/${withdraw.id}`}
                      className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{withdraw.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currencyFormat(withdraw.amount)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                          {withdraw.status}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No pending withdraws</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

