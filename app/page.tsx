import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Users,
  Wallet,
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-slate-50 to-brand-50" />

      <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-brand-200 blur-3xl opacity-30" />
      <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-indigo-200 blur-3xl opacity-30" />

      <div className="container py-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT */}
          <section>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-sm font-medium text-brand-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Smart Invoice Management Platform
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
              Buat Invoice
              <span className="block bg-gradient-to-r from-brand-700 to-indigo-600 bg-clip-text text-transparent">
                Profesional & Modern
              </span>
              Dalam Hitungan Menit
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Kelola workspace, client, dan invoice dalam satu platform modern.
              Generate PDF profesional, tracking pembayaran realtime, dan
              pertahankan branding bisnis secara konsisten.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-7 py-4 font-semibold text-white shadow-lg shadow-brand-300 transition-all hover:-translate-y-1 hover:bg-brand-800"
              >
                Mulai Sekarang
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-900 transition hover:border-brand-300 hover:bg-slate-50"
              >
                Lihat Dashboard
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <p className="text-3xl font-black text-slate-950">99%</p>
                <p className="mt-1 text-sm text-slate-500">
                  Faster Invoice Workflow
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <p className="text-3xl font-black text-slate-950">PDF</p>
                <p className="mt-1 text-sm text-slate-500">
                  Professional Export
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <p className="text-3xl font-black text-slate-950">
                  Multi
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Workspace Support
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className="relative">
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-brand-500 to-indigo-600 opacity-10 blur-2xl" />

            <div className="relative rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm text-slate-500">
                    Dashboard Overview
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    InvoicePro
                  </h2>
                </div>

                <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                  Active
                </div>
              </div>

              {/* Cards */}
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
                      <Wallet className="h-6 w-6" />
                    </div>

                    <span className="text-xs font-medium text-emerald-600">
                      +12%
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Total Revenue
                  </p>

                  <h3 className="mt-1 text-3xl font-black text-slate-950">
                    Rp 24JT
                  </h3>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                      <FileText className="h-6 w-6" />
                    </div>

                    <span className="text-xs font-medium text-brand-600">
                      124
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Total Invoice
                  </p>

                  <h3 className="mt-1 text-3xl font-black text-slate-950">
                    124
                  </h3>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                      <Users className="h-6 w-6" />
                    </div>

                    <span className="text-xs font-medium text-orange-600">
                      32
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Active Clients
                  </p>

                  <h3 className="mt-1 text-3xl font-black text-slate-950">
                    32
                  </h3>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                      <LayoutDashboard className="h-6 w-6" />
                    </div>

                    <span className="text-xs font-medium text-emerald-600">
                      4 Workspace
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Workspace
                  </p>

                  <h3 className="mt-1 text-3xl font-black text-slate-950">
                    4
                  </h3>
                </div>
              </div>

              {/* Features */}
              <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
                <h3 className="text-lg font-semibold">
                  Fitur Unggulan
                </h3>

                <div className="mt-5 space-y-4">
                  {[
                    'Multi-workspace / multi-profile',
                    'Client management system',
                    'Invoice draft & tracking',
                    'Real-time invoice preview',
                    'Export PDF professional',
                    'Dashboard analytics',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}