'use client';

import { create } from 'zustand';
import { Client, Invoice, Workspace } from '../lib/types';

interface AppState {
  workspaces: Workspace[];
  clients: Client[];
  invoices: Invoice[];
  addWorkspace: (workspace: Workspace) => void;
  addClient: (client: Client) => void;
  addInvoice: (invoice: Invoice) => void;
}

export const useAppStore = create<AppState>((set) => ({
  workspaces: [],
  clients: [],
  invoices: [],
  addWorkspace: (workspace) => set((state) => ({ workspaces: [...state.workspaces, workspace] })),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
}));
