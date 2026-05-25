export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
};

export type Workspace = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  prefix: string;
  currency: string;
  bank_name: string | null;
  bank_account: string | null;
  bank_account_name: string | null;
  bank_swift: string | null;
  signer_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  client_id: string;
  client: string;
  total: string;
  total_cost: string;
  total_profit: string;
  profit_margin: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | string;
  issue_date: string;
  due_date: string;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  total: number;
  profit: number;
  position: number;
};
