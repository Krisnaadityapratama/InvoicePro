'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabaseClient';
import { ensureUserProfileAndWorkspace } from '../../lib/userSetup';

type Summary = {
  workspaceCount: number;
  clientCount: number;
  invoiceCount: number;
  outstanding: number;
  paidRevenue: number;
  totalProfit: number;
  draftCount: number;
  paidCount: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const defaultSummary: Summary = {
  workspaceCount: 0,
  clientCount: 0,
  invoiceCount: 0,
  outstanding: 0,
  paidRevenue: 0,
  totalProfit: 0,
  draftCount: 0,
  paidCount: 0,
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState<Summary>(defaultSummary);

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (session) {
        await ensureUserProfileAndWorkspace(session);
        await loadDashboard(session);
      }

      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session) {
          await ensureUserProfileAndWorkspace(session);
          await loadDashboard(session);
        } else {
          setSummary(defaultSummary);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadDashboard = async (activeSession: Session) => {
    setMessage('');

    const workspaceQuery = supabase
      .from('workspaces')
      .select('id', {
        count: 'exact',
      })
      .eq('owner_id', activeSession.user.id);

    const { data: workspaceData, error: workspaceError } =
      await workspaceQuery;

    if (workspaceError) {
      setMessage('Gagal memuat workspace dashboard.');
      return;
    }

    const workspaceIds = (workspaceData ?? []).map(
      (workspace) => workspace.id
    );

    if (!workspaceIds.length) {
      setSummary(defaultSummary);
      return;
    }

    const [
      clientCountRes,
      invoiceCountRes,
      invoiceSummaryRes,
    ] = await Promise.all([
      supabase
        .from('clients')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .in('workspace_id', workspaceIds),

      supabase
        .from('invoices')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .in('workspace_id', workspaceIds),

      supabase
        .from('invoices')
        .select(
          `
            total,
            total_cost,
            total_profit,
            status
          `
        )
        .in('workspace_id', workspaceIds),
    ]);

    if (
      clientCountRes.error ||
      invoiceCountRes.error ||
      invoiceSummaryRes.error
    ) {
      setMessage('Gagal memuat statistik dashboard.');
      return;
    }

    const invoices = invoiceSummaryRes.data ?? [];

    let paidRevenue = 0;
    let totalProfit = 0;
    let outstanding = 0;
    let draftCount = 0;
    let paidCount = 0;

    for (const invoice of invoices) {
      const total = Number(invoice.total || 0);
      const totalCost = Number(invoice.total_cost || 0);
      const profit = Number(invoice.total_profit || 0);

      if (invoice.status === 'Paid') {
        paidRevenue += total;
        paidCount += 1;

        totalProfit +=
          profit > 0 ? profit : total - totalCost;
      } else {
        outstanding += total;
      }

      if (invoice.status === 'Draft') {
        draftCount += 1;
      }
    }

    setSummary({
      workspaceCount: workspaceData?.length ?? 0,
      clientCount: clientCountRes.count ?? 0,
      invoiceCount: invoiceCountRes.count ?? 0,
      outstanding,
      paidRevenue,
      totalProfit,
      draftCount,
      paidCount,
    });
  };

  if (loading) {
    return (
      <main className="container py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          Memuat dashboard...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-black">
            Dashboard
          </h1>

          <p className="mt-4 text-slate-600">
            Silakan login untuk melihat dashboard Anda.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-black px-5 py-3 text-white hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold text-black">
            Ringkasan Bisnis Anda
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/workspaces"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-black hover:bg-slate-50"
          >
            Workspace
          </Link>

          <Link
            href="/clients"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-black hover:bg-slate-50"
          >
            Client
          </Link>

          <Link
            href="/invoices"
            className="rounded-2xl bg-black px-5 py-3 text-white hover:opacity-90"
          >
            Invoice
          </Link>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Revenue
          </p>

          <h2 className="mt-3 text-3xl font-bold text-emerald-600">
            {formatCurrency(summary.paidRevenue)}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Total invoice dibayar
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Profit
          </p>

          <h2 className="mt-3 text-3xl font-bold text-green-600">
            {formatCurrency(summary.totalProfit)}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Total keuntungan
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Outstanding
          </p>

          <h2 className="mt-3 text-3xl font-bold text-orange-500">
            {formatCurrency(summary.outstanding)}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Invoice belum dibayar
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Paid Invoice
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-600">
            {summary.paidCount}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Invoice lunas
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Draft Invoice
          </p>

          <h2 className="mt-3 text-3xl font-bold text-yellow-500">
            {summary.draftCount}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Invoice draft
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Client
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {summary.clientCount}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Total client
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Invoice
          </p>

          <h2 className="mt-3 text-3xl font-bold text-indigo-600">
            {summary.invoiceCount}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Total invoice
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Workspace
          </p>

          <h2 className="mt-3 text-3xl font-bold text-violet-600">
            {summary.workspaceCount}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Workspace aktif
          </p>
        </div>
      </div>
    </main>
  );
}