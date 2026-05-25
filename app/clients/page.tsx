'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { ClientCard } from '../../components/ClientCard';
import type { Client } from '../../lib/types';
import type { Session } from '@supabase/supabase-js';

export default function ClientsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (!data.session) {
        setLoading(false);
        return;
      }

      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', data.session.user.id);

      if (workspaceError) {
        setError(workspaceError.message);
        setLoading(false);
        return;
      }

      const workspaceIds = (workspaceData ?? []).map((workspace) => workspace.id);
      if (workspaceIds.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .in('workspace_id', workspaceIds)
        .order('created_at', { ascending: false });

      if (clientError) {
        setError(clientError.message);
      } else {
        setClients(clientData ?? []);
      }
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="container">
        <div className="card">Memuat client...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container">
        <div className="card">
          <h1 className="text-2xl font-semibold text-slate-950">Client</h1>
          <p className="mt-4 text-slate-600">Silakan login untuk melihat dan mengelola client Anda.</p>
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
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Client</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Kelola Client Anda</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 text-slate-900 hover:bg-slate-100">
            Kembali ke Dashboard
          </Link> */}
          <Link href="/clients/new" className="rounded-full bg-brand-700 px-5 py-3 text-white hover:bg-brand-800">
            Tambah Client
          </Link>
        </div>
      </div>
      {error && <div className="mb-6 rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="grid gap-6 md:grid-cols-2">
        {clients.length > 0 ? (
          clients.map((client) => <ClientCard key={client.id} client={client} />)
        ) : (
          <div className="card text-slate-600">Belum ada client terdaftar.</div>
        )}
      </div>
    </main>
  );
}
