-- Supabase Schema for InvoicePro
create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  company text,
  created_at timestamptz default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  address text,
  email text,
  phone text,
  prefix text not null default 'INV',
  currency text not null default 'IDR',
  bank_name text,
  bank_account text,
  bank_account_name text,
  bank_swift text,
  signer_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  tax_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  invoice_number text not null unique,
  issue_date date not null default current_date,
  due_date date not null default current_date + interval '7 days',
  status text not null default 'Draft',
  currency text not null default 'IDR',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) generated always as (quantity * unit_price) stored,
  position integer not null default 0
);
