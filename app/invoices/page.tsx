'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { InvoiceCard } from '../../components/InvoiceCard';
import type { Invoice } from '../../lib/types';
import type { Session } from '@supabase/supabase-js';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export default function InvoicesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvoices = async (userId: string) => {
    try {
      // Ambil workspace milik user
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId);

      const workspaceIds = workspaces?.map(w => w.id) || [];

      if (workspaceIds.length === 0) {
        setInvoices([]);
        return;
      }

      // Query utama dengan join client
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total,
          total_cost,
          total_profit,
          profit_margin,
          status,
          issue_date,
          due_date,
          client_id,
          clients!inner(name)
        `)
        .in('workspace_id', workspaceIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedInvoices: Invoice[] = (data || []).map((inv: any) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        client_id: inv.client_id,
        client: inv.clients?.name || 'Client tidak ditemukan',
        total: formatCurrency(Number(inv.total || 0)),
        total_cost: formatCurrency(Number(inv.total_cost || 0)),
        total_profit: formatCurrency(Number(inv.total_profit || 0)),
        profit_margin: Number(inv.profit_margin || 0),
        status: inv.status,
        issue_date: inv.issue_date,
        due_date: inv.due_date,
      }));

      setInvoices(formattedInvoices);
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat daftar invoice. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        await fetchInvoices(data.session.user.id);
      } else {
        setLoading(false);
      }
    }

    load();

    // Auto refresh jika session berubah
    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      if (session) {
        setLoading(true);
        await fetchInvoices(session.user.id);
      } else {
        setInvoices([]);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setInvoices(prev =>
      prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv)
    );
  };

  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  if (loading) {
    return (
      <main className="container">
        <div className="card">Memuat daftar invoice...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container">
        <div className="card">
          <h1 className="text-2xl font-semibold text-slate-950">Invoice</h1>
          <p className="mt-4 text-slate-600">Silakan login untuk melihat dan mengelola invoice Anda.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 text-white hover:bg-brand-800">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Invoice</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Daftar Invoice</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* <Link 
            href="/dashboard" 
            className="rounded-full border border-slate-300 px-5 py-3 text-slate-900 hover:bg-slate-100"
          >
            Dashboard
          </Link> */}
          <Link 
            href="/invoices/new" 
            className="rounded-full bg-brand-700 px-5 py-3 text-white hover:bg-brand-800"
          >
            + Buat Invoice Baru
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl bg-red-50 p-4 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="card col-span-2 py-20 text-center">
            <p className="text-xl text-slate-500">Belum ada invoice</p>
            <p className="text-slate-400 mt-2">Mulai buat invoice profesional pertama Anda</p>
            <Link 
              href="/invoices/new" 
              className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-3 text-white hover:bg-brand-800"
            >
              Buat Invoice Pertama
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}