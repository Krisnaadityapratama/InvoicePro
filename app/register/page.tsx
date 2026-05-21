'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabaseClient';

const registerSchema = z.object({
  email: z.string().email('Masukkan email valid'),
  password: z.string().min(6, 'Minimal 6 karakter'),
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [status, setStatus] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    setStatus('Memproses pendaftaran...');

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    const userId = signUpData.user?.id;
    if (userId && signUpData.session) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        full_name: data.fullName,
      });

      if (profileError) {
        setStatus('Pendaftaran berhasil, tetapi profile belum dibuat: ' + profileError.message);
        return;
      }
    }

    if (signUpData.session) {
      window.location.assign('/dashboard');
      return;
    }

    setStatus('Daftar berhasil. Silakan cek email konfirmasi Anda.');
  };

  return (
    <main className="container">
      <div className="mx-auto max-w-xl">
        <div className="card">
          <h1 className="text-2xl font-semibold text-slate-950">Daftar InvoicePro</h1>
          <p className="mt-2 text-slate-600">Buat akun untuk mulai mengelola invoice dan workspace Anda.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nama Lengkap</span>
              <input
                type="text"
                {...register('fullName')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-brand-700 focus:outline-none"
              />
              {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>}
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
              Daftar
            </button>
            {status && <p className="text-sm text-slate-600">{status}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}
