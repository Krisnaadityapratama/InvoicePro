import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <section>
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-brand-700">InvoicePro</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Buat invoice profesional dalam hitungan menit.
          </h1>
          <p className="mt-6 max-w-2xl text-slate-600 leading-7">
            Kelola workspace, client, dan invoice dengan workflow cepat. Simpan invoice sebagai PDF, lacak status pembayaran, dan pertahankan branding yang konsisten.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/login" className="rounded-full bg-brand-700 px-6 py-3 text-white transition hover:bg-brand-800">
              Mulai Sekarang
            </Link>
            <Link href="/dashboard" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 transition hover:bg-slate-100">
              Lihat Dashboard
            </Link>
          </div>
        </section>
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-950">Rangkuman Fitur MVP</h2>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li>• Multi-workspace / multi-profile</li>
            <li>• Client management</li>
            <li>• Invoice creation + draft</li>
            <li>• Real-time preview</li>
            <li>• Export PDF</li>
            <li>• Dashboard status invoice</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
