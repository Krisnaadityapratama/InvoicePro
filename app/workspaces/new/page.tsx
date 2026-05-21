'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Nama workspace minimal 2 karakter'),
  description: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
  prefix: z.string().min(1, 'Prefix invoice wajib diisi'),
  currency: z.string().min(1),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  bank_account_name: z.string().optional(),
  bank_swift: z.string().optional(),
  signer_name: z.string().optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

export default function NewWorkspacePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      currency: 'IDR',
      prefix: 'INV',
    },
  });

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    }
    loadSession();
  }, []);

  const onSubmit = async (values: WorkspaceFormValues) => {
    if (!session) return;
    setStatus('Menyimpan workspace...');
    setError('');

    const { error: insertError } = await supabase.from('workspaces').insert({
      owner_id: session.user.id,
      name: values.name,
      slug: values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: values.description,
      address: values.address,
      email: values.email,
      phone: values.phone,
      prefix: values.prefix.toUpperCase(),
      currency: values.currency,
      bank_name: values.bank_name,
      bank_account: values.bank_account,
      bank_account_name: values.bank_account_name,
      bank_swift: values.bank_swift,
      signer_name: values.signer_name,
    });

    if (insertError) {
      setError(insertError.message);
      setStatus('');
      return;
    }

    setStatus('Workspace berhasil dibuat!');
    setTimeout(() => window.location.href = '/workspaces', 1500);
  };

  if (loading) return <div className="container"><div className="card">Memuat...</div></div>;

  return (
    <main className="container">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-brand-700">Workspace</p>
          <h1 className="text-3xl font-semibold">Buat Workspace Baru</h1>
        </div>
        <Link href="/workspaces" className="rounded-full border px-5 py-3 hover:bg-slate-100">
          Kembali
        </Link>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nama Workspace / Perusahaan</span>
              <input 
                {...register('name')} 
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
                placeholder="contoh: PT Krisna Digital"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Prefix Invoice</span>
              <input 
                {...register('prefix')} 
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
                placeholder="PRJ / KR / INV"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Alamat Lengkap</span>
            <textarea 
              {...register('address')} 
              rows={3} 
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
            />
          </label>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email Bisnis</span>
              <input 
                type="email" 
                {...register('email')} 
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">No. Telepon</span>
              <input 
                {...register('phone')} 
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Deskripsi Singkat</span>
            <textarea 
              {...register('description')} 
              rows={2} 
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
            />
          </label>

          {/* Informasi Bank */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-semibold mb-4 text-slate-800">Informasi Bank</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nama Bank</span>
                <input {...register('bank_name')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">No. Rekening</span>
                <input {...register('bank_account')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Atas Nama</span>
                <input {...register('bank_account_name')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Swift Code (opsional)</span>
                <input {...register('bank_swift')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
              </label>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nama Penandatangan</span>
            <input 
              {...register('signer_name')} 
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
              placeholder="contoh: Krisna Aditya Pratama"
            />
          </label>

          <button 
            type="submit" 
            className="w-full rounded-full bg-brand-700 py-3.5 text-white font-semibold hover:bg-brand-800 transition"
          >
            Simpan Workspace
          </button>

          {status && <p className="text-green-600 font-medium">{status}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </form>
      </div>
    </main>
  );
}