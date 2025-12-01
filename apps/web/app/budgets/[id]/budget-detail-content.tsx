'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { currencyFormat, dateFormat, calculateWithdrawSummary } from '@renovate-tracker/utils';
import Link from 'next/link';

export default function BudgetDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const [budget, setBudget] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBudget();
      fetchSummary();
    }
  }, [params.id]);

  const fetchBudget = async () => {
    try {
      const res = await fetch(`/api/budget`);
      if (res.ok) {
        const budgets = await res.json();
        const found = budgets.find((b: any) => b.id === params.id);
        setBudget(found);
      }
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`/api/budget/${params.id}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
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

  if (!budget) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Budget not found</p>
          <Link href="/budgets" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to Budgets
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
              href="/budgets"
              className="text-primary-600 hover:underline text-sm mb-2 inline-block"
            >
              ← Back to Budgets
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{budget.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {budget.startDate && dateFormat(budget.startDate, 'short')} -{' '}
              {budget.endDate && dateFormat(budget.endDate, 'short')}
            </p>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {currencyFormat(summary.totalBudget)}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Withdrawn</p>
              <p className="text-2xl font-bold text-gray-900">
                {currencyFormat(summary.totalWithdrawn)}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {currencyFormat(summary.totalExpenses)}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Remaining</p>
              <p
                className={`text-2xl font-bold ${
                  summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {currencyFormat(summary.remaining)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Withdraw Requests</h2>
            <div className="space-y-4">
              {budget.withdraws.map((withdraw: any) => {
                const withdrawSummary = calculateWithdrawSummary(withdraw);
                return (
                  <Link
                    key={withdraw.id}
                    href={`/withdraws/${withdraw.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{withdraw.description}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              withdraw.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : withdraw.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {withdraw.status}
                          </span>
                          {withdraw.status === 'APPROVED' && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                withdrawSummary.status === 'OK'
                                  ? 'bg-green-100 text-green-800'
                                  : withdrawSummary.status === 'OVERSPENT'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {withdrawSummary.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{withdraw.description}</p>
                        <div className="mt-2 flex gap-4 text-sm text-gray-500">
                          <span>Amount: {currencyFormat(withdraw.amount)}</span>
                          {withdraw.status === 'APPROVED' && (
                            <>
                              <span>Expenses: {currencyFormat(withdrawSummary.totalExpenses)}</span>
                              <span
                                className={
                                  withdrawSummary.difference >= 0 ? 'text-blue-600' : 'text-red-600'
                                }
                              >
                                Difference: {currencyFormat(Math.abs(withdrawSummary.difference))}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {budget.withdraws.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No withdraw requests yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
