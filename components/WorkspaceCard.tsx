'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import type { Workspace } from '../lib/types';

type WorkspaceCardProps = {
  workspace: Workspace;
  onDelete?: (id: string) => void;     // ← Jadikan opsional
  onEdit?: (workspace: Workspace) => void;
};

export function WorkspaceCard({ workspace, onDelete, onEdit }: WorkspaceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return; // Jika tidak ada handler, abaikan

    if (!confirm(`Apakah Anda yakin ingin menghapus workspace "${workspace.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspace.id);

    if (error) {
      alert('Gagal menghapus workspace: ' + error.message);
    } else {
      onDelete(workspace.id);
    }
    setIsDeleting(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{workspace.name}</h3>
          <p className="text-sm text-slate-500 mt-1">Prefix: {workspace.prefix}</p>
          {workspace.address && <p className="text-sm text-slate-600 mt-2">{workspace.address}</p>}
        </div>
        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600">
          {workspace.currency}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/workspaces/edit/${workspace.id}`}
          className="flex-1 text-center rounded-2xl border border-slate-300 py-2.5 text-sm font-medium hover:bg-slate-50 transition"
        >
          Edit
        </Link>

        {onDelete && (   // ← Hanya tampilkan tombol hapus jika ada handler
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-2xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-50"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        )}
      </div>
    </div>
  );
}