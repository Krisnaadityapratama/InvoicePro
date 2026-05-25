# 📊 Panduan Fitur Profit Tracking (Tracking Keuntungan)

## 🎯 Penjelasan Masalah & Solusi

### **Masalah**
Anda sebagai reseller memerlukan cara untuk melacak keuntungan yang sebenarnya dari setiap invoice. Misalnya:
- Customer membeli 1 ring dengan harga **Rp 1.400.000** (harga jual)
- Tetapi cost (harga pokok dari vendor) adalah **Rp 1.250.000**
- Jadi keuntungan sebenarnya adalah **Rp 150.000** (bukan Rp 1.400.000)

Sebelumnya, sistem hanya menampilkan harga jual saja, tanpa memperhitungkan harga pokok.

---

## ✅ Apa yang Telah Diimplementasikan

### **1. Database Schema Updates**
Tiga field baru ditambahkan ke database:

#### **Pada `invoices` table:**
- `total_cost` - Total harga pokok dari semua item dalam invoice
- `total_profit` - Keuntungan bersih (generated automatically)
- `profit_margin` - Persentase profit margin (generated automatically)

#### **Pada `invoice_items` table:**
- `cost_price` - Harga pokok untuk setiap item
- `profit` - Keuntungan per item (generated automatically)

**Formula Kalkulasi:**
```
profit per item = (unit_price - cost_price) × quantity
total_profit = total - tax - total_cost
profit_margin = (total_profit / subtotal) × 100%
```

---

### **2. Form Invoice - Input Harga Pokok**

#### **Saat Membuat Invoice Baru:**
Navigasi ke `/invoices/new`, sekarang akan ada **4 input field** per item:
1. ✏️ **Deskripsi** - Nama barang/jasa
2. **Qty** - Jumlah item
3. **Harga Jual** - Harga yang dijual ke customer
4. **Harga Pokok** ⭐ - **BARU:** Harga yang Anda bayarkan ke vendor

#### **Contoh:**
```
Deskripsi: Ring Emas
Qty: 1
Harga Jual: 1.400.000
Harga Pokok: 1.250.000 ← INPUT INI
```

#### **Live Summary:**
Di sebelah kanan form, akan muncul ringkasan real-time yang sekarang termasuk:
- Subtotal
- **Total Harga Pokok** (baru)
- Pajak
- Grand Total
- **💰 Keuntungan** (baru - ditampilkan dalam box hijau)
  - Nilai keuntungan dalam Rp
  - Profit margin dalam %

---

### **3. Edit Invoice**

Saat mengedit invoice (`/invoices/edit/[id]`), Anda bisa:
- ✏️ Mengubah harga pokok untuk setiap item
- Melihat real-time update profit calculation
- Summary akan otomatis mengupdate total profit

---

### **4. Detail Invoice View**

Saat melihat detail invoice (`/invoices/[id]`), sekarang akan menampilkan:
```
Tanggal Invoice: [tanggal]
Due Date: [tanggal]
Subtotal: Rp 1.400.000
Total Harga Pokok: Rp 1.250.000 (warna merah)
Pajak: Rp 0
Diskon: Rp 0
Total: Rp 1.400.000

💰 Keuntungan: Rp 150.000 (warna hijau, font bold)
```

---

### **5. Invoice Card (Daftar Invoice)**

Di halaman `/invoices`, setiap card invoice sekarang menampilkan:
```
Invoice #INV-123456
Klien: PT Cinta Emas
[Status Badge]

Rp 1.400.000 (Total)
💰 Profit: Rp 150.000 (baru)

[Detail/PDF] [Edit] [Actions...]
```

---

### **6. Dashboard - Profit Metrics**

#### **Baru: KPI Card "Total Profit"**
Di dashboard (`/dashboard`), sekarang ada KPI card baru:
```
💰 Total Profit
Rp 2.500.000

Keuntungan bersih dari invoice
(hanya menghitung invoice yang status "Paid")
```

**Penjelasan:**
- Menampilkan total profit dari semua invoice yang sudah dibayar (status: Paid)
- Dihitung otomatis dari field `total_profit` di database
- Ditampilkan dengan warna hijau (emerald) untuk highlight keuntungan

---

## 📋 Cara Menggunakan

### **Step 1: Buat Invoice Baru**
1. Klik `Invoice` → `+ Buat Invoice Baru`
2. Isi workspace & client
3. Tambah item dengan mengisi:
   - Deskripsi
   - Qty
   - **Harga Jual** (yang dijual ke customer)
   - **Harga Pokok** ⭐ (yang dibayar ke vendor)
4. Lihat real-time profit di summary
5. Klik `Simpan Invoice`

### **Step 2: Tracking Profit Per Invoice**
1. Buka `/invoices` → lihat profit di setiap card
2. Atau klik `Detail/PDF` untuk melihat detail lengkap dengan profit

### **Step 3: Tracking Profit Total di Dashboard**
1. Buka `/dashboard`
2. Lihat KPI card **"💰 Total Profit"**
3. Menampilkan total keuntungan dari semua invoice yang dibayar

---

## 🔢 Contoh Kalkulasi

### **Invoice 1 Item:**
```
Customer: PT Emas Makmur
Item: Ring Emas
- Qty: 1
- Harga Jual: 1.400.000
- Harga Pokok: 1.250.000

Subtotal: 1.400.000
Tax (0%): 0
Discount: 0
Total: 1.400.000
Total Cost: 1.250.000
→ Keuntungan: 150.000 (10.7% margin)
```

### **Invoice Multiple Item:**
```
Item 1: Kalung
- Qty: 2
- Harga Jual: 800.000 (per unit)
- Harga Pokok: 600.000 (per unit)
- Profit Item: (800.000 - 600.000) × 2 = 400.000

Item 2: Cincin
- Qty: 1
- Harga Jual: 1.200.000
- Harga Pokok: 950.000
- Profit Item: (1.200.000 - 950.000) × 1 = 250.000

Subtotal: (800.000 × 2) + 1.200.000 = 2.800.000
Total Cost: (600.000 × 2) + 950.000 = 2.150.000
Tax (10%): 280.000
Discount: 0
Total: 2.800.000 + 280.000 = 3.080.000

→ Keuntungan: 3.080.000 - 280.000 - 2.150.000 = 650.000 (23.2% margin)
```

---

## 🔑 Key Fields yang Perlu Diisi

| Field | Wajib? | Penjelasan | Contoh |
|-------|--------|-----------|---------|
| Deskripsi | ✅ | Nama barang/jasa | Ring Emas 22k |
| Qty | ✅ | Jumlah unit | 1, 2, 5 |
| Harga Jual | ✅ | Harga yang dijual ke customer | 1.400.000 |
| **Harga Pokok** ⭐ | ✅ | **BARU:** Harga dari vendor | 1.250.000 |

---

## 📱 Fitur Live Calculation

Ketika Anda mengetik di form, profit akan **otomatis terhitung real-time**:

```javascript
// Formula di aplikasi
profit = (unit_price - cost_price) × quantity
profit_margin = (profit / subtotal) × 100
```

Jadi saat Anda mengubah "Harga Jual" atau "Harga Pokok", langsung terlihat perubahan profit-nya.

---

## ✨ Keuntungan Fitur Ini

1. ✅ **Tracking Akurat** - Tahu persis profit dari setiap invoice
2. ✅ **Real-time** - Profit dihitung otomatis saat input
3. ✅ **Dashboard Metrics** - Lihat total profit dari semua invoice di dashboard
4. ✅ **Flexible** - Setiap item bisa punya margin berbeda
5. ✅ **PDF Export** - Invoice detail bisa di-export dengan profit info

---

## 🆘 Troubleshooting

### **Q: Harga Pokok tidak disimpan?**
A: Pastikan Anda input nilai di field "Harga Pokok" sebelum klik Simpan. Field ini wajib.

### **Q: Profit menampilkan 0?**
A: Kemungkinan "Harga Pokok" belum diisi atau sama dengan "Harga Jual". Isi dengan harga pokok yang lebih rendah.

### **Q: Profit margin negatif?**
A: Ini berarti Anda menjual lebih murah dari harga pokok (rugi). Review pricing Anda atau update harga jual.

### **Q: Dashboard Total Profit tidak update?**
A: Dashboard hanya menghitung invoice dengan status "Paid". Pastikan invoice sudah ditandai lunas di form.

---

## 📊 Update Database Schema

Jika Anda menggunakan Supabase, jalankan migration ini:

```sql
-- Add columns ke invoices table
ALTER TABLE invoices 
ADD COLUMN total_cost NUMERIC(12,2) DEFAULT 0,
ADD COLUMN total_profit NUMERIC(12,2) GENERATED ALWAYS AS (total - tax - total_cost) STORED,
ADD COLUMN profit_margin NUMERIC(5,2) GENERATED ALWAYS AS (CASE WHEN (total - tax) > 0 THEN ((total - tax - total_cost) / (total - tax) * 100) ELSE 0 END) STORED;

-- Add columns ke invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN cost_price NUMERIC(12,2) DEFAULT 0,
ADD COLUMN profit NUMERIC(12,2) GENERATED ALWAYS AS (quantity * (unit_price - cost_price)) STORED;
```

---

## 🚀 Next Steps

1. **Coba buat invoice** dengan input "Harga Pokok"
2. **Lihat profit real-time** di summary
3. **Track profit di dashboard** setelah invoice dibayar
4. **Export PDF** untuk laporan keuangan

---

Semoga fitur ini membantu Anda dalam mengelola bisnis reseller dengan lebih efektif! 💰

**Pertanyaan?** Hubungi support atau cek file ini untuk penjelasan lebih detail.
