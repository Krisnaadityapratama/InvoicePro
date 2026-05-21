'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ensureUserProfileAndWorkspace } from '../../lib/userSetup';
import { InvoiceCard } from '../../components/InvoiceCard';
import { ClientCard } from '../../components/ClientCard';
import { WorkspaceCard } from '../../components/WorkspaceCard';
import type { Workspace, Client, Invoice } from '../../lib/types';
import type { Session } from '@supabase/supabase-js';

type Summary = {
  workspaceCount: number;
  clientCount: number;
  invoiceCount: number;
  outstanding: number;
  paidRevenue: number;
  overdueCount: number;
  draftCount: number;
  paidCount: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [summary, setSummary] = useState<Summary>({
    workspaceCount: 0,
    clientCount: 0,
    invoiceCount: 0,
    outstanding: 0,
    paidRevenue: 0,
    overdueCount: 0,
    draftCount: 0,
    paidCount: 0,
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);

      if (data.session) {
        await ensureUserProfileAndWorkspace(data.session);
        await loadData(data.session);
      }

      setLoading(false);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session) {
          await ensureUserProfileAndWorkspace(session);
          await loadData(session);
        } else {
          setWorkspaces([]);
          setClients([]);
          setInvoices([]);

          setSummary({
            workspaceCount: 0,
            clientCount: 0,
            invoiceCount: 0,
            outstanding: 0,
            paidRevenue: 0,
            overdueCount: 0,
            draftCount: 0,
            paidCount: 0,
          });
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadData = async (activeSession: Session) => {
    const workspaceRes = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', activeSession.user.id)
      .order('created_at', { ascending: false });

    const workspaceIds = (workspaceRes.data ?? []).map(
      (workspace) => workspace.id
    );

    const [clientRes, invoiceRes, outstandingRes] =
      await Promise.all([
        workspaceIds.length
          ? supabase
              .from('clients')
              .select('*')
              .in('workspace_id', workspaceIds)
              .order('created_at', { ascending: false })
              .limit(5)
          : { data: [], error: null },

        workspaceIds.length
          ? supabase
              .from('invoices')
              .select(
                `
                id,
                invoice_number,
                client_id,
                total,
                status,
                issue_date,
                due_date
              `
              )
              .in('workspace_id', workspaceIds)
              .order('created_at', { ascending: false })
          : { data: [], error: null },

        workspaceIds.length
          ? supabase
              .from('invoices')
              .select('total')
              .neq('status', 'Paid')
              .in('workspace_id', workspaceIds)
          : { data: [], error: null },
      ]);

    if (
      workspaceRes.error ||
      clientRes.error ||
      invoiceRes.error ||
      outstandingRes.error
    ) {
      setMessage(
        'Gagal memuat data. Pastikan session Supabase dan policy RLS sudah benar.'
      );

      return;
    }

    const clientMap = (
      clientRes.data ?? []
    ).reduce<Record<string, Client>>((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {});

    setWorkspaces(workspaceRes.data ?? []);
    setClients(clientRes.data ?? []);

    setInvoices(
      (invoiceRes.data ?? []).slice(0, 5).map((invoice) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id,
        client:
          clientMap[invoice.client_id]?.name ??
          'Client tidak ditemukan',
        total: formatCurrency(Number(invoice.total)),
        status: invoice.status,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
      }))
    );

    const allInvoices = invoiceRes.data ?? [];

    const paidRevenue = allInvoices
      .filter((invoice) => invoice.status === 'Paid')
      .reduce(
        (sum, invoice) => sum + Number(invoice.total),
        0
      );

    const overdueCount = allInvoices.filter((invoice) => {
      return (
        invoice.status !== 'Paid' &&
        new Date(invoice.due_date) < new Date()
      );
    }).length;

    const draftCount = allInvoices.filter(
      (invoice) => invoice.status === 'Draft'
    ).length;

    const paidCount = allInvoices.filter(
      (invoice) => invoice.status === 'Paid'
    ).length;

    setSummary({
      workspaceCount: workspaceRes.data?.length ?? 0,
      clientCount: clientRes.data?.length ?? 0,
      invoiceCount: invoiceRes.data?.length ?? 0,

      outstanding: (
        outstandingRes.data ?? []
      ).reduce(
        (sum, row) => sum + Number(row.total),
        0
      ),

      paidRevenue,
      overdueCount,
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

      {/* KPI Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Revenue
          </p>

          <h2 className="mt-3 text-3xl font-bold text-emerald-600">
            {formatCurrency(summary.paidRevenue)}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Total invoice yang sudah dibayar
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
            Invoice telah lunas
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Overdue Invoice
          </p>

          <h2 className="mt-3 text-3xl font-bold text-red-600">
            {summary.overdueCount}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Invoice melewati jatuh tempo
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Client
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {summary.clientCount}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Client terdaftar
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Invoice
          </p>

          <h2 className="mt-3 text-3xl font-bold text-indigo-600">
            {summary.invoiceCount}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Invoice keseluruhan
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
            Invoice masih draft
          </p>
        </div>
      </div>

      {/* Content */}

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-black">
            Workspace Aktif
          </h3>

          <div className="mt-4 space-y-4">
            {workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Belum ada workspace.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-black">
            Client Terbaru
          </h3>

          <div className="mt-4 space-y-4">
            {clients.length > 0 ? (
              clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Belum ada client.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-black">
            Invoice Terbaru
          </h3>

          <div className="mt-4 space-y-4">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Belum ada invoice.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}