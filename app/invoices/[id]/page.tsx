'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { supabase } from '../../../lib/supabaseClient';
import { InvoicePdfDocument } from '../../../components/InvoicePdfDocument';
import type { Client, InvoiceItem, Workspace } from '../../../lib/types';
import type { Session } from '@supabase/supabase-js';

type InvoiceDetail = {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  currency: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  total_cost: string;
  total_profit: string;
  notes: string | null;
  client_id: string;
  workspace_id: string;
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInvoice = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setSession(session);

      try {
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (invoiceError || !invoiceData) {
          throw invoiceError || new Error('Invoice tidak ditemukan');
        }

        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', invoiceData.client_id)
          .single();

        if (clientError || !clientData) {
          throw clientError || new Error('Klien tidak ditemukan');
        }

        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', invoiceData.workspace_id)
          .single();

        if (workspaceError || !workspaceData) {
          throw workspaceError || new Error('Workspace tidak ditemukan');
        }

        const { data: itemData, error: itemError } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('position', { ascending: true });

        if (itemError) {
          throw itemError;
        }

        setInvoice(invoiceData as InvoiceDetail);
        setClient(clientData as Client);
        setWorkspace(workspaceData as Workspace);
        setItems((itemData || []) as InvoiceItem[]);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Gagal memuat detail invoice.');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, router]);

  if (loading) {
    return (
      <main className="container">
        <div className="card">Memuat detail invoice...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div className="card rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          <h1 className="text-2xl font-semibold">Invoice tidak ditemukan</h1>
          <p className="mt-4">{error}</p>
          <Link
            href="/invoices"
            className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 text-white hover:bg-brand-800"
          >
            Kembali ke daftar invoice
          </Link>
        </div>
      </main>
    );
  }

  if (!invoice || !client || !workspace) {
    return null;
  }

  return (
    <main className="container">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Detail Invoice</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Invoice #{invoice.invoice_number}</h1>
          <p className="mt-2 text-sm text-slate-600">Status: {invoice.status}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/invoices"
            className="rounded-full border border-slate-300 px-5 py-3 text-slate-900 hover:bg-slate-100"
          >
            Kembali ke Invoice
          </Link>
          <PDFDownloadLink
            document={
              <InvoicePdfDocument
                invoice={invoice}
                client={client}
                workspace={workspace}
                items={items}
              />
            }
            fileName={`invoice-${invoice.invoice_number}.pdf`}
            className="rounded-full bg-brand-700 px-5 py-3 text-white hover:bg-brand-800"
          >
            {({ loading: pdfLoading }) =>
              pdfLoading ? 'Mempersiapkan PDF...' : 'Unduh PDF'
            }
          </PDFDownloadLink>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Detail Invoice</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">Tanggal Invoice:</span> {invoice.issue_date}
            </div>
            <div>
              <span className="font-semibold text-slate-900">Due Date:</span> {invoice.due_date}
            </div>
            <div>
              <span className="font-semibold text-slate-900">Subtotal:</span> {invoice.subtotal}
            </div>
            <div>
              <span className="font-semibold text-slate-900">Total Harga Pokok:</span> 
              <span className="ml-2 text-red-600">{invoice.total_cost}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900">Pajak:</span> {invoice.tax}
            </div>
            <div>
              <span className="font-semibold text-slate-900">Diskon:</span> {invoice.discount}
            </div>
            <div>
              <span className="font-semibold text-slate-900">Total:</span> {invoice.total}
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200">
              <span className="font-semibold text-green-700">💰 Keuntungan:</span> 
              <span className="ml-2 text-lg font-bold text-green-600">{invoice.total_profit}</span>
            </div>
            {invoice.notes && (
              <div>
                <span className="font-semibold text-slate-900">Catatan:</span> {invoice.notes}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Klien</h2>
          <div className="mt-5 space-y-2 text-sm text-slate-600">
            <div className="font-semibold text-slate-900">{client.name}</div>
            {client.company && <div>{client.company}</div>}
            {client.email && <div>Email: {client.email}</div>}
            {client.phone && <div>Telp: {client.phone}</div>}
            {client.address && <div>Alamat: {client.address}</div>}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Pratinjau PDF</h2>
        <div className="mt-6 h-[900px] overflow-hidden rounded-3xl border border-slate-200">
          <PDFViewer width="100%" height="900">
            <InvoicePdfDocument
              invoice={invoice}
              client={client}
              workspace={workspace}
              items={items}
            />
          </PDFViewer>
        </div>
      </div>
    </main>
  );
}
