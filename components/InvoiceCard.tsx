'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Invoice } from '../lib/types';

type InvoiceCardProps = {
  invoice: Invoice;
  onStatusChange?: (id: string, newStatus: string) => void;
  onDelete?: (id: string) => void;
};

export function InvoiceCard({
  invoice,
  onStatusChange,
  onDelete,
}: InvoiceCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (
    newStatus: 'Draft' | 'Sent' | 'Paid'
  ) => {
    setIsUpdating(true);

    const { error } = await supabase
      .from('invoices')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id);

    if (error) {
      alert('Gagal update status: ' + error.message);
    } else {
      onStatusChange?.(invoice.id, newStatus);

      if (newStatus === 'Sent') {
        alert('Invoice berhasil dikirim');
      }

      if (newStatus === 'Paid') {
        alert('Invoice berhasil ditandai lunas');
      }
    }

    setIsUpdating(false);
  };

  const handleSendInvoice = async () => {
    if (!confirm('Kirim invoice ini?')) return;

    await updateStatus('Sent');
  };

  const handleMarkAsPaid = async () => {
    if (!confirm('Tandai invoice ini sebagai lunas?')) return;

    await updateStatus('Paid');
  };

  const handleDelete = async () => {
    if (!confirm('Hapus invoice ini?')) return;

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoice.id);

    if (error) {
      alert('Gagal menghapus invoice');
    } else {
      onDelete?.(invoice.id);
    }
  };

  const statusColor = {
    Draft: 'bg-yellow-100 text-yellow-700',
    Sent: 'bg-blue-100 text-blue-700',
    Paid: 'bg-emerald-100 text-emerald-700',
    Overdue: 'bg-red-100 text-red-700',
    Cancelled: 'bg-slate-100 text-slate-500',
  }[invoice.status] || 'bg-slate-100 text-slate-700';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            {invoice.invoice_number}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Klien: {invoice.client}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {invoice.issue_date} • Due: {invoice.due_date}
          </p>
        </div>

        <div
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
        >
          {invoice.status}
        </div>
      </div>

      {/* Total */}

      <div className="mt-5">
        <p className="text-3xl font-bold text-slate-950">
          {invoice.total}
        </p>
      </div>

      {/* Actions */}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href={`/invoices/${invoice.id}`}
          className="rounded-2xl border border-slate-300 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Detail / PDF
        </Link>

        <Link
          href={`/invoices/edit/${invoice.id}`}
          className="rounded-2xl border border-slate-300 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Edit
        </Link>

        {/* Draft → Sent */}

        {invoice.status === 'Draft' && (
          <button
            onClick={handleSendInvoice}
            disabled={isUpdating}
            className="col-span-2 rounded-2xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
          >
            {isUpdating
              ? 'Memproses...'
              : '📤 Send Invoice'}
          </button>
        )}

        {/* Sent → Paid */}

        {invoice.status === 'Sent' && (
          <button
            onClick={handleMarkAsPaid}
            disabled={isUpdating}
            className="col-span-2 rounded-2xl bg-emerald-600 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-70"
          >
            {isUpdating
              ? 'Memproses...'
              : 'Tandai Lunas'}
          </button>
        )}

        {/* Paid */}

        {invoice.status === 'Paid' && (
          <div className="col-span-2 rounded-2xl bg-emerald-50 py-3 text-center text-sm font-semibold text-emerald-700">
            ✓ Invoice Sudah Dibayar
          </div>
        )}

        {/* Delete */}

        <button
          onClick={handleDelete}
          className="col-span-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          Hapus Invoice
        </button>
      </div>
    </div>
  );
}