# Supabase Storage Setup for InvoicePro

## Bucket
- Nama bucket: `profile-logos`
- Akses: bisa diatur `public` atau `private`

## Rencana penggunaan
- `profiles.avatar_url` menyimpan path file di bucket
- `workspaces.logo_url` menyimpan path file di bucket

## Contoh pengaturan bucket
1. Buka Supabase Studio
2. Masuk ke menu Storage
3. Buat bucket baru bernama `profile-logos`
4. Atur permission ke `public` jika ingin memuat logo langsung dari URL
   - Jika ingin private, gunakan Signed URLs di aplikasi

## Contoh upload client-side
```ts
const file = event.target.files?.[0];
if (!file) return;

const { data, error } = await supabase.storage
  .from('profile-logos')
  .upload(`avatars/${userId}/${file.name}`, file, { cacheControl: '3600', upsert: true });

const { data: publicUrl } = supabase.storage
  .from('profile-logos')
  .getPublicUrl(data.path);
```

## Contoh menyimpan URL ke workspace
- `logo_url`: `profile-logos/avatars/<user-id>/<filename>.png`

## Catatan
- Jika bucket `public`, gunakan `getPublicUrl` untuk membangun URL langsung.
- Jika bucket `private`, gunakan `createSignedUrl` sebelum menampilkan file pada UI.
