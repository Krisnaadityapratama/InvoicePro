'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../../lib/supabaseClient';   // ← Path sudah diperbaiki
import type { Session } from '@supabase/supabase-js';
import type { Workspace } from '../../../../lib/types';

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

export default function EditWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
  });

  useEffect(() => {
    async function loadData() {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .eq('owner_id', sessionData.session.user.id)
        .single();

      if (error || !data) {
        setError('Workspace tidak ditemukan atau Anda tidak punya akses.');
        setLoading(false);
        return;
      }

      setValue('name', data.name);
      setValue('description', data.description || '');
      setValue('address', data.address || '');
      setValue('email', data.email || '');
      setValue('phone', data.phone || '');
      setValue('prefix', data.prefix);
      setValue('currency', data.currency);
      setValue('bank_name', data.bank_name || '');
      setValue('bank_account', data.bank_account || '');
      setValue('bank_account_name', data.bank_account_name || '');
      setValue('bank_swift', data.bank_swift || '');
      setValue('signer_name', data.signer_name || '');

      setLoading(false);
    }

    loadData();
  }, [id, router, setValue]);

  const onSubmit = async (values: WorkspaceFormValues) => {
    if (!session) return;
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('workspaces')
      .update({
        name: values.name,
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
    } else {
      alert('✅ Workspace berhasil diperbarui!');
      router.push('/workspaces');
    }
    setSaving(false);
  };

  if (loading) {
    return <main className="container"><div className="card">Memuat data workspace...</div></main>;
  }

  if (error) {
    return (
      <main className="container">
        <div className="card">
          <h1 className="text-xl font-semibold text-red-600">Error</h1>
          <p className="mt-2">{error}</p>
          <Link href="/workspaces" className="mt-6 inline-block rounded-full bg-brand-700 px-5 py-3 text-white">
            Kembali ke Workspace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-brand-700">Workspace</p>
          <h1 className="text-3xl font-semibold">Edit Workspace</h1>
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
              <input {...register('name')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Prefix Invoice</span>
              <input {...register('prefix')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Alamat Lengkap</span>
            <textarea {...register('address')} rows={3} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
          </label>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email Bisnis</span>
              <input type="email" {...register('email')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">No. Telepon</span>
              <input {...register('phone')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Deskripsi Singkat</span>
            <textarea {...register('description')} rows={2} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
          </label>

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
                <span className="text-sm font-medium text-slate-700">Swift Code</span>
                <input {...register('bank_swift')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
              </label>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nama Penandatangan</span>
            <input {...register('signer_name')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
          </label>

          <div className="flex gap-4 pt-4">
            <Link href="/workspaces" className="flex-1 text-center rounded-full border border-slate-300 py-3.5 font-medium hover:bg-slate-50">
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 rounded-full bg-brand-700 py-3.5 text-white font-semibold hover:bg-brand-800 disabled:opacity-70"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

          {error && <p className="text-red-600 text-center">{error}</p>}
        </form>
      </div>
    </main>
  );
}