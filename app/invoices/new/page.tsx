'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

const invoiceSchema = z.object({
  workspace_id: z.string().min(1, 'Pilih workspace terlebih dahulu'),
  client_id: z.string().min(1, 'Pilih client terlebih dahulu'),
  issue_date: z.string().min(1, 'Tanggal invoice diperlukan'),
  due_date: z.string().min(1, 'Due date diperlukan'),
  currency: z.enum(['IDR', 'USD', 'SGD', 'MYR']).default('IDR'),
  status: z.enum(['Draft', 'Sent']).default('Draft'),
  tax_rate: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Deskripsi item diperlukan'),
      quantity: z.number().min(1, 'Qty minimal 1'),
      unit_price: z.number().min(0, 'Harga satuan tidak boleh negatif'),
      cost_price: z.number().min(0, 'Harga pokok tidak boleh negatif').default(0),
    })
  ).min(1, 'Minimal satu baris item diperlukan'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

type WorkspaceOption = {
  id: string;
  name: string;
  prefix: string;
  currency: string;
};

const currencyOptions = [
  { label: 'IDR', value: 'IDR' },
  { label: 'USD', value: 'USD' },
  { label: 'SGD', value: 'SGD' },
  { label: 'MYR', value: 'MYR' },
] as const;

const defaultItem = { description: '', quantity: 1, unit_price: 0, cost_price: 0 };

export default function NewInvoicePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      workspace_id: '',
      client_id: '',
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      currency: 'IDR',
      status: 'Draft',
      tax_rate: 0,
      discount: 0,
      notes: '',
      items: [defaultItem],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedValues = useWatch({ control, name: ['items', 'tax_rate', 'discount', 'currency', 'workspace_id'] });

  const items = watchedValues[0] || [];
  const tax_rate = Number(watchedValues[1]) || 0;
  const discount = Number(watchedValues[2]) || 0;
  const currency = watchedValues[3] || 'IDR';
  const selectedWorkspaceId = watchedValues[4];

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  const invoiceNumber = selectedWorkspace
    ? `${selectedWorkspace.prefix}-${Date.now().toString().slice(-6)}`
    : 'INV-000000';

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (Number(item?.quantity) || 0) * (Number(item?.unit_price) || 0);
    }, 0);
    const totalCost = items.reduce((sum: number, item: any) => {
      return sum + (Number(item?.quantity) || 0) * (Number(item?.cost_price) || 0);
    }, 0);
    const tax = subtotal * (tax_rate / 100);
    const total = Math.max(0, subtotal + tax - discount);
    const profit = total - tax - totalCost;
    const profitMargin = subtotal > 0 ? (profit / subtotal) * 100 : 0;
    return { subtotal, tax, discount, total, totalCost, profit, profitMargin };
  }, [items, tax_rate, discount]);

  // Load workspaces
  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (!data.session) return;

      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('id, name, prefix, currency')
        .eq('owner_id', data.session.user.id)
        .order('created_at', { ascending: false });

      if (workspaceData?.length) {
        setWorkspaces(workspaceData);
        setValue('workspace_id', workspaceData[0].id);
        setValue('currency', workspaceData[0].currency || 'IDR');
      }
      setLoading(false);
    }
    load();
  }, [setValue]);

  // Load clients
  useEffect(() => {
    if (!selectedWorkspaceId) {
      setClients([]);
      return;
    }
    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .eq('workspace_id', selectedWorkspaceId);
      setClients(data || []);
      if (data?.length) setValue('client_id', data[0].id);
    }
    loadClients();
  }, [selectedWorkspaceId, setValue]);

  const onSubmit = async (values: InvoiceFormValues) => {
    if (!session) return;
    setSaving(true);
    setError('');

    try {
      const selectedWs = workspaces.find(w => w.id === values.workspace_id);
      if (!selectedWs) throw new Error('Pilih workspace yang valid');

      const subtotal = values.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const totalCost = values.items.reduce((sum, item) => sum + item.quantity * item.cost_price, 0);
      const taxValue = subtotal * ((values.tax_rate || 0) / 100);
      const total = subtotal + taxValue - (values.discount || 0);

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          workspace_id: values.workspace_id,
          client_id: values.client_id,
          invoice_number: invoiceNumber,
          issue_date: values.issue_date,
          due_date: values.due_date,
          status: values.status,
          currency: values.currency,
          subtotal,
          tax: taxValue,
          discount: values.discount || 0,
          total,
          total_cost: totalCost,
          notes: values.notes,
        })
        .select('id')
        .single();

      if (invoiceError || !invoiceData) throw invoiceError;

      const itemPayload = values.items.map((item, index) => ({
        invoice_id: invoiceData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: item.cost_price,
        position: index,
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemPayload);
      if (itemsError) throw itemsError;

      alert('✅ Invoice berhasil disimpan!');
      router.push('/invoices');
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="container"><div className="card">Memuat form...</div></main>;

  return (
    <main className="container">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Invoice</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Buat Invoice Baru</h1>
        </div>
        <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 hover:bg-slate-100">
          Kembali
        </Link>
      </div>

      <div className="card max-w-6xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Form Header */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Workspace</span>
                <select 
                  {...register('workspace_id')} 
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none"
                >
                  <option value="">Pilih Workspace</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Client</span>
                <select 
                  {...register('client_id')} 
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none"
                >
                  <option value="">Pilih Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label>
                <span className="text-sm font-medium text-slate-700">Tanggal Invoice</span>
                <input 
                  type="date" 
                  {...register('issue_date')} 
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">Due Date</span>
                <input 
                  type="date" 
                  {...register('due_date')} 
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none" 
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <label>
                <span className="text-sm font-medium text-slate-700">Currency</span>
                <select 
                  {...register('currency')} 
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none"
                >
                  {currencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">Tax Rate (%)</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('tax_rate', { valueAsNumber: true })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">Discount</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('discount', { valueAsNumber: true })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* Rincian Item + Summary */}
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Rincian Item</h2>
                <button
                  type="button"
                  onClick={() => append(defaultItem)}
                  className="rounded-full bg-brand-700 px-5 py-2.5 text-sm text-white hover:bg-brand-800"
                >
                  + Tambah Item
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-3xl border bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-4">
                        <label className="text-xs font-medium text-slate-600">Deskripsi</label>
                        <input
                          {...register(`items.${index}.description`)}
                          placeholder="Deskripsi barang / jasa"
                          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Qty</label>
                        <input
                          type="number"
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          min="1"
                          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Harga Jual</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                          placeholder="0"
                          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Harga Pokok</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.cost_price`, { valueAsNumber: true })}
                          placeholder="0"
                          className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-brand-700 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2 flex items-end justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="uppercase tracking-widest text-sm text-slate-500 mb-6">Ringkasan Invoice</p>

                <div className="space-y-5 text-lg">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(totals.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Harga Pokok</span>
                    <span className="font-semibold text-red-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(totals.totalCost)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600">Pajak ({tax_rate}%)</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(totals.tax)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Diskon</span>
                      <span>- {new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(discount)}</span>
                    </div>
                  )}

                  <div className="pt-6 border-t-2 border-slate-300">
                    <div className="flex justify-between text-2xl font-bold text-slate-900 mb-3">
                      <span>Grand Total</span>
                      <span>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(totals.total)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-800">💰 Keuntungan</span>
                      <span className="text-xl font-bold text-green-700">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(totals.profit)}
                      </span>
                    </div>
                    <div className="text-xs text-green-700">
                      Margin: {totals.profitMargin.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/invoices" className="rounded-full border px-8 py-3 text-slate-700 hover:bg-slate-100">
              Batal
            </Link>
            <button type="submit" className="rounded-full bg-brand-700 px-8 py-3 text-white hover:bg-brand-800">
              Simpan Invoice
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}