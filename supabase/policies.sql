-- Supabase Row-Level Security policies for InvoicePro

-- Helper function to verify ownership over a workspace
create or replace function is_workspace_owner(workspace_uuid uuid)
returns boolean language sql stable as $$
  select owner_id = auth.uid() from workspaces where id = workspace_uuid
$$;

-- Profiles
alter table profiles enable row level security;
create policy "Profiles can be selected by owner" on profiles for select using (id = auth.uid());
create policy "Profiles can be updated by owner" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Profiles can be inserted by owner" on profiles for insert with check (id = auth.uid());

-- Workspaces
alter table workspaces enable row level security;
create policy "Users can select own workspaces" on workspaces for select using (owner_id = auth.uid());
create policy "Users can insert workspace" on workspaces for insert with check (owner_id = auth.uid());
create policy "Users can update own workspace" on workspaces for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Users can delete own workspace" on workspaces for delete using (owner_id = auth.uid());

-- Clients
alter table clients enable row level security;
create policy "Users can select clients for own workspaces" on clients for select using (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
);
create policy "Users can insert client for own workspace" on clients for insert with check (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
);
create policy "Users can update client for own workspace" on clients for update using (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
);
create policy "Users can delete client for own workspace" on clients for delete using (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
);

-- Invoices
alter table invoices enable row level security;
create policy "Users can select invoices for own workspaces" on invoices for select using (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
);
create policy "Users can insert invoice for own workspace" on invoices for insert with check (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
);
create policy "Users can update invoice for own workspace" on invoices for update using (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
);
create policy "Users can delete invoice for own workspace" on invoices for delete using (
  exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()
  )
);

-- Invoice items
alter table invoice_items enable row level security;
create policy "Users can select invoice items for own invoices" on invoice_items for select using (
  exists (
    select 1 from invoices i join workspaces w on i.workspace_id = w.id where i.id = invoice_id and w.owner_id = auth.uid()
  )
);
create policy "Users can insert invoice item for own invoice" on invoice_items for insert with check (
  exists (
    select 1 from invoices i join workspaces w on i.workspace_id = w.id where i.id = invoice_id and w.owner_id = auth.uid()
  )
);
create policy "Users can update invoice item for own invoice" on invoice_items for update using (
  exists (
    select 1 from invoices i join workspaces w on i.workspace_id = w.id where i.id = invoice_id and w.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from invoices i join workspaces w on i.workspace_id = w.id where i.id = invoice_id and w.owner_id = auth.uid()
  )
);
create policy "Users can delete invoice item for own invoice" on invoice_items for delete using (
  exists (
    select 1 from invoices i join workspaces w on i.workspace_id = w.id where i.id = invoice_id and w.owner_id = auth.uid()
  )
);
