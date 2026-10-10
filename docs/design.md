# Design Specification & UI Guidelines — C-Carbon Mobile

Dokumen ini mendefinisikan panduan antarmuka (UI) dan pengalaman pengguna (UX) untuk aplikasi mobile **C-Carbon (Farm Risk & Carbon Platform)**, diadaptasi langsung dari referensi visual modern di [`docs/reference-ui.jpg`](./reference-ui.jpg).

---

## 1. Visi Desain & Karakter Produk

C-Carbon adalah platform jembatan bagi petani gurem (*smallholder farmers*) menuju pasar karbon institusional dengan perlindungan asuransi pertanian (*Eco-Insurance*).

Desain antarmuka harus mencerminkan:
- **Terpercaya & Profesional (*Trustworthy & Institutional*):** Siap diajukan ke juri bisnis, investor korporat, dan lembaga sertifikasi.
- **Membumi & Agraris (*Grounded & Agricultural*):** Dominasi warna hijau hutan (*forest green*), aksen tanah (*earth*), dan kanvas *sage* yang tenang.
- **Modern & Intuitif (*Modern Mobile-First*):** Mengadopsi pola aplikasi mobile terbaik (Bottom Navigation, Pill Tabs, Card dengan sudut lengkung halus, dan indikator visual nyata).
- **Bukan Kripto / Web3:** Menghindari elemen visual spekulatif, grafik trading koin, atau dashboard neon futuristik.

---

## 2. Token Desain (Design Tokens)

### 2.1 Palet Warna

| Token | Nilai Hex | Penggunaan |
|---|---|---|
| **Forest 900** | `#173A2B` | Teks utama, judul display, status pekat |
| **Forest 700** | `#24543E` | Header kartu, tombol aksi primer aktif |
| **Forest 600** | `#2F6B4F` | Warna brand utama, ikon aktif, progress fill |
| **Forest 100 (Tint)** | `#E7EFE9` | Background lencana/badge, background ikon aktif |
| **Canvas / Sage Tint** | `#F7F9F7` | Latar belakang layar (*screen background*) |
| **Surface White** | `#FFFFFF` | Latar belakang kartu (*card background*) |
| **Border Neutral** | `#E2E8E4` | Border kartu & garis pemisah halus |
| **Ink 900** | `#17201C` | Teks judul kartu |
| **Ink 500** | `#68736D` | Teks sekunder, deskripsi, caption |
| **Harvest 500** | `#C99A3D` | Aksen hadiah, tier reward, status peringatan |
| **Earth 700** | `#8A5A32` | Aksen tanah/komoditas |

### 2.2 Geometri & Elevasi

- **Sudut Lengkung (*Border Radius*):**
  - Kartu Standar: `16px` – `20px` (rounded lembut)
  - Kartu Unggulan / Hero: `24px`
  - Pill / Tombol / Badge: `9999px` (full pill)
  - Input Field: `14px`
- **Elevasi & Bayangan (*Shadow*):**
  - Bayangan sangat lembut (*ambient shadow*): `shadowColor: '#173A2B'`, `shadowOpacity: 0.05`, `shadowRadius: 10`, `elevation: 2`.
  - Dilengkapi garis tepi tipis `1px` berwarna `#E2E8E4` untuk ketegasan visual.
- **Grid Spacing (Kelipatan 4px):**
  - Padding Layar: `20px` horizontal
  - Jarak Antar Seksi: `24px`
  - Padding Dalam Kartu: `16px` – `20px`

### 2.3 Tipografi

Menggunakan **Plus Jakarta Sans** untuk seluruh teks aplikasi:
- **Display Hero:** `28–32px`, Bold (700)
- **Heading 1:** `24px`, Bold (700)
- **Heading 2:** `20px`, Semi-Bold (600)
- **Heading 3 / Card Title:** `16px`, Semi-Bold (600)
- **Body:** `14px`, Regular (400) & Medium (500)
- **Caption / Meta:** `12px`, Regular (400)
- **Identifier Monospace:** Digunakan khusus untuk kode referensi unik seperti *Digital Farm ID* dan *Nomor Polis*.

---

## 3. Adaptasi Layar Berdasarkan Referensi Visual

Sesuai dengan 3 layar pada screenshot acuan ([`reference-ui.jpg`](./reference-ui.jpg)):

### 3.1 Layar 1 — Beranda Petani (*Farmer Dashboard*)
*Mengadaptasi Layar 1 (Kiri): Home Discovery & Quick Actions*

1. **Header Personal:**
   - Sapaan: *"Halo, Pak Budi 👋"*
   - Foto profil/avatar di kanan atas dengan lencana status *"Petani Terverifikasi"*.
2. **Hero Title Berkarakter:**
   - Headline: *"Pertanian Anda, Berkelanjutan & Terlindungi"* dengan aksen hijau hutan.
3. **Pill Search / Quick Bar:**
   - Kolom pencarian lahan cepat dengan ikon mikrofon/filter di ujung kanan.
4. **Quick Actions Grid (4 Kotak Aksi Utama):**
   Grid 2x2 kartu persegi sudut membulat dengan ikon garis bersih:
   - 🌾 **Lahan Saya:** Kelola lahan & sertifikat.
   - 📝 **Lapor Musim:** Input data panen, air, & pupuk.
   - 📊 **Skor FSS:** Pantau skor keberlanjutan tanah.
   - 🎁 **Hadiah:** Cek poin reward & naik tingkat.
5. **Hero Banner — Proteksi Asuransi (Eco-Insurance):**
   - Banner hijau lembut di bagian bawah yang menginformasikan status proteksi: *"Lahan Utama Anda Terlindungi Asuransi Parametrik Musim Ini"*.

---

### 3.2 Layar 2 — Detail Lahan & Riwayat Musim (*Farm Detail & Timeline*)
*Mengadaptasi Layar 2 (Tengah): Detail & Vertical Step Timeline*

1. **Top Navigation Bar:**
   - Tombol kembali bundar (`←`) di kiri atas.
   - Judul tengah: *"Detail Lahan"* atau nama lahan.
   - Ikon bookmark/opsi di kanan atas.
2. **Kartu Ringkasan Tiga Pil (*3-Pill Key Metrics*):**
   Persis seperti metrik di gambar acuan:
   - 📍 **Luas Lahan:** `2.4 Ha`
   - 🌾 **Hasil Panen:** `4.8 Ton`
   - 🍃 **Potensi CO₂:** `18 Ton CO₂e` (dengan ikon daun)
3. **Pill Tab Selector (Filter Horizontal):**
   Kategori tab interaktif:
   - `[Semua Musim]` (Aktif - hijau tua)
   - `[Asuransi]`
   - `[Skor FSS]`
   - `[Kesiapan Karbon]`
4. **Timeline Riwayat Musim (Vertical Step Indicator):**
   - Indikator lingkaran bertahap (Musim 1, Musim 2, Musim 3) yang terhubung garis vertikal.
   - Kartu aktivitas di kanan: Tanggal tanam, jenis pupuk, status verifikasi admin (*Ditinjau / Terverifikasi*), dan foto bukti panen.
5. **Floating Action Button:**
   - Tombol aksi primer di bawah layar: *"+ Lapor Musim Baru"*.

---

### 3.3 Layar 3 — Status Asuransi, Metrik Kesiapan & Checklist
*Mengadaptasi Layar 3 (Kanan): Boarding Pass Card & Circular Gauge*

1. **Kartu Boarding Pass — Digital Farm ID & Eco-Insurance:**
   - **Header Card (Hijau Forest):** Label *"POLIS ASURANSI PERTANIAN"*, status *"AKTIF 🛡"*.
   - **Body Card (Putih):**
     - Kode Lahan Besar (misal: `DFID-SUB-0129`)
     - Masa Berlaku Polis & Mitra Penanggung Asuransi
     - Komoditas & Wilayah Geografis
     - Barcode / QR Code verifikasi keaslian digital
2. **Split Cards (Dua Kolom Metrik):**
   - **Kolom Kiri (Kondisi Cuaca & Risiko):** Suhu rata-rata `28°C`, curah hujan normal, status risiko rendah.
   - **Kolom Kanan (Circular Progress Gauge):**
     Indikator lingkaran persentase (seperti `87% Progress` di referensi) untuk **Skor Kesiapan Karbon (CRS)** dengan label *"Kesiapan Proyek Karbon"*.
3. **Checklist Kesiapan Karbon (*Action Checklist Card*):**
   - Ringkasan progres: *"4 dari 5 syarat terpenuhi"* dilengkapi progress bar horizontal.
   - Daftar centang hijau:
     - [x] Lahan memiliki rekam jejak minimal 2 musim
     - [x] Terlindungi polis asuransi aktif
     - [x] Praktik konservasi tanah terdokumentasi
     - [x] Bukti foto/timbangan terverifikasi
     - [ ] Persetujuan agregasi proyek korporat
4. **Tombol Aksi Utama:**
   - Tombol hijau full-width: *"Unduh Sertifikat Polis"* atau *"Ajukan Evaluasi Proyek"*.

---

## 4. Navigasi Bawah Terpadu (*Role-Based Bottom Navigation*)

Navigasi tingkat pertama diletakkan di Bottom Navigation Bar dengan 4–5 menu utama:

### 4.1 Untuk Petani (FARMER)
1. 🏠 **Beranda:** Dashboard ringkasan & aksi cepat
2. 🌾 **Lahan:** Daftar lahan & status proteksi
3. 🍃 **Karbon:** Kesiapan CRS & kandidat proyek karbon
4. 🎁 **Hadiah:** Poin reward, progres tier, & klaim keuntungan
5. 👤 **Profil:** Pengaturan akun & persetujuan data

### 4.2 Untuk Korporat (CORPORATE)
1. 🏠 **Beranda:** Ringkasan portofolio iklim & komitmen ESG
2. 🏢 **Ringkasan:** Agregat total luas (Ha), wilayah, dan estimasi kredit
3. 🍃 **Proyek:** Katalog kandidat proyek karbon teragregasi
4. 👤 **Profil:** Profil perusahaan & compliance

### 4.3 Untuk Admin (ADMIN)
1. 🏠 **Beranda:** Dashboard operasional & statistik verifikasi
2. 📋 **Review Data:** Antrean verifikasi bukti data lahan petani
3. 🍃 **Kelola Proyek:** Agregasi lahan & manajemen siklus proyek karbon
4. 👤 **Profil:** Akun auditor & log audit

---

## 5. Standar Bahasa & Interaksi

1. **Bahasa Konsisten:** 100% menggunakan Bahasa Indonesia yang baku, profesional, dan ramah pengguna agribisnis lokal.
2. **Micro-interactions:** Setiap kartu dan tombol memiliki status tekan (*pressed opacity/scale*) yang responsif.
3. **State Handling Sesuai PRD:**
   - **Loading:** Menggunakan skeleton berbentuk kartu/pil yang proporsional.
   - **Error:** Menyediakan pesan penjelasan dan tombol *"Coba Lagi"*.
   - **Empty:** Memberikan panduan aksi yang jelas (misal: *"Belum ada lahan? Daftarkan sekarang"*).
