'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Client, InvoiceItem, Workspace } from '../lib/types';

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
  notes: string | null;
};

type InvoicePdfDocumentProps = {
  invoice: InvoiceDetail;
  client: Client;
  workspace: Workspace;
  items: InvoiceItem[];
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '3px solid #0ea5e9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  invoiceMeta: {
    textAlign: 'right',
  },
  companyInfo: {
    marginTop: 15,
    fontSize: 10,
    lineHeight: 1.5,
  },
  billTo: {
    marginTop: 25,
    marginBottom: 25,
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderBottom: '1px solid #cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e2e8f0',
  },
  colNo: { width: '5%' },
  colDesc: { width: '45%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  summary: {
    marginTop: 25,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    width: '65%',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    width: '65%',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTop: '2px solid #0ea5e9',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bankSection: {
    marginTop: 30,
    fontSize: 10,
  },
  footer: {
    marginTop: 60,
    textAlign: 'center',
  },
});

const formatCurrency = (amount: number | string, currency: string = 'IDR') => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num || 0);
};

export function InvoicePdfDocument({ invoice, client, workspace, items }: InvoicePdfDocumentProps) {
  const subtotal = parseFloat(invoice.subtotal || '0');
  const tax = parseFloat(invoice.tax || '0');
  const discount = parseFloat(invoice.discount || '0');
  const total = parseFloat(invoice.total || '0');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            {workspace.logo_url && <Image src={workspace.logo_url} style={{ width: 90, marginBottom: 8 }} />}
            <Text style={styles.title}>INVOICE</Text>
          </View>

          <View style={styles.invoiceMeta}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>#{invoice.invoice_number}</Text>
            <Text style={{ marginTop: 8 }}>
              Tanggal Invoice: <Text style={{ fontWeight: 'bold' }}>{invoice.issue_date}</Text>
            </Text>
            <Text>
              Due Date: <Text style={{ fontWeight: 'bold' }}>{invoice.due_date}</Text>
            </Text>
          </View>
        </View>

        {/* WORKSPACE INFO - DIBAWah GARIS BIRU */}
        <View style={styles.companyInfo}>
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{workspace.name}</Text>
          {workspace.address && <Text>{workspace.address}</Text>}
          {workspace.email && <Text>{workspace.email}</Text>}
          {workspace.phone && <Text>Telp: {workspace.phone}</Text>}
        </View>

        {/* BILL TO */}
        <View style={styles.billTo}>
          <Text style={styles.billToTitle}>Kepada Yth,</Text>
          <Text style={{ fontWeight: 'bold' }}>{client.name}</Text>
          {client.company && <Text>{client.company}</Text>}
          {client.address && <Text>{client.address}</Text>}
          {client.email && <Text>{client.email}</Text>}
          {client.phone && <Text>Telp: {client.phone}</Text>}
        </View>

        {/* TABEL RINCIAN */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>No</Text>
            <Text style={styles.colDesc}>Deskripsi</Text>
            <Text style={styles.colQty}>Jumlah</Text>
            <Text style={styles.colPrice}>Harga Satuan</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colNo}>{index + 1}</Text>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unit_price, invoice.currency)}</Text>
              <Text style={styles.colTotal}>
                {formatCurrency(item.quantity * item.unit_price, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* SUMMARY */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </View>
          {tax > 0 && (
            <View style={styles.summaryRow}>
              <Text>Pajak</Text>
              <Text>{formatCurrency(tax)}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text>Diskon</Text>
              <Text>- {formatCurrency(discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>Total Biaya</Text>
            <Text>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* BANK DETAILS */}
        {(workspace.bank_name || workspace.bank_account) && (
          <View style={styles.bankSection}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Metode Pembayaran: Transfer Bank</Text>
            {workspace.bank_name && <Text>Bank : {workspace.bank_name}</Text>}
            {workspace.bank_account && <Text>No. Rekening : {workspace.bank_account}</Text>}
            {workspace.bank_account_name && <Text>Atas Nama : {workspace.bank_account_name}</Text>}
            {workspace.bank_swift && <Text>Swift Code : {workspace.bank_swift}</Text>}
          </View>
        )}

        {/* NOTES */}
        {invoice.notes && (
          <View style={{ marginTop: 25 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Catatan:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Hormat Kami,</Text>
          <Text style={{ marginTop: 40, fontWeight: 'bold' }}>
            {workspace.signer_name || workspace.name}
          </Text>
        </View>
      </Page>
    </Document>
  );
}