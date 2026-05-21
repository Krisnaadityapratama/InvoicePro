'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { WorkspaceCard } from '../../components/WorkspaceCard';
import type { Workspace } from '../../lib/types';
import type { Session } from '@supabase/supabase-js';

export default function WorkspacesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorkspaces = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        console.error('Error fetching workspaces:', error);
      } else {
        setWorkspaces(data ?? []);
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat memuat data workspace');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        await fetchWorkspaces(data.session.user.id);
      } else {
        setLoading(false);
      }
    }

    loadData();

    // Listen perubahan auth
    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      if (session) {
        setLoading(true);
        await fetchWorkspaces(session.user.id);
      } else {
        setWorkspaces([]);
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleDelete = (id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
  };

  if (loading) {
    return (
      <main className="container">
        <div className="card">Memuat daftar workspace...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container">
        <div className="card">
          <h1 className="text-2xl font-semibold">Akses Ditolak</h1>
          <p className="mt-4 text-slate-600">Silakan login untuk mengelola workspace Anda.</p>
          <Link 
            href="/login" 
            className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 text-white hover:bg-brand-800"
          >
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
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Kelola Workspace Anda</h1>
        </div>
        <Link 
          href="/workspaces/new" 
          className="rounded-full bg-brand-700 px-5 py-3 text-white hover:bg-brand-800 transition"
        >
          + Buat Workspace Baru
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl bg-red-50 p-4 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {workspaces.length > 0 ? (
          workspaces.map((workspace) => (
            <WorkspaceCard 
              key={workspace.id} 
              workspace={workspace} 
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="card col-span-2 py-16 text-center">
            <p className="text-slate-500 text-lg">Belum ada workspace</p>
            <p className="text-slate-400 mt-2">Buat workspace pertama Anda untuk mulai menggunakan InvoicePro</p>
          </div>
        )}
      </div>
    </main>
  );
}