'use client';

import Link from 'next/link';
import type { Client } from '../lib/types';

export function ClientCard({ client }: { client: Client }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow transition">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{client.name}</h3>
        {client.company && (
          <p className="text-sm text-slate-600 mt-1">{client.company}</p>
        )}
        {client.email && (
          <p className="text-sm text-slate-500 mt-1">{client.email}</p>
        )}
        {client.phone && (
          <p className="text-sm text-slate-500">{client.phone}</p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/clients/${client.id}`}
          className="flex-1 text-center rounded-2xl border border-slate-300 py-2.5 text-sm font-medium hover:bg-slate-50 transition"
        >
          Detail
        </Link>

        <Link
          href={`/clients/edit/${client.id}`}
          className="flex-1 text-center rounded-2xl bg-brand-700 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}