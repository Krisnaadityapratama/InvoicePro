# PRD (Product Requirements Document)

## Nama Proyek
InvoicePro – Aplikasi Pembuatan Invoice Profesional

## Versi
2.0 Enterprise-Ready MVP

## Teknologi
- Next.js 15 (App Router)
- TypeScript
- Supabase
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Zustand
- @react-pdf/renderer

## Tanggal
20 Mei 2026

---

# 1. Pendahuluan

InvoicePro adalah aplikasi web berbasis Next.js yang dirancang untuk memudahkan pembuatan invoice profesional bagi freelancer, kontraktor, startup, agency, dan tim.

Aplikasi mendukung sistem multi-profile/workspace sehingga pengguna dapat mengelola banyak identitas bisnis dalam satu akun.

InvoicePro difokuskan pada:

- Pembuatan invoice cepat
- Branding konsisten
- Pengelolaan client profesional
- Export PDF berkualitas tinggi
- Skalabilitas menuju SaaS production

---

# 2. Visi Produk

Membangun platform invoicing modern yang:

- Cepat
- Profesional
- Scalable
- Multi-workspace
- Aman
- Mudah digunakan

---

# 3. Scope MVP

## MVP Saat Ini

- Tidak memiliki landing page
- Langsung menuju login/register
- Multi-profile/workspace
- Client management
- Invoice management
- PDF export
- Dashboard analytics sederhana
- Payment tracking dasar
- Real-time invoice preview

## Di Luar Scope MVP

- Subscription billing
- Marketplace
- Mobile app native
- Advanced accounting
- AI analytics

---

# 4. Tujuan Bisnis

## Business Goals

- Mempercepat proses invoicing
- Menstandarkan branding invoice
- Mengurangi kesalahan manual
- Menyediakan platform invoicing scalable
- Menjadi fondasi SaaS invoice management

## User Goals

- Membuat invoice dalam hitungan menit
- Mengelola banyak profile bisnis
- Mengelola client dengan mudah
- Melacak pembayaran invoice
- Mendownload invoice PDF profesional
- Menggunakan dashboard sederhana dan cepat

---

# 5. User Flow Utama

```text
Buka Website
    ↓
Login / Register
    ↓
Pilih / Buat Workspace Profile
    ↓
Dashboard
    ↓
Kelola Client
    ↓
Buat Invoice
    ↓
Preview Real-time
    ↓
Simpan Draft / Kirim
    ↓
Download PDF
```

---

# 6. Fitur Utama

# 6.1 Authentication

## Authentication Method

Menggunakan Supabase Auth:

- Email & Password
- Magic Link
- Session persistence
- Secure refresh token

## Authentication Rules

- User wajib login untuk mengakses aplikasi
- Semua route dashboard diproteksi
- Session management menggunakan middleware Next.js

---

# 6.2 Workspace / Multi-Profile System

## Konsep Workspace

Satu user dapat memiliki banyak workspace/profile.

Contoh:

- Personal
- PT Krisna Digital
- Startup ABC
- Agency XYZ

Workspace aktif menentukan:

- Branding invoice
- Counter invoice
- Client list
- Invoice list
- Bank information
- Currency

---

## Fitur Workspace

### CRUD Workspace

- Create workspace
- Edit workspace
- Delete workspace
- Switch workspace

### Data Workspace

- Nama perusahaan/pribadi
- Logo
- Alamat
- Email
- Nomor telepon
- Prefix invoice
- Currency
- Informasi bank
- Jabatan penandatangan

### Bank Information

- Nama bank
- Nomor rekening
- Atas nama
- Swift code

### Currency Support

Mendukung:

- IDR
- USD
- SGD
- MYR

Default:

```text
IDR
```

---

## Workspace Membership System

Workspace mendukung multi-user collaboration.

### Roles

- Owner
- Admin
- Member

### Permission Dasar

| Action | Owner | Admin | Member |
|---|---|---|---|
| Manage Workspace | Yes | Limited | No |
| Create Invoice | Yes | Yes | Yes |
| Delete Invoice | Yes | Yes | No |
| Manage Members | Yes | No | No |

---

# 6.3 Dashboard

## Dashboard Overview

Menampilkan:

- Total pendapatan
- Pendapatan bulan ini
- Pendapatan tahun ini
- Total invoice
- Invoice pending
- Invoice paid
- Invoice overdue

## Chart

Grafik pendapatan per bulan.

## Recent Activity

- Invoice terbaru
- Pembayaran terbaru
- Aktivitas user

---

# 6.4 Client Management

## CRUD Client

Field:

- Nama
- Perusahaan
- Alamat
- Email
- Nomor telepon
- Catatan

## Client Features

- Search client
- Filter client
- Client history
- Select client saat create invoice

---

# 6.5 Invoice Management

## Invoice Features

- Create invoice
- Edit invoice
- Duplicate invoice
- Delete invoice (soft delete)
- Download PDF
- Mark as paid
- Save draft
- Real-time preview
- Search & filter
- Pagination

---

## Invoice Status

- Draft
- Sent
- Paid
- Overdue
- Cancelled
- Partial Paid

---

## Invoice Numbering

Format:

```text
[PREFIX]-[NUMBER]
```

Contoh:

```text
INV-001
KR-023
PRJ-155
```

### Rules

- Counter per workspace
- Auto increment
- Tidak global
- Menggunakan database transaction
- Anti race-condition

---

## Invoice Layout

### Format

- Portrait A4
- Professional layout
- Clean typography

---

## Header

### Kiri

- Logo workspace
- Nama workspace
- Alamat
- Kontak

### Tengah

```text
INVOICE
```

### Kanan

- Nomor invoice
- Tanggal invoice
- Due date
- Status

---

## Informasi Penerima

```text
Kepada Yth,
```

Berisi:

- Nama client
- Alamat
- Telepon
- Email

---

## Tabel Rincian Biaya

Kolom:

| No | Deskripsi | Qty | Harga Satuan | Total |
|---|---|---|---|---|

### Features

- Dynamic row
- Add item
- Delete item
- Auto calculate
- Currency formatting

---

## Perhitungan Invoice

- Subtotal
- Tax
- Discount (future-ready)
- Grand total
- Total paid
- Remaining balance

---

## Tax System

Mendukung:

- Tax name
- Tax percentage
- Multiple tax support (future-ready)

Contoh:

- PPN
- VAT
- Service Tax

---

## Metode Pembayaran

Diambil dari workspace aktif.

Menampilkan:

- Nama bank
- Nomor rekening
- Atas nama
- Swift code

---

## Notes

Textarea multiline.

Mendukung:

- Catatan pembayaran
- Terms & conditions
- Informasi tambahan

---

## Footer

```text
Hormat Kami,
```

Menampilkan:

- Nama penanggung jawab
- Jabatan
- Ruang tanda tangan

---

# 6.6 Payment Tracking

## Payment Features

- Record payment
- Payment history
- Partial payment
- Multiple payment
- Payment notes

## Payment Methods

- Bank transfer
- Cash
- E-wallet
- Virtual account

## Auto Status Update

Status invoice otomatis berubah berdasarkan:

- Remaining balance
- Due date
- Total payment

---

# 6.7 Real-Time Invoice Preview

## Layout

Split screen:

- Kiri: form invoice
- Kanan: preview A4 real-time

## Features

- Live update
- Responsive preview
- PDF-like appearance

---

# 6.8 PDF Generation

## Teknologi

Menggunakan:

```text
@react-pdf/renderer
```

## PDF Strategy

PDF digenerate di server.

Contoh endpoint:

```text
/api/invoices/[id]/pdf
```

## Alasan

- Konsisten
- Aman
- Tidak bergantung browser
- Stabil

---

# 6.9 Search, Filter & Table

## Invoice Table Features

- Search
- Sort
- Filter status
- Filter date
- Pagination
- Bulk action

## Client Table Features

- Search
- Sort
- Pagination

---

# 6.10 Dark Mode

## Features

- Light mode
- Dark mode
- System mode

---

# 6.11 Autosave Draft

## Features

- Auto save draft
- Restore unsaved data
- Local cache fallback

---

# 6.12 Audit Log

## Tracking

Mencatat:

- Create invoice
- Edit invoice
- Delete invoice
- Payment activity
- Status changes
- Login activity

---

# 7. Technical Requirements

# Frontend

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- React Hook Form
- Zod
- TanStack Table
- Recharts
- Sonner
- date-fns

---

# Backend

Menggunakan Supabase:

- PostgreSQL
- Auth
- Storage
- Realtime
- Row Level Security

---

# Deployment

Platform:

- Vercel

---

# State Management

Menggunakan:

- Zustand

---

# Validation

Menggunakan:

- Zod

Validasi dilakukan:

- Client-side
- Server-side

---

# 8. Database Architecture

# Main Tables

## Tables

- profiles
- profile_members
- clients
- invoices
- invoice_items
- invoice_payments
- audit_logs
- invoice_counters

---

# 8.1 Profiles Table

```sql
create table profiles (
  id uuid primary key default uuid_generate_v4(),

  name text not null,
  logo_url text,
  address text,
  email text,
  phone text,
  prefix text not null,
  currency text default 'IDR',

  bank_name text,
  account_number text,
  account_name text,
  swift_code text,

  signer_name text,
  signer_position text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
```

---

# 8.2 Workspace Members

```sql
create table profile_members (
  id uuid primary key default uuid_generate_v4(),

  profile_id uuid references profiles on delete cascade,
  user_id uuid references auth.users on delete cascade,

  role text default 'member'
    check (role in ('owner','admin','member')),

  created_at timestamptz default now()
);
```

---

# 8.3 Clients Table

```sql
create table clients (
  id uuid primary key default uuid_generate_v4(),

  profile_id uuid references profiles not null,

  name text not null,
  company text,
  address text,
  email text,
  phone text,
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
```

---

# 8.4 Invoices Table

```sql
create table invoices (
  id uuid primary key default uuid_generate_v4(),

  profile_id uuid references profiles not null,
  client_id uuid references clients not null,

  invoice_number text not null unique,

  issue_date date not null default current_date,
  due_date date,

  status text default 'draft'
    check (
      status in (
        'draft',
        'sent',
        'paid',
        'partial_paid',
        'overdue',
        'cancelled'
      )
    ),

  currency text default 'IDR',

  subtotal bigint not null default 0,

  tax_name text,
  tax_rate numeric(5,2) default 0,
  tax_amount bigint default 0,

  total_amount bigint not null default 0,
  paid_amount bigint default 0,
  remaining_amount bigint default 0,

  notes text,

  profile_snapshot jsonb,
  client_snapshot jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
```

---

# 8.5 Invoice Items

```sql
create table invoice_items (
  id uuid primary key default uuid_generate_v4(),

  invoice_id uuid references invoices on delete cascade not null,

  no integer,
  description text not null,

  quantity integer not null default 1,
  unit_price bigint not null,
  total_price bigint not null,

  created_at timestamptz default now()
);
```

---

# 8.6 Invoice Payments

```sql
create table invoice_payments (
  id uuid primary key default uuid_generate_v4(),

  invoice_id uuid references invoices on delete cascade,

  amount bigint not null,
  payment_date date not null,
  method text,
  notes text,

  created_at timestamptz default now()
);
```

---

# 8.7 Invoice Counter

```sql
create table invoice_counters (
  profile_id uuid primary key references profiles on delete cascade,
  current_number bigint default 0
);
```

---

# 8.8 Audit Logs

```sql
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),

  user_id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  metadata jsonb,

  created_at timestamptz default now()
);
```

---

# 9. Invoice Number Generator

## Requirements

Generator harus:

- Aman terhadap race condition
- Atomic
- Menggunakan transaction
- Increment per workspace

## Format

```text
PREFIX-001
```

---

# 10. Security Requirements

## Row Level Security

WAJIB menggunakan RLS.

## Rules

- User hanya dapat mengakses workspace miliknya
- Member hanya dapat mengakses workspace yang terhubung
- Semua query divalidasi server-side

---

# Service Role Key

Service role key:

- Tidak boleh di client
- Hanya digunakan di server actions/API

---

# Input Validation

Semua input wajib divalidasi:

- Client-side
- Server-side

---

# Soft Delete

Invoice dan client menggunakan soft delete.

---

# 11. Storage Architecture

# Bucket

```text
logos
```

## Visibility

Public bucket.

## Alasan

- Mempermudah PDF rendering
- Logo bukan data sensitif

## Struktur

```text
logos/{workspace_id}/logo.png
```

---

# 12. Performance Requirements

## Requirements

- Responsive
- Mobile friendly
- Fast page load
- Lazy loading
- Optimized image
- Caching strategy

---

# Recommended Strategy

## Dynamic Rendering

Hanya halaman tertentu yang realtime.

## Cached Dashboard

Dashboard menggunakan caching.

---

# 13. UX Requirements

## UX Goals

- Minimalist
- Cepat
- Profesional
- Mudah dipahami

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl + S | Save Draft |
| Ctrl + P | Preview PDF |
| Ctrl + / | Search |

---

## Toast Notification

Menggunakan Sonner.

---

## Empty States

Harus memiliki:

- Empty state
- Error state
- Loading state
- Skeleton loader

---

# 14. Folder Structure Recommendation

```text
app/
 ├── (auth)/
 ├── dashboard/
 ├── invoices/
 ├── clients/
 ├── profiles/
 ├── api/
 └── pdf/

components/
 ├── ui/
 ├── invoice/
 ├── dashboard/
 └── forms/

lib/
 ├── supabase/
 ├── validations/
 ├── auth/
 ├── pdf/
 └── utils/

store/

hooks/

types/
```

---

# 15. Deployment Strategy

# Platform

Deploy menggunakan Vercel.

---

# Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SITE_NAME=InvoicePro
```

---

# Recommended Settings

- Node.js 20+
- Build cache enabled
- Analytics enabled
- Speed insights enabled

---

# 16. MVP+ Roadmap

# Phase 1.1

- Email invoice
- Export Excel
- Payment history
- Invoice template
- Dark mode
- Better analytics

---

# Phase 2

- Digital signature
- Reminder email
- Multi-language
- Role & permission advanced
- WhatsApp integration
- Analytics dashboard
- Custom domain invoice

---

# Phase 3

- Subscription system
- SaaS billing
- Team billing
- Public invoice portal
- API integration

---

# 17. Post Deployment Checklist

## Checklist

- Setup environment variables
- Setup Supabase schema
- Setup RLS policies
- Setup storage bucket
- Test auth
- Test multi-workspace
- Test invoice numbering
- Test PDF generation
- Test payment tracking
- Test permissions
- Test mobile responsiveness

---

# 18. Architecture Overview

```text
User
 ↓
Vercel Edge Network
 ↓
Next.js App Router
 ↓
Server Actions / API Routes
 ↓
Supabase
 ├── PostgreSQL
 ├── Auth
 ├── Storage
 └── Realtime
 ↓
PDF Generation
 ↓
Download
```

---

# 19. Keunggulan Arsitektur

## Advantages

- Multi-workspace scalable
- SaaS-ready architecture
- Secure by default
- Production-ready database structure
- Modern frontend stack
- Easy deployment
- Realtime capable
- Team collaboration ready

---

# 20. Kesimpulan

InvoicePro dirancang sebagai:

- Modern invoicing platform
- Production-ready MVP
- SaaS-ready architecture
- Multi-workspace invoicing system

Arsitektur aplikasi sudah dipersiapkan untuk:

- Freelancer
- Startup
- Agency
- Team collaboration
- SaaS monetization
- Future scalability

Fokus utama:

- Kecepatan
- Konsistensi
- Security
- Scalability
- User experience

