'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

const clientSchema = z.object({
  name: z.string().min(2, 'Nama client minimal 2 karakter'),
  company: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_id: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function EditClientPage() {
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
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
  });

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
        setLoading(false);
        return;
      }

      setValue('name', data.name);
      setValue('company', data.company || '');
      setValue('email', data.email || '');
      setValue('phone', data.phone || '');
      setValue('address', data.address || '');
      setValue('tax_id', data.tax_id || '');

      setLoading(false);
    }

    loadClient();
  }, [id, router, setValue]);

  const onSubmit = async (values: ClientFormValues) => {
    if (!session) return;
    setSaving(true);

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        name: values.name,
        company: values.company,
        email: values.email,
        phone: values.phone,
        address: values.address,
        tax_id: values.tax_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
    } else {
      alert('✅ Client berhasil diperbarui!');
      router.push('/clients');
    }
    setSaving(false);
  };

  if (loading) return <main className="container"><div className="card">Memuat...</div></main>;

  return (
    <main className="container">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-brand-700">Client</p>
          <h1 className="text-3xl font-semibold">Edit Client</h1>
        </div>
        <Link href="/clients" className="rounded-full border px-5 py-3 hover:bg-slate-100">
          Kembali
        </Link>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nama Client</span>
            <input {...register('name')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Perusahaan</span>
            <input {...register('company')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
          </label>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input type="email" {...register('email')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">No. Telepon</span>
              <input {...register('phone')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Alamat</span>
            <textarea {...register('address')} rows={3} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Tax ID / NPWP</span>
            <input {...register('tax_id')} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" />
          </label>

          <div className="flex gap-4 pt-4">
            <Link href="/clients" className="flex-1 text-center rounded-full border border-slate-300 py-3.5 font-medium hover:bg-slate-50">
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