import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export async function ensureUserProfileAndWorkspace(session: Session | null) {
  if (!session) {
    return { createdProfile: false, createdWorkspace: false };
  }

  const userId = session.user.id;
  const userEmail = session.user.email ?? 'user@example.com';
  const userName = (session.user.user_metadata as any)?.full_name || userEmail.split('@')[0];

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  let createdProfile = false;
  if (!existingProfile) {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      full_name: userName,
      created_at: new Date().toISOString(),
    });

    createdProfile = !error;
  }

  const { data: existingWorkspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .limit(1)
    .maybeSingle();

  let createdWorkspace = false;
  if (!existingWorkspace) {
    const slugBase = createSlug(`${userName} workspace`);
    const { error } = await supabase.from('workspaces').insert({
      owner_id: userId,
      name: `${userName}'s Workspace`,
      slug: slugBase || `workspace-${Date.now()}`,
      description: 'Workspace otomatis dibuat setelah login.',
      prefix: 'INV',
      currency: 'IDR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    createdWorkspace = !error;
  }

  return { createdProfile, createdWorkspace };
}
