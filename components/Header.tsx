'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export function Header() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    }

    loadSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (data?.subscription?.unsubscribe) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-950">
          InvoicePro
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">
            Dashboard
          </Link>
          {session ? (
            <>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                {session.user.email}
              </span>
              <button onClick={handleSignOut} className="rounded-full bg-brand-700 px-4 py-2 text-sm text-white hover:bg-brand-800">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 hover:bg-slate-100">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-brand-700 px-4 py-2 text-sm text-white hover:bg-brand-800">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
