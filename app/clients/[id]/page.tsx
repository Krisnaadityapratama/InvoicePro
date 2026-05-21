'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import type { Client } from '../../../lib/types';
import type { Session } from '@supabase/supabase-js';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function loadClient() {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Client tidak ditemukan');
      } else {
        setClient(data as Client);
      }
      setLoading(false);
    }

    loadClient();
  }, [id, router]);

  if (loading) return <main className="container"><div className="card">Memuat data client...</div></main>;
  if (error || !client) {
    return (
      <main className="container">
        <div className="card">
          <h1 className="text-xl font-semibold text-red-600">Error</h1>
          <p>{error}</p>
          <Link href="/clients" className="mt-4 inline-block rounded-full bg-brand-700 px-5 py-3 text-white">
            Kembali ke Daftar Client
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-brand-700">Client</p>
          <h1 className="text-3xl font-semibold">Detail Client</h1>
        </div>
        <Link href="/clients" className="rounded-full border px-5 py-3 hover:bg-slate-100">
          Kembali ke Daftar
        </Link>
      </div>

      <div className="card max-w-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{client.name}</h2>
            {client.company && <p className="text-lg text-slate-600">{client.company}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {client.email && (
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>
            )}
            {client.phone && (
              <div>
                <p className="text-sm text-slate-500">Telepon</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            )}
            {client.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Alamat</p>
                <p className="font-medium">{client.address}</p>
              </div>
            )}
            {client.tax_id && (
              <div>
                <p className="text-sm text-slate-500">NPWP / Tax ID</p>
                <p className="font-medium">{client.tax_id}</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t flex gap-4">
            <Link
              href={`/clients/edit/${client.id}`}
              className="flex-1 text-center rounded-2xl bg-brand-700 py-3 text-white font-medium hover:bg-brand-800"
            >
              Edit Client
            </Link>
            <Link
              href="/clients"
              className="flex-1 text-center rounded-2xl border border-slate-300 py-3 font-medium hover:bg-slate-50"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}