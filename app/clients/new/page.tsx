'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

const clientSchema = z.object({
  workspace_id: z.string().min(1, 'Pilih workspace terlebih dahulu'),
  name: z.string().min(2, 'Nama client minimal 2 karakter'),
  email: z.string().email('Email tidak valid').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  tax_id: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

type WorkspaceOption = {
  id: string;
  name: string;
};

export default function NewClientPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({ resolver: zodResolver(clientSchema) });

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
        .select('id, name')
        .eq('owner_id', data.session.user.id)
        .order('created_at', { ascending: false });

      if (workspaceError) {
        setError(workspaceError.message);
      } else {
        const workspaces = workspaceData ?? [];
        setWorkspaces(workspaces);
        if (workspaces[0]) {
          setValue('workspace_id', workspaces[0].id);
        }
      }

      setLoading(false);
    }
    load();
  }, [setValue]);

  const onSubmit = async (values: ClientFormValues) => {
    if (!session) return;
    setStatus('Menyimpan client...');
    setError('');

    const { error } = await supabase.from('clients').insert({
      workspace_id: values.workspace_id,
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company,
      address: values.address,
      tax_id: values.tax_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setError(error.message);
      setStatus('');
      return;
    }

    setStatus('Client berhasil ditambahkan.');
  };

  if (loading) {
    return (
      <main className="container">
        <div className="card">Memeriksa sesi...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container">
        <div className="card">
          <h1 className="text-2xl font-semibold text-slate-950">Akses ditolak</h1>
          <p className="mt-4 text-slate-600">Silakan login untuk menambahkan client.</p>
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
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Tambah Client Baru</h1>
        </div>
        <Link href="/clients" className="rounded-full border border-slate-300 px-5 py-3 text-slate-900 hover:bg-slate-100">
          Kembali ke Client
        </Link>
      </div>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Workspace</span>
            <select
              {...register('workspace_id')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
            >
              <option value="">Pilih workspace</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            {errors.workspace_id && <p className="mt-2 text-sm text-red-600">{errors.workspace_id.message}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nama Client</span>
            <input
              type="text"
              {...register('name')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              {...register('email')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </label>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Perusahaan</span>
              <input
                type="text"
                {...register('company')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Telepon</span>
              <input
                type="text"
                {...register('phone')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Alamat</span>
            <textarea
              {...register('address')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
              rows={4}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Tax ID / NPWP</span>
            <input
              type="text"
              {...register('tax_id')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
            />
          </label>
          <button type="submit" className="rounded-full bg-brand-700 px-6 py-3 text-white hover:bg-brand-800">
            Simpan Client
          </button>
          {status && <p className="text-sm text-slate-600">{status}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </main>
  );
}
