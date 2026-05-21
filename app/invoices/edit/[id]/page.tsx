'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

const invoiceSchema = z.object({
  workspace_id: z.string().min(1, 'Pilih workspace terlebih dahulu'),
  client_id: z.string().min(1, 'Pilih client terlebih dahulu'),
  issue_date: z.string().min(1, 'Tanggal invoice diperlukan'),
  due_date: z.string().min(1, 'Due date diperlukan'),
  currency: z.enum(['IDR', 'USD', 'SGD', 'MYR']).default('IDR'),
  status: z.enum(['Draft', 'Sent', 'Paid']).default('Draft'),
  tax_rate: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
    })
  ),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

type WorkspaceOption = {
  id: string;
  name: string;
  prefix: string;
  currency: string;
};

const currencyOptions = ['IDR', 'USD', 'SGD', 'MYR'] as const;

type CurrencyCode = (typeof currencyOptions)[number];

const normalizeCurrency = (currency: string | undefined): CurrencyCode => {
  return currencyOptions.includes(currency as CurrencyCode)
    ? (currency as CurrencyCode)
    : 'IDR';
};

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

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
    reset,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      workspace_id: '',
      client_id: '',
      issue_date: '',
      due_date: '',
      currency: 'IDR',
      status: 'Draft',
      tax_rate: 0,
      discount: 0,
      notes: '',
      items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedValues = watch();

  const totals = useMemo(() => {
    const subtotal =
      watchedValues.items?.reduce((sum, item) => {
        return (
          sum +
          Number(item.quantity || 0) * Number(item.unit_price || 0)
        );
      }, 0) || 0;

    const tax =
      subtotal * ((Number(watchedValues.tax_rate) || 0) / 100);

    const discount = Number(watchedValues.discount) || 0;

    const total = subtotal + tax - discount;

    return {
      subtotal,
      tax,
      total,
    };
  }, [watchedValues]);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setSession(session);

      const [{ data: workspaceData }, { data: clientData }] =
        await Promise.all([
          supabase
            .from('workspaces')
            .select('*')
            .order('created_at', { ascending: false }),

          supabase
            .from('clients')
            .select('*')
            .order('name'),
        ]);

      setWorkspaces(workspaceData || []);
      setClients(clientData || []);

      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(
          `
          *,
          invoice_items (*)
        `
        )
        .eq('id', invoiceId)
        .single();

      if (error || !invoice) {
        setError('Invoice tidak ditemukan');
        setLoading(false);
        return;
      }

      reset({
        workspace_id: invoice.workspace_id,
        client_id: invoice.client_id,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        currency: normalizeCurrency(invoice.currency),
        status: invoice.status,
        tax_rate: Number(invoice.tax || 0),
        discount: Number(invoice.discount || 0),
        notes: invoice.notes || '',
        items:
          invoice.invoice_items?.map((item: any) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          })) || [],
      });

      replace(
        invoice.invoice_items?.map((item: any) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })) || []
      );

      setLoading(false);
    };

    loadData();
  }, [invoiceId, reset, replace, router]);

  const onSubmit = async (values: InvoiceFormValues) => {
    setSaving(true);
    setError('');

    const subtotal = totals.subtotal;
    const taxValue = totals.tax;
    const total = totals.total;

    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        workspace_id: values.workspace_id,
        client_id: values.client_id,
        issue_date: values.issue_date,
        due_date: values.due_date,
        currency: values.currency,
        status: values.status,
        subtotal: subtotal.toFixed(2),
        tax: taxValue.toFixed(2),
        discount: Number(values.discount || 0).toFixed(2),
        total: total.toFixed(2),
        notes: values.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (invoiceError) {
      setError(invoiceError.message);
      setSaving(false);
      return;
    }

    await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId);

    const itemPayload = values.items.map((item, index) => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      position: index,
    }));

    const { error: itemError } = await supabase
      .from('invoice_items')
      .insert(itemPayload);

    if (itemError) {
      setError(itemError.message);
      setSaving(false);
      return;
    }

    router.push('/invoices');
  };

  if (loading) {
    return (
      <main className="container py-10">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          Memuat data invoice...
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-5xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Edit Invoice
          </h1>

          <p className="text-slate-500 mt-1">
            Update data invoice dan item transaksi.
          </p>
        </div>

        <Link
          href="/invoices"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-black hover:bg-slate-50"
        >
          Kembali
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="grid md:grid-cols-2 gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Workspace
            </label>

            <select
              {...register('workspace_id')}
              className="w-full rounded-xl border border-slate-200 bg-white text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Pilih workspace</option>

              {workspaces.map((workspace) => (
                <option
                  key={workspace.id}
                  value={workspace.id}
                >
                  {workspace.name}
                </option>
              ))}
            </select>

            {errors.workspace_id && (
              <p className="text-red-500 text-sm mt-2">
                {errors.workspace_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Client
            </label>

            <select
              {...register('client_id')}
              className="w-full rounded-xl border border-slate-200 bg-white text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Pilih client</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>

            {errors.client_id && (
              <p className="text-red-500 text-sm mt-2">
                {errors.client_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Issue Date
            </label>

            <input
              type="date"
              {...register('issue_date')}
              className="w-full rounded-xl border border-slate-200 bg-white text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Due Date
            </label>

            <input
              type="date"
              {...register('due_date')}
              className="w-full rounded-xl border border-slate-200 bg-white text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-black">
              Invoice Items
            </h2>

            <button
              type="button"
              onClick={() =>
                append({
                  description: '',
                  quantity: 1,
                  unit_price: 0,
                })
              }
              className="rounded-xl bg-black text-white px-4 py-2 hover:opacity-90"
            >
              Tambah Item
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid md:grid-cols-12 gap-4 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="md:col-span-6">
                  <input
                    placeholder="Deskripsi item"
                    {...register(`items.${index}.description`)}
                    className="w-full rounded-xl border border-slate-200 bg-white text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <input
                    type="number"
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-xl border border-slate-200 bg-white text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="md:col-span-3">
                  <input
                    type="number"
                    {...register(`items.${index}.unit_price`, {
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-xl border border-slate-200 bg-white text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="md:col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 font-semibold hover:opacity-80"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex justify-between text-black">
            <span>Subtotal</span>

            <span>
              {watchedValues.currency}{' '}
              {totals.subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-black">
            <span>Tax</span>

            <span>
              {watchedValues.currency}{' '}
              {totals.tax.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between border-t pt-4 text-xl font-bold text-black">
            <span>Total</span>

            <span>
              {watchedValues.currency}{' '}
              {totals.total.toLocaleString()}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-black py-4 text-white font-semibold hover:opacity-90 disabled:opacity-70"
        >
          {saving
            ? 'Menyimpan Perubahan...'
            : 'Update Invoice'}
        </button>
      </form>
    </main>
  );
}