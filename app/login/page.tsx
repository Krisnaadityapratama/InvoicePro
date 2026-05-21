'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabaseClient';

const loginSchema = z.object({
  email: z.string().email('Masukkan email valid'),
  password: z.string().min(6, 'Minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [status, setStatus] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setStatus('Memproses login...');
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    if (authData.session) {
      window.location.assign('/dashboard');
      return;
    }

    setStatus('Login berhasil. Jika diperlukan, silakan verifikasi email Anda.');
  };

  return (
    <main className="container">
      <div className="mx-auto max-w-xl">
        <div className="card">
          <h1 className="text-2xl font-semibold text-slate-950">Login ke InvoicePro</h1>
          <p className="mt-2 text-slate-600">Masuk untuk mengelola workspace, client, dan invoice Anda.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                {...register('email')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                {...register('password')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </label>
            <button type="submit" className="w-full rounded-full bg-brand-700 px-5 py-3 text-white transition hover:bg-brand-800">
              Login
            </button>
            {status && <p className="text-sm text-slate-600">{status}</p>}
          </form>
          <p className="mt-6 text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold text-brand-700 hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
