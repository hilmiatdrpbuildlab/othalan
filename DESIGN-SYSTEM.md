# Othalan Design System — "Faena"

> **Versi** 1.0 · 17 Oktober 2026
> **Produk** Website company profile + CMS Othalan Ingeniería y Construcción (Chile)
> **Stack** SvelteKit (Svelte 5) · PostgreSQL (Neon) · Object Storage (S3‑compatible)
> **Bahasa UI** Español (Chile) — dokumen ini ditulis dalam Bahasa Indonesia, contoh copy UI dalam bahasa Spanyol.

"Faena" adalah istilah Chile untuk pekerjaan berat di lapangan. Nama ini merangkum identitas yang ingin dibangun: kerja keras di lapangan, presisi teknik sipil, dan hubungan yang dekat dengan klien.

---

## Daftar Isi

1. [Prinsip Desain](#1-prinsip-desain)
2. [Analisis Referensi & Aset](#2-analisis-referensi--aset)
3. [Sistem Warna](#3-sistem-warna)
4. [Tipografi](#4-tipografi)
5. [Spasi, Grid & Layout](#5-spasi-grid--layout)
6. [Radius, Border, Elevasi & Motion](#6-radius-border-elevasi--motion)
7. [Komponen UI](#7-komponen-ui)
   - 7.1 Buttons · 7.2 Cards · 7.3 Form Inputs · 7.4 Navigation (Header & Footer) · 7.5 Komponen pendukung
8. [Ikonografi](#8-ikonografi)
9. [Fotografi & Perlakuan Gambar](#9-fotografi--perlakuan-gambar)
10. [Pola Halaman](#10-pola-halaman)
11. [Arsitektur SvelteKit & Design Tokens](#11-arsitektur-sveltekit--design-tokens)
12. [Data Dinamis: Galeri, Media & Form](#12-data-dinamis-galeri-media--form)
13. [Aksesibilitas](#13-aksesibilitas)
14. [Checklist QA](#14-checklist-qa)

---

## 1. Prinsip Desain

| Prinsip | Arti dalam UI | Vibe merek yang diwakili |
|---|---|---|
| **Fondasi lebih dulu** (*Cimientos primero*) | Hierarki tegas, heading condensed tebal, blok warna solid, dan grid yang tidak pernah "melayang". | Profesional, Rugged |
| **Presisi terukur** (*Precisión medible*) | Semua jarak memakai skala 4/8 px, angka dan spesifikasi memakai font mono, dan garis bantu bergaya blueprint. | Precision & Engineering Excellence |
| **Bukti, bukan janji** (*Pruebas, no promesas*) | Foto proyek asli, statistik nyata, dan studi kasus. Stok foto generik dihindari. | Trustworthy & Reliable |
| **Terbuka untuk semua** (*Accesible para todos*) | Kontras minimal WCAG 2.2 AA, target sentuh ≥ 44 px, bahasa sederhana, dan form yang memaafkan kesalahan. | Accessible, Friendly |
| **Satu tim di lapangan** (*Un equipo en terreno*) | Wajah manusia (tim, pekerja dengan APD), nada bicara "kami/ustedes", dan WhatsApp sebagai kanal utama. | Collaborative & Community‑Centric |

**Nada copy:** langsung, hangat, dan teknis tanpa jargon berlebihan. Contoh: *"Te respondemos en menos de 24 horas"*, bukan *"Nuestro equipo multidisciplinario gestionará su requerimiento"*.

---

## 2. Analisis Referensi & Aset

### 2.1 Referensi Dribbble — "Concrete contractor website design" (FleexStudio)

Pola yang **diadopsi**:

- **Hero full‑bleed** dengan foto pekerjaan gelap, overlay gradien, dan headline **UPPERCASE condensed** tiga baris. Satu kata ditonjolkan dengan warna aksen (contoh: "RELIABLE **CONCRETE**").
- **Navbar berbentuk pill yang melayang** di atas hero. Menu terbagi kiri–kanan dengan logo di tengah, plus CTA telepon berbentuk pill berwarna aksen.
- **Tiga feature card semi‑transparan** (glass) di dasar hero.
- **Eyebrow label** kecil dengan bullet aksen (`• Nuestros servicios`) di atas setiap judul section.
- **Daftar bernomor besar** (01–04) untuk alasan memilih perusahaan dan **stepper proses 4 tahap**.
- **Badge statistik** blok aksen ("25+ Años de experiencia") yang menumpuk di atas foto.
- **Grid proyek bento**: satu kartu besar dan beberapa kartu kecil, dengan tombol panah melingkar.
- Section berselang antara putih dan abu‑abu sangat terang, serta **logo klien** dalam strip.

Penyesuaian untuk **Othalan**:

- Aksen oranye pada referensi diganti **Amarillo Faena** (kuning logo) sebagai warna primer. Oranye diturunkan menjadi **Cobre Atacama** (tembaga) sebagai aksen sekunder.
- Cakupan lebih luas dari beton: struktur baja, montaje industrial, obras civiles, dan mantención.
- Ditambah elemen "teknik": grid blueprint, angka mono, dan garis ukur (*cotas*).

### 2.2 Aset di folder

| Aset | Pengamatan | Implikasi desain |
|---|---|---|
| `assets/logo.jpg` | Roda gigi kuning lemon `#F9E70E`, lingkaran hitam `#0B0D0C`, ikon busur konsentris, wordmark serif kapital, latar krem `#F9F6F1`. | Kuning dan hitam menjadi DNA warna, krem menjadi latar netral hangat, dan busur konsentris dipakai sebagai motif grafis. **Logo perlu di‑vektorkan (SVG)** dan diberi versi horizontal + monokrom (lihat §9.6). |
| `assets/works/*.jpg` | Bengkel baja dengan kolom kuning, pekerja berompi oranye dan APD lengkap, cahaya matahari keras, forklift, plate compactor. | Foto asli sudah "on‑brand": kuning struktur + oranye rompi. Pertahankan warna natural dan perbaiki eksposur. Satu foto berorientasi portrait 9:16 (asal ponsel), jadi perlu aturan crop. |
| Foto tim (3 orang) | Gerente General, Head of Operations, Head of Business Development. | Kartu tim dengan rasio 4:5 dan latar seragam (§9.5). |

### 2.3 Website lama (othalan.cl)

Menu yang perlu dipertahankan: **Servicios · Nosotros · Proyectos · Contacto** + WhatsApp. Kategori proyek: **Construcción · Industria · Montaje · Mantención · Obras civiles**. Pesan kunci: *trato directo con el dueño, respuesta en terreno 24/7, seguridad, calidad, cumplimiento*.

> ⚠️ Di situs lama, penghitung statistik menampilkan "0" dan kredit footer bukan milik Othalan. Pada situs baru, statistik **wajib diambil dari CMS** dan disembunyikan bila nilainya kosong (§12.4).

---

## 3. Sistem Warna

Palet terinspirasi oleh lanskap dan industri Chile: **kuning keselamatan kerja** (logo), **baja karbon** (struktur besi), **tembaga Gurun Atacama** (industri ikonik Chile), **hormigón/beton** (abu‑abu hangat), **Pasifik**, **araucaria**, dan **copihue** (bunga nasional) untuk warna semantik.

### 3.1 Primer — Amarillo Faena (kuning logo)

Energi, keselamatan, dan visibilitas, seperti kolom baja kuning di lokasi kerja.

| Token | HEX | Kegunaan |
|---|---|---|
| `yellow-50` | `#FFFDE6` | Latar highlight sangat lembut |
| `yellow-100` | `#FFF9BF` | Latar badge / alert info merek |
| `yellow-200` | `#FFF38A` | Selection (`::selection`) |
| `yellow-300` | `#FCEB4D` | Hover pada latar gelap |
| `yellow-400` | `#F9E70E` | **Warna logo asli**, hanya untuk logo & ilustrasi |
| **`yellow-500`** | **`#F2D200`** | **Primer UI**: tombol utama, badge statistik, garis aksen |
| `yellow-600` | `#D4AE00` | Hover tombol primer |
| `yellow-700` | `#A38300` | Pressed / active |
| `yellow-800` | `#6E5800` | Teks di atas `yellow-100` |
| `yellow-900` | `#3D3100` | Teks gelap kekuningan (jarang dipakai) |

> **Aturan emas kuning:** kuning **tidak boleh dipakai untuk teks atau ikon di atas latar terang** (kontras `#F2D200` pada putih hanya ≈ 1,5 : 1). Kuning dipakai sebagai **bidang isi (fill)** dengan teks Carbón di atasnya (12,99 : 1), atau sebagai **teks/garis di atas latar gelap** (`#F2D200` pada `#15181A` = 11,89 : 1).

### 3.2 Sekunder — Acero Carbón (baja karbon / hitam logo)

Ketangguhan, struktur, dan otoritas. Dipakai untuk hero overlay, footer, section gelap, dan teks utama.

| Token | HEX | Kegunaan |
|---|---|---|
| `carbon-950` | `#0B0D0C` | Hitam logo, teks di atas kuning |
| **`carbon-900`** | **`#15181A`** | **Latar gelap utama** (footer, section dark) |
| `carbon-800` | `#1F2326` | Kartu di atas latar gelap |
| `carbon-700` | `#2C3135` | Border di latar gelap, hover surface gelap |
| `carbon-600` | `#3E454A` | Divider di latar gelap |
| `carbon-500` | `#5B646B` | Ikon sekunder di latar gelap |

### 3.3 Aksen — Cobre Atacama (tembaga)

Kehangatan, unsur manusia, dan kebanggaan industri Chile. Menggantikan peran oranye pada referensi Dribbble, tetapi dipakai **hemat** (≤ 5 % area layar).

| Token | HEX | Kegunaan |
|---|---|---|
| `copper-100` | `#F8E6DA` | Latar tag kategori |
| `copper-400` | `#E0814F` | Teks/ikon aksen **di latar gelap** (6,3 : 1 pada `carbon-900`) |
| `copper-500` | `#C8642F` | Fill dekoratif, garis ukur, ilustrasi (bukan untuk teks kecil) |
| **`copper-600`** | **`#A84F22`** | **Teks aksen di latar terang** (kata yang ditonjolkan di heading, link) — 5,52 : 1 pada putih |
| `copper-700` | `#873E1A` | Hover link |

### 3.4 Netral — Hormigón (beton hangat)

Abu‑abu dengan undertone hangat yang selaras dengan krem latar logo, sehingga tidak terasa "dingin korporat".

| Token | HEX | Kegunaan | Kontras vs putih |
|---|---|---|---|
| `white` | `#FFFFFF` | Kartu, input | — |
| `concrete-25` | `#FAF8F4` | **Latar halaman utama** (krem logo) | — |
| `concrete-50` | `#F3F1EC` | Latar section berselang | — |
| `concrete-100` | `#E8E5DF` | Latar input disabled, skeleton | — |
| `concrete-200` | `#D6D2CA` | Border default | — |
| `concrete-300` | `#B9B4AA` | Border hover, divider tegas | — |
| `concrete-400` | `#948F85` | Placeholder (dekoratif saja, 3,22 : 1) | 3,22 |
| `concrete-500` | `#736F66` | Teks bantu / caption | 5,01 ✅ |
| `concrete-600` | `#5A5750` | Teks sekunder | 6,79 ✅ |
| `concrete-700` | `#45433E` | Label form | 9,88 ✅ |
| `concrete-800` | `#2F2E2B` | Body text alternatif | — |
| `concrete-900` | `#1C1B19` | **Body text utama** | 16,2 ✅ |

### 3.5 Semantik

| Status | Nama | Fill / teks | Latar lembut | Border | Kontras teks putih |
|---|---|---|---|---|---|
| **Sukses** | Verde Araucaria | `#2E7D4F` | `#E6F2EB` | `#9CCBAE` | 5,05 : 1 ✅ |
| **Error** | Rojo Copihue | `#C62E2E` | `#FBE9E9` | `#EDA5A5` | 5,48 : 1 ✅ |
| **Peringatan** | Ámbar Faena | `#A35F00` | `#FFF3DC` | `#F2C46D` | 5,01 : 1 ✅ |
| **Info** | Azul Pacífico | `#1F5F8B` | `#E4EFF7` | `#9DC1DB` | 6,84 : 1 ✅ |

> Peringatan sengaja dibuat **ámbar gelap**, bukan kuning, agar tidak tertukar dengan warna merek. Status selalu disertai **ikon + teks**, tidak hanya warna.

### 3.6 Peran warna (semantic aliases)

Komponen **hanya** boleh mereferensikan alias berikut, bukan token mentah. Dengan begitu tema (mis. section gelap) bisa ditukar tanpa menyentuh komponen.

| Alias | Light (default) | Dark section (`data-theme="dark"`) |
|---|---|---|
| `--color-bg` | `concrete-25` | `carbon-900` |
| `--color-bg-alt` | `concrete-50` | `carbon-950` |
| `--color-surface` | `white` | `carbon-800` |
| `--color-surface-raised` | `white` + shadow | `carbon-700` |
| `--color-text` | `concrete-900` | `#F3F1EC` |
| `--color-text-muted` | `concrete-600` | `concrete-300` |
| `--color-text-subtle` | `concrete-500` | `concrete-400` |
| `--color-border` | `concrete-200` | `carbon-700` |
| `--color-border-strong` | `concrete-300` | `carbon-600` |
| `--color-brand` | `yellow-500` | `yellow-500` |
| `--color-on-brand` | `carbon-950` | `carbon-950` |
| `--color-accent-text` | `copper-600` | `copper-400` |
| `--color-focus` | `#1F5F8B` (Azul Pacífico) | `yellow-300` |

### 3.7 Proporsi pemakaian (60‑30‑10)

```
████████████████████████████████████  60 %  Hormigón (concrete-25/50, white)
██████████████████                    30 %  Acero Carbón (teks, hero, footer, section gelap)
██████                                ~8 %  Amarillo Faena (CTA, badge, garis aksen)
█                                     ~2 %  Cobre Atacama (kata highlight, tag, detail)
```

### 3.8 Matriks kontras (sudah diverifikasi)

| Kombinasi | Rasio | Status |
|---|---|---|
| `carbon-950` di atas `yellow-500` | 12,99 : 1 | AAA |
| `carbon-950` di atas `yellow-600` (hover) | 9,15 : 1 | AAA |
| `yellow-500` di atas `carbon-900` | 11,89 : 1 | AAA |
| `concrete-900` di atas `concrete-25` | 16,23 : 1 | AAA |
| `concrete-600` di atas `concrete-25` | 6,79 : 1 | AA |
| `copper-600` di atas `white` | 5,52 : 1 | AA |
| `copper-400` di atas `carbon-900` | 6,30 : 1 | AA |
| `concrete-300` di atas `carbon-900` | 8,64 : 1 | AAA |
| `yellow-500` di atas `white` | ≈ 1,5 : 1 | ❌ Dilarang |
| `concrete-400` (placeholder) di atas `white` | 3,22 : 1 | Hanya dekoratif |

---

## 4. Tipografi

### 4.1 Pasangan font

| Peran | Font | Alasan |
|---|---|---|
| **Display & Heading** | **Barlow Condensed** (600, 700, 800) | Terinspirasi rambu jalan raya dan papan proyek. Proporsi condensed memberi kesan **kolom baja yang tegak dan padat**, mirip headline referensi, tetapi lebih teknis daripada Oswald/Bebas dan mendukung aksen Spanyol (á é í ó ú ñ ü ¿ ¡). |
| **Body & UI** | **Inter** (400, 500, 600) | Sangat terbaca di layar kecil, tersedia sebagai variable font, angka tabular tersedia (`font-feature-settings: "tnum"`), dan netral sehingga tidak bersaing dengan heading. |
| **Data teknis** | **JetBrains Mono** (500) | Untuk spesifikasi (toneladas, m², kode proyek "OTH‑2026‑014"), memberi nuansa gambar kerja/engineering. |

**Pemuatan font (SvelteKit):** self‑host dengan `@fontsource/barlow-condensed`, `@fontsource-variable/inter`, dan `@fontsource/jetbrains-mono`. Subset `latin` + `latin-ext`, `font-display: swap`, dan preload hanya **Barlow Condensed 700** + **Inter variable** di `app.html`.

```css
--font-display: "Barlow Condensed", "Arial Narrow", "Roboto Condensed", sans-serif;
--font-body: "Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Consolas, monospace;
```

### 4.2 Skala tipe

Basis **16 px**. Heading memakai rasio **≈ 1,25 (Major Third)** di mobile dan **≈ 1,333 (Perfect Fourth)** di desktop. Hasilnya, heading tampil **berat dan kokoh di bawah**, seperti fondasi, sementara body tetap tenang. Ukuran heading **fluid** dengan `clamp()` antara viewport 360 px → 1280 px.

| Token | Font | Mobile → Desktop | `clamp()` | Line‑height | Weight | Case / tracking |
|---|---|---|---|---|---|---|
| `display-2xl` | Barlow Cond. | 44 → 80 px | `clamp(2.75rem, 1.87rem + 3.91vw, 5rem)` | 0.95 | 800 | UPPER · −0.01em |
| `display-xl` | Barlow Cond. | 40 → 64 px | `clamp(2.5rem, 1.913rem + 2.61vw, 4rem)` | 1.0 | 700 | UPPER · −0.005em |
| `h1` | Barlow Cond. | 34 → 52 px | `clamp(2.125rem, 1.685rem + 1.96vw, 3.25rem)` | 1.05 | 700 | UPPER · 0 |
| `h2` | Barlow Cond. | 30 → 40 px | `clamp(1.875rem, 1.63rem + 1.09vw, 2.5rem)` | 1.1 | 700 | UPPER · 0 |
| `h3` | Barlow Cond. | 26 → 32 px | `clamp(1.625rem, 1.478rem + 0.652vw, 2rem)` | 1.15 | 600 | Title Case · 0.005em |
| `h4` | Barlow Cond. | 21 → 24 px | `clamp(1.312rem, 1.239rem + 0.326vw, 1.5rem)` | 1.2 | 600 | Title Case · 0.01em |
| `h5` | Barlow Cond. | 18 → 20 px | `clamp(1.125rem, 1.076rem + 0.217vw, 1.25rem)` | 1.25 | 600 | UPPER · 0.04em |
| `eyebrow` | Barlow Cond. | 15 px | — | 1.2 | 600 | UPPER · 0.12em |
| `body-lg` | Inter | 17 → 18 px | `clamp(1.062rem, 1.038rem + 0.109vw, 1.125rem)` | 1.65 | 400 | — |
| `body` | Inter | 16 px | — | 1.6 | 400 | — |
| `body-sm` | Inter | 14 px | — | 1.55 | 400 | — |
| `label` | Inter | 14 px | — | 1.3 | 600 | — |
| `button` | Inter | 15 px (16 di `lg`) | — | 1 | 600 | 0.01em |
| `caption` | Inter | 12 px | — | 1.4 | 500 | 0.02em |
| `stat` | Barlow Cond. | 48 → 72 px | `clamp(3rem, 2.4rem + 2.6vw, 4.5rem)` | 1 | 800 | `tnum` |
| `mono` | JetBrains Mono | 13–14 px | — | 1.5 | 500 | 0.02em |

### 4.3 Aturan tipografi

- **Panjang baris** body: 60–75 karakter (`max-width: 68ch`).
- **Heading UPPERCASE** maksimal 3 baris di desktop dan 4 baris di mobile. Untuk heading lebih panjang, pakai Title Case `h3`.
- **Kata highlight** di heading memakai `<mark class="hl">`: warna `--color-accent-text` di latar terang, `yellow-500` di latar gelap/hero. Batasi **1 frasa per heading**.
  > Contoh: `CONSTRUIMOS <mark>INFRAESTRUCTURA</mark> QUE PERDURA.`
- **Eyebrow** selalu diawali bullet persegi 6 px warna `yellow-500` (di latar terang beri outline `carbon-950` 1 px) atau garis 24 px.
- Angka statistik dan data teknis memakai `font-variant-numeric: tabular-nums`.
- Format Chile: pemisah ribuan titik (`1.250 m²`), desimal koma (`3,5 t`), tanggal `17-10-2026`. Gunakan `Intl.NumberFormat('es-CL')`.
- Jangan memakai heading condensed untuk paragraf atau teks < 15 px.

---

## 5. Spasi, Grid & Layout

### 5.1 Skala spasi (basis 4 px, ritme utama 8 px)

| Token | px | rem | Kegunaan khas |
|---|---|---|---|
| `space-0` | 0 | 0 | — |
| `space-0.5` | 2 | 0.125 | Offset focus ring |
| `space-1` | 4 | 0.25 | Jarak ikon ↔ teks kecil |
| `space-2` | 8 | 0.5 | Gap chip, padding badge |
| `space-3` | 12 | 0.75 | Padding input vertikal, gap ikon tombol |
| `space-4` | 16 | 1 | Padding kartu mobile, gutter mobile |
| `space-5` | 20 | 1.25 | Padding tombol horizontal |
| `space-6` | 24 | 1.5 | Gutter tablet, padding kartu |
| `space-8` | 32 | 2 | Gutter desktop, jarak antar field group |
| `space-10` | 40 | 2.5 | Jarak heading → konten |
| `space-12` | 48 | 3 | Padding kartu besar |
| `space-16` | 64 | 4 | Padding section mobile |
| `space-20` | 80 | 5 | Padding section tablet |
| `space-24` | 96 | 6 | Padding section desktop |
| `space-32` | 128 | 8 | Padding hero / section unggulan |

**Ritme vertikal section:** `padding-block: clamp(4rem, 2.4rem + 6.9vw, 8rem)` (64 → 128 px).
**Stack konten:** eyebrow → (8) → heading → (16–24) → lead → (40) → konten.

### 5.2 Breakpoints

| Nama | Min‑width | Target |
|---|---|---|
| `xs` | 0 | Ponsel kecil (360) |
| `sm` | 480 px | Ponsel besar |
| `md` | 768 px | Tablet portrait |
| `lg` | 1024 px | Tablet landscape / laptop kecil |
| `xl` | 1280 px | Desktop |
| `2xl` | 1536 px | Layar lebar (konten tetap terkunci 1280) |

### 5.3 Grid responsif

| Breakpoint | Kolom | Gutter | Margin luar | Lebar kontainer |
|---|---|---|---|---|
| Mobile `< 768` | **4** | 16 px | 16 px (20 px ≥ 480) | fluid |
| Tablet `768–1023` | **8** | 24 px | 32 px | fluid |
| Desktop `≥ 1024` | **12** | 32 px | 48 px (64 px ≥ 1280) | **max 1280 px** |
| Wide `≥ 1536` | 12 | 32 px | auto | 1280 px (konten), media full‑bleed boleh 1440 |

```css
.container {
  width: 100%;
  max-width: calc(var(--container-max) + 2 * var(--page-margin));
  margin-inline: auto;
  padding-inline: var(--page-margin);
}
.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
  column-gap: var(--grid-gutter);
}
```

**Lebar kontainer khusus:**

- `--container-max: 1280px` untuk layout umum
- `--container-narrow: 768px` untuk artikel, kebijakan, form panjang
- `--container-form: 640px` untuk form satu kolom

### 5.4 Pola layout umum (desktop 12 kolom)

| Pola | Pembagian |
|---|---|
| Hero | Konten teks 7 kol, panel kosong 5 kol (foto full‑bleed di belakang) |
| Teks + gambar | 5 / 7 atau 6 / 6, gambar boleh "bleed" ke tepi layar |
| Layanan | 4 kartu × 3 kol (tablet 2 × 4 kol, mobile 1 × 4 kol) |
| Proyek bento | 1 kartu 6 kol × 2 baris + 4 kartu 3 kol |
| Galeri | 3 kol (desktop), 2 (tablet), 1–2 (mobile) |
| Form RFQ | Form 7 kol + panel kontak/sticky 4 kol (offset 1) |
| Tim | 3 kartu × 4 kol |

### 5.5 Elemen visual "presisi teknik"

- **Grid blueprint:** latar section tertentu boleh memakai pola garis 1 px `rgb(21 24 26 / 0.04)` tiap 32 px, mengikuti kelipatan 8.
- **Garis ukur (cota):** dekorasi garis horizontal dengan dua tick vertikal di ujungnya (warna `copper-500`), dipakai di bawah statistik atau di samping heading section.
- **Penomoran section** mono kecil (`01 / Servicios`) di pojok kiri atas section besar.

---

## 6. Radius, Border, Elevasi & Motion

### 6.1 Radius

Radius kecil hingga sedang menjaga kesan "baja yang dipotong presisi", sementara tombol pill mengikuti referensi dan memberi rasa ramah.

| Token | Nilai | Pemakaian |
|---|---|---|
| `radius-none` | 0 | Gambar full‑bleed, garis aksen |
| `radius-xs` | 2 px | Checkbox, tag mono |
| `radius-sm` | 4 px | Badge, chip filter persegi |
| `radius-md` | 8 px | **Input**, dropdown, tooltip |
| `radius-lg` | 12 px | **Kartu**, gambar dalam kartu |
| `radius-xl` | 20 px | Hero frame, navbar pill di desktop, modal |
| `radius-full` | 9999 px | **Tombol**, avatar, ikon bulat |

### 6.2 Border

- `border-1`: 1 px `--color-border` (default)
- `border-2`: 2 px untuk focus/aksen tegas (outline button, input aktif)
- **Garis aksen merek:** `border-top: 4px solid var(--yellow-500)` pada kartu fitur atau footer, terinspirasi pita pembatas lokasi kerja.

### 6.3 Elevasi (shadow hangat, bukan abu kebiruan)

| Token | Nilai | Pemakaian |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgb(28 27 25 / 0.06)` | Input |
| `shadow-sm` | `0 2px 6px rgb(28 27 25 / 0.08)` | Kartu default |
| `shadow-md` | `0 8px 24px -6px rgb(28 27 25 / 0.14)` | Kartu hover, navbar sticky |
| `shadow-lg` | `0 20px 48px -12px rgb(28 27 25 / 0.22)` | Modal, lightbox, dropdown mega |
| `shadow-brand` | `0 0 0 4px rgb(242 210 0 / 0.35)` | Glow tombol primer saat focus/hover di latar gelap |

### 6.4 Motion

| Token | Nilai | Pemakaian |
|---|---|---|
| `duration-fast` | 120 ms | Hover warna, pressed |
| `duration-base` | 200 ms | Transisi umum, dropdown |
| `duration-slow` | 360 ms | Drawer mobile, lightbox |
| `duration-reveal` | 600 ms | Reveal saat scroll (sekali) |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default |
| `ease-emphasized` | `cubic-bezier(0.3, 0, 0, 1.2)` | Panah tombol bergeser |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elemen keluar |

- Gerak **mekanis dan pendek**: geser 4–8 px dan fade. Tanpa bounce berlebihan.
- Penghitung statistik boleh *count‑up* sekali saat masuk viewport.
- Wajib menghormati `prefers-reduced-motion: reduce`: matikan reveal, count‑up, parallax, dan autoplay.

---

## 7. Komponen UI

**Konvensi state** untuk semua komponen interaktif:

| State | Selector | Prinsip |
|---|---|---|
| Default | — | — |
| Hover | `:hover` (hanya `@media (hover: hover)`) | Perubahan warna ±1 step + mikro‑gerak |
| Focus‑visible | `:focus-visible` | Ring 2 px `--color-focus` + offset 2 px. **Tidak pernah dihapus.** |
| Active / Pressed | `:active`, `[aria-pressed="true"]` | Warna −2 step, `translateY(1px)` |
| Disabled | `:disabled`, `[aria-disabled="true"]` | Opacity tidak dipakai sendirian; warna khusus + `cursor: not-allowed` |
| Loading | `[data-loading]` | Spinner + label tetap ada (`aria-busy="true"`) |

### 7.1 Buttons

**Anatomi** (mengikuti referensi): `[ label ][ ◯→ ]`. Tombol berbentuk pill, dan varian `primary` / `secondary` boleh memiliki **ikon panah dalam lingkaran** di kanan (*trailing icon chip*) yang bergeser 4 px ke kanan saat hover.

**Ukuran**

| Size | Tinggi | Padding‑x | Font | Ikon | Gap |
|---|---|---|---|---|---|
| `sm` | 36 px | 16 px | 14 / 600 | 16 px | 8 px |
| `md` (default) | 48 px | 24 px | 15 / 600 | 20 px | 12 px |
| `lg` | 56 px | 28 px | 16 / 600 | 20 px (chip 36 px) | 12 px |

Di mobile tinggi minimum 44 px (`sm` dinaikkan hit‑area dengan pseudo‑element). Tombol CTA utama di mobile boleh `width: 100%`.

#### Primary — "Solicitar cotización"

Satu per viewport. Untuk aksi konversi (RFQ, kirim form).

| State | Background | Teks | Border | Ekstra |
|---|---|---|---|---|
| Default | `yellow-500` `#F2D200` | `carbon-950` `#0B0D0C` | none | Chip ikon: bg `carbon-950`, ikon `yellow-500` |
| Hover | `yellow-600` `#D4AE00` | `carbon-950` | none | Chip `translateX(4px)`, `shadow-md` |
| Focus‑visible | `yellow-500` | `carbon-950` | — | Ring 2 px `#1F5F8B` offset 2 px (di gelap: `yellow-300`) |
| Active | `yellow-700` `#A38300` | `carbon-950` | none | `translateY(1px)`, tanpa shadow |
| Disabled | `concrete-100` `#E8E5DF` | `concrete-500` `#736F66` | 1 px `concrete-200` | Chip abu, tanpa hover |
| Loading | `yellow-500` | `carbon-950` | — | Chip berisi spinner, label "Enviando…" |

#### Secondary — "Ver proyectos"

Aksi pendamping yang padat dan kontras.

| State | Background | Teks | Border |
|---|---|---|---|
| Default | `carbon-900` `#15181A` | `#FFFFFF` | none; chip: bg `yellow-500`, ikon `carbon-950` |
| Hover | `carbon-700` `#2C3135` | `#FFFFFF` | — |
| Focus‑visible | `carbon-900` | `#FFFFFF` | ring `#1F5F8B` |
| Active | `carbon-950` | `#FFFFFF` | — |
| Disabled | `concrete-100` | `concrete-500` | 1 px `concrete-200` |

> Di **latar gelap/hero**, Secondary dibalik menjadi bg `#FFFFFF`, teks `carbon-950`, hover `concrete-50`.

#### Outline — "Descargar brochure"

Aksi tersier atau di dalam kartu.

| State | Background | Teks | Border |
|---|---|---|---|
| Default | transparent | `--color-text` | 2 px `carbon-900` (di gelap: 2 px `#FFFFFF` / 60 %) |
| Hover | `carbon-900` | `#FFFFFF` | 2 px `carbon-900` |
| Focus‑visible | transparent | `--color-text` | + ring focus |
| Active | `carbon-950` | `#FFFFFF` | 2 px `carbon-950` |
| Disabled | transparent | `concrete-400` | 2 px `concrete-200` |

#### Text / Link button — "Conoce más →"

| State | Teks | Dekorasi |
|---|---|---|
| Default | `--color-accent-text` (`copper-600`) · 600 | Panah 16 px; underline 0 |
| Hover | `copper-700` | Underline 2 px offset 4 px, panah geser 4 px |
| Focus‑visible | `copper-600` | Ring focus radius 4 px |
| Active | `copper-700` | — |
| Disabled | `concrete-400` | Tanpa panah animasi |

#### Varian khusus

- **WhatsApp:** bg `#FFFFFF`, border `concrete-200`, ikon WhatsApp warna asli `#25D366` dengan label teks "WhatsApp". Hover memakai bg `concrete-50`. *(Hijau WA tidak dipakai sebagai fill penuh agar tidak bentrok dengan palet.)*
- **Icon button** (lingkaran 40/48 px): untuk panah kartu, tutup modal, dan navigasi lightbox. Wajib `aria-label`.
- **Phone pill** di navbar (referensi): bg `yellow-500`, ikon telepon dalam lingkaran `carbon-950`, teks mono `+56 9 XXXX XXXX`.

#### Svelte API — `Button.svelte`

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

  type Props = {
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    size?: 'sm' | 'md' | 'lg';
    href?: string;              // jika ada, render <a>
    iconChip?: boolean;         // panah dalam lingkaran
    icon?: Snippet;             // ikon custom (default: ArrowRight)
    loading?: boolean;
    fullWidth?: boolean;
    tone?: 'light' | 'dark';    // konteks latar
    children: Snippet;
  } & HTMLButtonAttributes & HTMLAnchorAttributes;

  let { variant = 'primary', size = 'md', href, iconChip = variant !== 'text',
        loading = false, fullWidth = false, tone = 'light', icon, children, ...rest }: Props = $props();
</script>
```

Kelas: `.btn .btn--{variant} .btn--{size}` + `data-tone`. Semua warna diambil dari custom property komponen (`--btn-bg`, `--btn-fg`, `--btn-border`) yang di‑set per varian/state agar mudah di‑override.

---

### 7.2 Cards

#### 7.2.1 Project Card — portofolio proyek

Kartu utama untuk galeri proyek infrastruktur dan struktur baja. Gambar dominan, data ringkas, dan terasa seperti **lembar gambar kerja**.

```
┌───────────────────────────────────────┐
│ [OBRAS CIVILES]              ◯ →      │  ← tag kategori + icon button (overlay)
│                                       │
│          FOTO 4:3 (atau 16:10)        │
│ ▓▓▓▓ gradien carbon 0→80 % ▓▓▓▓▓▓▓▓▓ │
│ OTH‑2026‑014 · Santiago, RM           │  ← mono 12px
│ NAVE INDUSTRIAL QUILICURA             │  ← h4 condensed UPPER putih
├───────────────────────────────────────┤  (varian "info‑below")
│ 1.250 m² │ 85 t acero │ 2026          │  ← spec strip mono, divider vertikal
└───────────────────────────────────────┘
```

| Properti | Nilai |
|---|---|
| Radius | `radius-lg` (12 px), gambar ikut terpotong (`overflow: hidden`) |
| Rasio gambar | Default **4:3**; bento besar **4:5** atau **1:1**; listing horizontal **16:10** |
| Overlay | `linear-gradient(180deg, rgb(11 13 12 / 0) 40%, rgb(11 13 12 / 0.85) 100%)` |
| Tag kategori | Pill `radius-sm`, bg `yellow-500`, teks `carbon-950`, caption 12/600 UPPER |
| Judul | `h4`, putih, maksimal 2 baris (`line-clamp: 2`) |
| Meta | `mono` 12 px, `concrete-200` |
| Spec strip | Opsional, bg `--color-surface`, 3 kolom mono dengan label caption |
| Padding konten | 20 px (mobile 16 px) |

| State | Perilaku |
|---|---|
| Default | `shadow-sm` |
| Hover | Gambar `scale(1.04)` dalam 360 ms; overlay +10 % lebih gelap; icon button bg `yellow-500` dan panah berputar −45°; `shadow-md` |
| Focus‑visible | Seluruh kartu adalah satu `<a>`, ring focus 3 px `yellow-500` + 1 px `carbon-950` di dalam (terlihat di atas foto) |
| Active | `scale(0.99)` |
| Loading | Skeleton rasio sama, `concrete-100` dengan shimmer (dimatikan pada reduced motion) |
| Disabled / Draft (CMS preview) | Badge "Borrador" `--warning`, gambar `grayscale(1)`, tanpa link |

#### 7.2.2 Service Card — layanan sipil

```
┌──────────────────────────────┐
│▀▀▀▀ garis atas 4px kuning ▀▀▀│  (muncul saat hover / aktif)
│  ┌────┐                      │
│  │ ⚙︎ │  ikon 32px dalam kotak 56px bg yellow-100
│  └────┘                      │
│  01                          │  ← mono, copper-600
│  MONTAJE INDUSTRIAL          │  ← h4 UPPER
│  Estructuras metálicas,      │  ← body-sm muted, max 3 baris
│  galpones y plataformas…     │
│                              │
│  Ver servicio →              │  ← text button
└──────────────────────────────┘
```

| State | Background | Border | Ekstra |
|---|---|---|---|
| Default | `--color-surface` | 1 px `--color-border` | Garis atas 4 px transparan |
| Hover | `--color-surface` | 1 px `concrete-300` | Garis atas `yellow-500` (`scaleX` 0→1 dari kiri), kotak ikon `yellow-500`, `translateY(-4px)`, `shadow-md` |
| Focus‑visible | — | ring focus | Sama seperti hover |
| Active | `concrete-50` | — | `translateY(0)` |
| Disabled | `concrete-50` | `concrete-200` | Ikon & teks `concrete-400`, tanpa link |

Varian **Dark** (section gelap): bg `carbon-800`, border `carbon-700`, ikon `yellow-500`, teks putih.

#### 7.2.3 Feature / Glass Card (hero)

Tiga kartu di dasar hero (referensi): bg `rgb(21 24 26 / 0.55)` + `backdrop-filter: blur(12px)`, border 1 px `rgb(255 255 255 / 0.14)`, judul `h5` putih dengan bullet kuning, deskripsi `body-sm` `concrete-200`. Fallback tanpa `backdrop-filter` memakai bg `rgb(21 24 26 / 0.85)`.

#### 7.2.4 Stat Card / Badge

Blok `yellow-500` dengan angka `stat` (`carbon-950`) dan label caption UPPER. Contoh: **"15+" Años de experiencia**. Boleh menumpuk di sudut foto (offset −24 px). **Disembunyikan bila nilai CMS kosong atau 0.**

#### 7.2.5 Team Card

Foto **4:5**, radius 12, nama `h4`, jabatan `body-sm` muted (ES: *Gerente General*, *Jefe de Operaciones*, *Jefa de Desarrollo de Negocios*), serta ikon LinkedIn/email (icon button 40 px). Hover: foto dari `grayscale(0.2)` ke warna penuh, garis bawah kuning 4 px muncul.

#### 7.2.6 Testimonial Card & Process Step

- **Testimonial:** kutipan `body-lg`, tanda kutip besar `yellow-500` dekoratif (`aria-hidden`), nama + perusahaan klien + logo kecil. Hanya testimoni **nyata** dari CMS.
- **Process step (stepper 4 tahap):** lingkaran nomor 40 px (`carbon-900`, aktif `yellow-500`) dihubungkan garis 2 px dash. Kartu aktif mendapat border 2 px `yellow-500`. Tahap: *Evaluación técnica → Planificación → Ejecución en terreno → Entrega y mantención*.

---

### 7.3 Form Inputs

Dipakai di **Formulario de contacto** dan **Solicitud de cotización / licitación** (RFQ multi‑langkah).

#### 7.3.1 Anatomi field

```
Nombre de la empresa *                ← label 14/600 concrete-700 (+ "*" rojo, + teks "(obligatorio)" sr-only)
┌──────────────────────────────────┐
│ 🏢  Ej: Constructora Andes SpA   │  ← input 48px, ikon leading opsional
└──────────────────────────────────┘
Razón social según el SII.           ← helper 13px concrete-500
```

| Properti | Nilai |
|---|---|
| Tinggi | 48 px (`sm` 40 px hanya untuk filter CMS) |
| Padding | 12 px × 16 px (dengan ikon: kiri 44 px) |
| Radius | `radius-md` 8 px |
| Font input | Inter 16 px (**minimal 16 px** agar iOS tidak auto‑zoom) |
| Gap label → input | 6 px; input → helper 6 px; antar field 24 px; antar fieldset 40 px |
| Label | Selalu terlihat di atas field (**tidak memakai floating label / placeholder‑as‑label**) |

#### 7.3.2 States

| State | Background | Border | Teks | Ekstra |
|---|---|---|---|---|
| Default | `#FFFFFF` | 1 px `concrete-300` | `concrete-900` | Placeholder `concrete-400` |
| Hover | `#FFFFFF` | 1 px `concrete-500` | — | — |
| Focus | `#FFFFFF` | 2 px `carbon-900` | — | Ring luar `0 0 0 4px rgb(242 210 0 / 0.45)` (halo kuning) |
| Filled | `#FFFFFF` | 1 px `concrete-300` | `concrete-900` | — |
| Error | `#FFFFFF` | 2 px `#C62E2E` | — | Ikon ⚠ di kanan, pesan 13 px `#C62E2E` dengan ikon, `aria-invalid="true"`, `aria-describedby` |
| Success | `#FFFFFF` | 1 px `#2E7D4F` | — | Ikon ✓ hijau (hanya untuk validasi format penting, mis. RUT) |
| Disabled | `concrete-100` | 1 px `concrete-200` | `concrete-500` | `cursor: not-allowed` |
| Read‑only | `concrete-50` | 1 px dashed `concrete-300` | `concrete-700` | Untuk ringkasan RFQ |

#### 7.3.3 Jenis input

| Komponen | Spesifikasi |
|---|---|
| `TextField` | text, email, tel, url, number. Mendukung prefix/suffix (`+56`, `m²`, `CLP`). |
| `Textarea` | Min 4 baris, auto‑grow sampai 12, penghitung karakter `0 / 1000` di kanan bawah. |
| `Select` | Native `<select>` dengan chevron custom 20 px. Untuk **Región** (16 regiones de Chile) → **Comuna** (tergantung región). |
| `Combobox` | Pencarian komuna (≥ 346 opsi), ARIA combobox pattern. |
| `Checkbox` / `Radio` | 20 px, radius 4 / bulat, checked bg `carbon-900` + centang `yellow-500`; area klik seluruh label (min 44 px). |
| `RadioCard` | Pilihan tipe layanan sebagai kartu (ikon + judul + deskripsi), selected border 2 px `yellow-500` + bg `yellow-50`. |
| `Chip` (multi‑select) | Sektor: *Construcción, Industria, Montaje, Mantención, Obras civiles*. Selected bg `carbon-900` teks putih. |
| `DateField` | Native `type="date"` + teks bantu "Fecha estimada de inicio". |
| `FileDropzone` | Area 160 px, border 2 px dashed `concrete-300`. Hover/drag‑over: border `yellow-600`, bg `yellow-50`. Menerima **PDF, DWG, DXF, JPG, PNG, XLSX**, maks 25 MB/file, 10 file. Tiap file menampilkan nama, ukuran, progress bar `yellow-500`, dan tombol hapus; error per file. |
| `Switch` | (CMS) 44 × 24 px, on = `carbon-900` + knob kuning. |

#### 7.3.4 Validasi khas Chile

| Field | Aturan | Format tampilan |
|---|---|---|
| **RUT** empresa / persona | Validasi dígito verificador (módulo 11) | `76.123.456-K` (auto‑format saat blur) |
| **Teléfono** | Mobile `+56 9 XXXX XXXX`, fijo `+56 2 XXXX XXXX` | Prefix `+56` tetap |
| **Email** | RFC 5322 sederhana + cek typo domain umum | — |
| **Presupuesto** | Rentang (select) dalam **CLP** atau **UF** | `$ 25.000.000` / `UF 1.000` |

Validasi dijalankan **on blur** dan **on submit** (bukan setiap ketikan). Server‑side validation di SvelteKit form actions memakai skema yang sama (mis. Valibot/Zod) agar error konsisten.

#### 7.3.5 Form RFQ multi‑langkah — "Solicitud de cotización"

```
[1 Contacto] ── [2 Proyecto] ── [3 Detalles & archivos] ── [4 Revisión]
```

1. **Contacto:** nombre, empresa, RUT (opsional), cargo, email, teléfono, preferencia kontak (Email / Teléfono / WhatsApp).
2. **Proyecto:** tipo de servicio (RadioCard), sektor (Chips), región + comuna, fecha estimada, ¿licitación pública/privada? (Radio), nº de licitación (kondisional).
3. **Detalles & archivos:** descripción, alcance estimado (m², toneladas), rango presupuesto, upload planos/EETT/bases.
4. **Revisión:** ringkasan read‑only per langkah dengan tombol "Editar", checkbox consentimiento (Ley 19.628 / Ley 21.719 sobre protección de datos), tombol **Enviar solicitud**.

**Aturan:**

- Progress stepper selalu terlihat; di mobile berupa bar + "Paso 2 de 4".
- Data per langkah disimpan di `sessionStorage` (draft) agar tidak hilang saat refresh.
- Tombol **Atrás** (Outline) di kiri, **Continuar** (Primary) di kanan; di mobile, sticky bottom bar.
- Saat error submit: **error summary** di atas form (bg `#FBE9E9`, border‑left 4 px `#C62E2E`) dengan link ke tiap field dan fokus otomatis.
- **Sukses:** halaman konfirmasi dengan ikon ✓ besar, nomor tiket mono (`RFQ‑2026‑00142`), estimasi waktu respons, CTA WhatsApp, dan email konfirmasi.
- Proteksi spam: honeypot field + rate limit server; Turnstile hanya jika diperlukan.

---

### 7.4 Navigation

#### 7.4.1 Header / Navbar

Mengadopsi **navbar pill melayang** dari referensi, disesuaikan untuk Othalan.

```
Desktop (≥1024):
┌─────────────────────────────────────────────────────────────────────────────┐
│ Servicios ▾  Proyectos  Nosotros      [⚙ OTHALAN]      Contacto  [💬]  [Solicitar cotización ◯→] │
└─────────────────────────────────────────────────────────────────────────────┘
          ↑ pill 72px, radius-xl, margin-top 16px, max-width 1280

Mobile (<1024):
┌───────────────────────────────────────────┐
│ [⚙ OTHALAN]                  [💬] [☰]    │  64px, full-width, radius 0 → 16 (floating saat scroll)
└───────────────────────────────────────────┘
```

| Properti | Spesifikasi |
|---|---|
| Tinggi | 72 px desktop / 64 px mobile |
| Logo | Versi horizontal (ikon roda gigi 40 px + wordmark). Tinggi 40 px desktop, 36 px mobile. `alt="Othalan Ingeniería y Construcción – Inicio"` |
| Link | Inter 15/500, padding 8 × 12 px, gap 4 px |
| CTA | Primary `sm`/`md` "Solicitar cotización" + icon button WhatsApp |
| Skip link | "Saltar al contenido" muncul saat focus, bg `yellow-500` |

**State bar:**

| Konteks | Background | Teks | Border / Shadow |
|---|---|---|---|
| Di atas hero (top) | `rgb(255 255 255 / 0.92)` + blur 12 px | `carbon-900` | none |
| Scrolled (> 80 px) | `#FFFFFF` | `carbon-900` | `shadow-md` |
| Hide on scroll down / show on scroll up | `translateY(-110%)` / `0` | — | 200 ms (nonaktif pada reduced motion) |

**State link nav:**

| State | Gaya |
|---|---|
| Default | `concrete-800` |
| Hover | `carbon-950`, garis bawah 2 px `yellow-500` tumbuh dari tengah |
| Active (halaman aktif) | `carbon-950` 600, garis bawah 3 px `yellow-500` tetap, `aria-current="page"` |
| Focus‑visible | Ring focus radius 6 px |
| Disabled | Tidak dipakai di nav |

**Mega‑menu "Servicios"** (desktop): panel `shadow-lg`, radius 20, 4 kolom layanan (ikon + judul + 1 baris deskripsi), dan kolom kanan berisi kartu proyek unggulan. Dibuka dengan klik/Enter (bukan hover saja), `aria-expanded`, tutup dengan Esc.

**Drawer mobile:** full‑screen bg `carbon-900`, link `h3` condensed UPPER putih bernomor mono (`01`, `02`…), CTA Primary full‑width di bawah, kontak (teléfono, email, WhatsApp) dan sosial. Focus trap, Esc menutup, scroll body dikunci.

**Floating WhatsApp** (mobile & desktop): icon button 56 px kanan bawah, offset 16/24 px, tidak menutupi sticky CTA form; disembunyikan di halaman RFQ langkah 4.

#### 7.4.2 Footer

```
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ garis 4px yellow-500 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
[ Pre‑footer CTA band: bg yellow-500 ]
  ¿TIENES UN PROYECTO EN MENTE?            [Solicitar cotización ◯→] (secondary)
───────────────────────────────────────────────────────────── bg carbon-900
 [Logo putih/kuning]     SERVICIOS          EMPRESA          CONTACTO
 Ingeniería y            Obras civiles      Nosotros         📍 Dirección, Comuna, Región
 construcción con        Estructuras met.   Proyectos        📞 +56 9 …
 trato directo.          Montaje industrial Trabaja con…     ✉ contacto@othalan.cl
                         Mantención         Blog / Noticias  🕘 Lun–Vie 08:30–18:00
 [in] [f] [ig] [💬]                                            Respuesta en terreno 24/7
───────────────────────────────────────────────────────────── carbon-700 divider
 © 2026 Othalan SpA · RUT XX.XXX.XXX-X   Política de privacidad · Términos      ↑ Volver arriba
```

| Properti | Spesifikasi |
|---|---|
| Background | `carbon-900`; bottom bar `carbon-950` |
| Heading kolom | `h5` condensed UPPER `yellow-500` |
| Link | `body-sm` `concrete-300` → hover `#FFFFFF` + underline; focus ring `yellow-300` |
| Grid | Desktop 4 kolom (4‑2‑2‑4 dari 12); tablet 2 × 2; mobile 1 kolom dengan accordion untuk Servicios & Empresa |
| Padding | 80 px atas (desktop) / 56 px (mobile) |
| Dekorasi | Motif busur konsentris logo sebagai watermark `rgb(255 255 255 / 0.03)` di sudut kanan |

> Data kontak, sosial, dan RUT berasal dari **CMS (Site Settings)**, bukan hard‑code.

### 7.5 Komponen pendukung (ringkas)

| Komponen | Catatan |
|---|---|
| `Eyebrow` | Bullet kuning + teks UPPER 15 px. Prop `index` opsional (`01 /`). |
| `SectionHeading` | Eyebrow + heading (dengan slot highlight) + lead; align `start`/`center`. |
| `Badge` / `Tag` | `neutral`, `brand`, `accent`, `success`, `warning`, `error`, `info`. Tinggi 24 px, radius 4. |
| `FilterChips` | Filter kategori galeri; `role="radiogroup"` atau toggle button; sinkron dengan URL `?categoria=montaje`. |
| `Tabs` | Underline 3 px kuning untuk tab aktif. |
| `Accordion` | FAQ; ikon `+` berputar 45°; `<details>` native sebagai basis. |
| `Breadcrumb` | Halaman detail proyek & layanan; separator `/` mono. |
| `Pagination` / `LoadMore` | Galeri; tombol "Cargar más proyectos" + nomor halaman untuk SEO. |
| `Lightbox` | Fullscreen bg `rgb(11 13 12 / 0.96)`, swipe, keyboard ← → Esc, caption + counter mono `04 / 18`. |
| `Toast` / `Alert` | Semantik §3.5, ikon wajib, `role="status"` / `role="alert"`. |
| `Skeleton` | `concrete-100`; shimmer `concrete-50`. |
| `Spinner` | Ring 2 px, arc `yellow-500` di gelap / `carbon-900` di terang. |
| `LogoStrip` | Logo klien grayscale 60 % opacity → warna penuh saat hover. |
| `StatCounter` | §7.2.4, count‑up. |
| `Modal` / `Dialog` | `<dialog>` native, radius 20, `shadow-lg`. |

---

## 8. Ikonografi

### 8.1 Gaya

- **Library:** [Tabler Icons](https://tabler.io/icons) (`@tabler/icons-svelte`): line icon pada grid 24 px dengan banyak ikon konstruksi (crane, helmet, building‑factory, tools, ruler‑measure, truck, bulldozer, barrier‑block, welding‑torch).
- **Stroke 2 px** (ukuran 20–24 px); **1,75 px** pada 32–48 px agar tetap seimbang. Tegas, tidak tipis, tidak filled.
- Ujung garis: gunakan default library secara konsisten; jangan mencampur library berbeda dalam satu layar.
- **Ukuran:** 16 (inline), 20 (tombol/input), 24 (nav/list), 32 (service card), 48 (fitur/empty state).
- **Warna:** `currentColor`. Di service card, ikon `carbon-950` di dalam kotak `yellow-100`/`yellow-500`.

### 8.2 Container ikon

| Varian | Spesifikasi |
|---|---|
| Square tile | 56 × 56 px, radius 8, bg `yellow-100` → hover `yellow-500` |
| Circle | 40/48 px, bg `carbon-900`, ikon `yellow-500` (gaya chip tombol) |
| Outline | 56 px, border 2 px `carbon-900`, gaya "stempel teknik" |

### 8.3 Ikon kustom (tahap 2)

Untuk layanan khas Othalan, buat set kecil dengan aturan yang sama (24 px grid, stroke 2, padding 2 px): *viga IPE/H*, *soldadura*, *galpón*, *plataforma*, *anclaje*, *placa compactadora*, *cota/medición*. Simpan sebagai komponen Svelte di `$lib/icons/custom/`.

### 8.4 Aksesibilitas ikon

- Ikon dekoratif: `aria-hidden="true"`.
- Ikon tanpa label (icon button): wajib `aria-label` dalam bahasa Spanyol ("Abrir menú", "Cerrar", "Siguiente imagen").

---

## 9. Fotografi & Perlakuan Gambar

### 9.1 Arah fotografi

| ✅ Lakukan | ❌ Hindari |
|---|---|
| Foto proyek **asli** Othalan: baja, soldadura, galpones, hormigón, maquinaria. | Stok foto generik / orang tersenyum memegang blueprint. |
| Pekerja dengan **APD lengkap** (casco, chaleco, lentes, guantes). Ini juga bukti budaya *seguridad*. | Foto pekerja tanpa APD atau situasi tidak aman. **Wajib disaring sebelum publikasi.** |
| Komposisi yang menonjolkan **skala** (manusia kecil vs. struktur besar), sudut rendah, garis diagonal balok. | Foto miring tanpa tujuan, terlalu banyak kekacauan di latar. |
| **Detail tekstur**: las, baut, sambungan, permukaan beton. | Filter Instagram, HDR berlebihan, saturasi tinggi. |
| Cahaya pagi/sore (golden hour) dan langit Chile; Andes sebagai latar bila ada. | Foto blur, gelap, atau resolusi < 1600 px sisi panjang. |
| Tim & klien berdiskusi di lapangan (collaborative). | Wajah yang dapat dikenali tanpa izin (persetujuan wajib). |

**Catatan aset saat ini:** foto `works/` diambil dari ponsel dengan eksposur keras. Perbaiki white balance, angkat shadow, dan luruskan horizon. Foto vertikal 9:16 cocok untuk kartu bento portrait/mobile hero; untuk 16:9 perlu crop atau foto ulang.

### 9.2 Rasio aspek standar

| Rasio | Pemakaian | Ukuran master minimum |
|---|---|---|
| **21:9** | Banner halaman dalam (Nosotros, Servicios) | 2560 × 1097 |
| **16:9** | Hero beranda (desktop), video | 2560 × 1440 |
| **4:5** | Hero mobile, kartu bento besar, tim | 1600 × 2000 |
| **16:10** | Kartu proyek listing, cover detail proyek | 1920 × 1200 |
| **4:3** | **Kartu proyek default**, galeri grid | 1600 × 1200 |
| **3:2** | Gambar dalam artikel / studi kasus | 1800 × 1200 |
| **1:1** | Thumbnail galeri, logo klien, OG fallback | 1200 × 1200 |
| **9:16** | Story / galeri mobile portrait | 1080 × 1920 |
| **1.91:1** | Open Graph / share sosial | 1200 × 630 |

Semua gambar memakai `aspect-ratio` CSS + `object-fit: cover` dengan **focal point** dari CMS (`object-position: var(--fx) var(--fy)`) agar crop responsif tidak memotong subjek.

### 9.3 Overlay & treatment

| Treatment | CSS | Pemakaian |
|---|---|---|
| **Hero overlay** | `linear-gradient(90deg, rgb(11 13 12 / 0.88) 0%, rgb(11 13 12 / 0.55) 45%, rgb(11 13 12 / 0.15) 100%)` | Teks kiri di atas foto; kontras teks putih ≥ 7 : 1 |
| **Card overlay** | `linear-gradient(180deg, transparent 40%, rgb(11 13 12 / 0.85))` | Judul di bawah kartu |
| **Carbon duotone** | `filter: grayscale(1) contrast(1.1)` + layer `carbon-900` `mix-blend-mode: multiply` 40 % | Latar section gelap, CTA band |
| **Yellow duotone** (hemat) | Shadow `carbon-950` → highlight `yellow-500` (diproses di server/SVG filter) | Satu visual signature per halaman, mis. section "Estructuras metálicas" |
| **Tekstur grain** | SVG noise 3–4 % opacity | Hero & section gelap untuk nuansa "rugged" |
| **Blueprint grid** | Lihat §5.5 | Di atas duotone atau latar terang |

> **Aturan:** foto proyek di galeri dan detail proyek **tidak diberi duotone**. Warna asli adalah bukti. Treatment kuat hanya untuk foto **dekoratif/latar**.

### 9.4 Frame & komposisi

- Kartu & gambar inline: radius 12 px. Full‑bleed hero: 0 px (atau frame radius 20 px dengan margin 16 px seperti referensi).
- **Stacking**: badge statistik kuning menumpuk 24 px keluar dari tepi foto, mengikuti referensi.
- **Corner tick** (siku 16 px, 2 px `yellow-500`) di sudut gambar unggulan sebagai "tanda ukur".
- Caption: `caption` 12 px `concrete-500`, format `Proyecto · Comuna, Región · Año`.

### 9.5 Foto tim / pemangku kepentingan

- Rasio **4:5**, crop dari dada ke atas, mata di ⅓ atas.
- Latar seragam: `concrete-50` polos atau foto lokasi kerja ter‑blur. Jika sumber berbeda, lakukan *background removal* lalu tempatkan pada latar `concrete-50` dengan bayangan lembut.
- Pakaian kerja/APD atau smart‑casual seragam; ekspresi ramah (Friendly).
- File saat ini memakai format campuran (PNG/JPEG). Normalisasi ke master JPEG/PNG ≥ 1200 × 1500, lalu turunan AVIF/WebP.

### 9.6 Logo

- Logo saat ini berupa raster JPG dengan latar krem (dan ada watermark kecil di pojok kanan bawah). **Wajib di‑redraw menjadi SVG** sebelum produksi.
- Varian yang dibutuhkan: (1) **Emblem** lengkap, (2) **Horizontal** (ikon roda gigi + "OTHALAN" untuk navbar), (3) **Monokrom** hitam & putih, (4) **Favicon** ikon busur di dalam roda gigi (32/180/512 px).
- Clear space minimal = tinggi satu gigi roda. Ukuran minimum emblem 48 px; horizontal 120 px lebar.

### 9.7 Video (opsional)

Hero video loop 8–12 detik tanpa suara (`muted playsinline`), ≤ 4 MB (H.264 + AV1/WebM), poster AVIF, dan tidak autoplay jika `prefers-reduced-motion` atau `Save-Data` aktif.

---

## 10. Pola Halaman

| Halaman | Section (urutan) |
|---|---|
| **Inicio** | Hero (headline + 2 CTA + 3 glass cards) → LogoStrip clientes → Servicios (4 service cards) → ¿Por qué Othalan? (foto + stat badge + daftar 01–04) → Proceso 4 pasos → Proyectos recientes (bento) → Testimonios → CTA band kuning → Footer |
| **Servicios** / detalle | Banner 21:9 → intro → sub‑layanan → kapabilitas (spec mono) → proyek terkait → FAQ → CTA |
| **Proyectos** (galeri) | Heading + FilterChips (Todos, Construcción, Industria, Montaje, Mantención, Obras civiles) + sort → grid kartu → LoadMore/pagination |
| **Proyecto** (detalle) | Cover 16:10 → ficha técnica (cliente, ubicación, año, m², toneladas, duración — tabel mono) → narasi (desafío/solución/resultado) → galeri + lightbox → proyek berikutnya |
| **Nosotros** | Banner → historia → misión/visión/valores (ikon) → equipo (team cards) → seguridad & certificaciones → comunidad → CTA |
| **Contacto** | Form singkat + info kontak + peta (lazy) + WhatsApp |
| **Solicitar cotización** | Form RFQ multi‑langkah (§7.3.5) + panel samping "¿Qué pasa después?" |
| **404 / 500** | Ilustrasi garis "barrera de obra", copy ramah, CTA kembali |

**Contoh hero copy (ES‑CL):**

```
• Ingeniería y construcción en Chile
CONSTRUIMOS ESTRUCTURAS
QUE <mark>SOSTIENEN</mark>
TU OPERACIÓN.
Obras civiles, estructuras metálicas y montaje industrial con trato directo y respuesta en terreno 24/7.
[Solicitar cotización ◯→]  [Ver proyectos ◯→]
```

---

## 11. Arsitektur SvelteKit & Design Tokens

### 11.1 Struktur folder

```
src/
├─ app.html                     # preload font, theme-color #15181A
├─ app.d.ts
├─ lib/
│  ├─ styles/
│  │  ├─ tokens.css             # primitives (warna, ukuran mentah)
│  │  ├─ semantic.css           # alias peran + [data-theme="dark"]
│  │  ├─ base.css               # reset, tipografi dasar, focus, selection
│  │  ├─ layout.css             # .container, .grid, .stack, .section
│  │  └─ utilities.css          # .sr-only, .visually-hidden, .line-clamp
│  ├─ tokens/
│  │  └─ tokens.json            # sumber tunggal (Style Dictionary → CSS/TS)
│  ├─ components/
│  │  ├─ ui/                    # atom: Button, IconButton, Badge, Tag, Spinner, Skeleton
│  │  ├─ form/                  # TextField, Textarea, Select, Combobox, Checkbox, Radio,
│  │  │                         # RadioCard, ChipGroup, FileDropzone, FormStepper, ErrorSummary
│  │  ├─ cards/                 # ProjectCard, ServiceCard, FeatureCard, StatCard, TeamCard, TestimonialCard
│  │  ├─ media/                 # ResponsiveImage, Lightbox, GalleryGrid, VideoHero
│  │  ├─ navigation/            # Header, NavLink, MegaMenu, MobileDrawer, Footer, Breadcrumb, Pagination, SkipLink
│  │  ├─ sections/              # Hero, SectionHeading, Eyebrow, LogoStrip, ProcessSteps, CtaBand, ProjectBento
│  │  └─ feedback/              # Alert, Toast, EmptyState
│  ├─ icons/custom/
│  ├─ server/                   # db (Neon), storage (S3 client), validasi
│  └─ utils/                    # rut.ts, format-cl.ts, image-url.ts
└─ routes/
   ├─ (site)/+layout.svelte     # Header + Footer
   │  ├─ +page.svelte           # Inicio
   │  ├─ servicios/[slug]/
   │  ├─ proyectos/ & proyectos/[slug]/
   │  ├─ nosotros/
   │  ├─ contacto/
   │  └─ cotizacion/            # form actions RFQ
   └─ (cms)/admin/              # CMS memakai token & komponen yang sama
```

### 11.2 Token CSS (cuplikan siap pakai)

```css
/* tokens.css — primitives */
:root {
  /* Amarillo Faena */
  --yellow-50:#FFFDE6; --yellow-100:#FFF9BF; --yellow-200:#FFF38A; --yellow-300:#FCEB4D;
  --yellow-400:#F9E70E; --yellow-500:#F2D200; --yellow-600:#D4AE00; --yellow-700:#A38300;
  --yellow-800:#6E5800; --yellow-900:#3D3100;
  /* Acero Carbón */
  --carbon-500:#5B646B; --carbon-600:#3E454A; --carbon-700:#2C3135;
  --carbon-800:#1F2326; --carbon-900:#15181A; --carbon-950:#0B0D0C;
  /* Cobre Atacama */
  --copper-100:#F8E6DA; --copper-400:#E0814F; --copper-500:#C8642F;
  --copper-600:#A84F22; --copper-700:#873E1A;
  /* Hormigón */
  --white:#FFFFFF; --concrete-25:#FAF8F4; --concrete-50:#F3F1EC; --concrete-100:#E8E5DF;
  --concrete-200:#D6D2CA; --concrete-300:#B9B4AA; --concrete-400:#948F85; --concrete-500:#736F66;
  --concrete-600:#5A5750; --concrete-700:#45433E; --concrete-800:#2F2E2B; --concrete-900:#1C1B19;
  /* Semantik */
  --success-600:#2E7D4F; --success-50:#E6F2EB; --success-200:#9CCBAE;
  --error-600:#C62E2E;   --error-50:#FBE9E9;   --error-200:#EDA5A5;
  --warning-600:#A35F00; --warning-50:#FFF3DC; --warning-200:#F2C46D;
  --info-600:#1F5F8B;    --info-50:#E4EFF7;    --info-200:#9DC1DB;

  /* Tipografi */
  --font-display:"Barlow Condensed","Arial Narrow",sans-serif;
  --font-body:"Inter Variable","Inter",system-ui,sans-serif;
  --font-mono:"JetBrains Mono",ui-monospace,monospace;
  --text-display-2xl:clamp(2.75rem,1.87rem + 3.91vw,5rem);
  --text-display-xl:clamp(2.5rem,1.913rem + 2.61vw,4rem);
  --text-h1:clamp(2.125rem,1.685rem + 1.96vw,3.25rem);
  --text-h2:clamp(1.875rem,1.63rem + 1.09vw,2.5rem);
  --text-h3:clamp(1.625rem,1.478rem + 0.652vw,2rem);
  --text-h4:clamp(1.312rem,1.239rem + 0.326vw,1.5rem);
  --text-h5:clamp(1.125rem,1.076rem + 0.217vw,1.25rem);
  --text-body-lg:clamp(1.062rem,1.038rem + 0.109vw,1.125rem);
  --text-body:1rem; --text-body-sm:.875rem; --text-caption:.75rem; --text-eyebrow:.9375rem;

  /* Spasi (4px base) */
  --space-1:.25rem; --space-2:.5rem; --space-3:.75rem; --space-4:1rem; --space-5:1.25rem;
  --space-6:1.5rem; --space-8:2rem; --space-10:2.5rem; --space-12:3rem; --space-16:4rem;
  --space-20:5rem; --space-24:6rem; --space-32:8rem;
  --section-py:clamp(4rem,2.4rem + 6.9vw,8rem);

  /* Layout */
  --container-max:1280px; --container-narrow:768px; --container-form:640px;
  --grid-cols:4; --grid-gutter:1rem; --page-margin:1rem;

  /* Radius, shadow, motion */
  --radius-xs:2px; --radius-sm:4px; --radius-md:8px; --radius-lg:12px; --radius-xl:20px; --radius-full:9999px;
  --shadow-xs:0 1px 2px rgb(28 27 25 / .06);
  --shadow-sm:0 2px 6px rgb(28 27 25 / .08);
  --shadow-md:0 8px 24px -6px rgb(28 27 25 / .14);
  --shadow-lg:0 20px 48px -12px rgb(28 27 25 / .22);
  --duration-fast:120ms; --duration-base:200ms; --duration-slow:360ms; --duration-reveal:600ms;
  --ease-standard:cubic-bezier(.2,0,0,1); --ease-emphasized:cubic-bezier(.3,0,0,1.2);
  --z-header:50; --z-drawer:60; --z-modal:70; --z-toast:80;
}
@media (min-width:768px)  { :root { --grid-cols:8;  --grid-gutter:1.5rem; --page-margin:2rem; } }
@media (min-width:1024px) { :root { --grid-cols:12; --grid-gutter:2rem;   --page-margin:3rem; } }
@media (min-width:1280px) { :root { --page-margin:4rem; } }
```

```css
/* semantic.css */
:root, [data-theme="light"] {
  --color-bg:var(--concrete-25); --color-bg-alt:var(--concrete-50);
  --color-surface:var(--white); --color-text:var(--concrete-900);
  --color-text-muted:var(--concrete-600); --color-text-subtle:var(--concrete-500);
  --color-border:var(--concrete-200); --color-border-strong:var(--concrete-300);
  --color-brand:var(--yellow-500); --color-on-brand:var(--carbon-950);
  --color-accent-text:var(--copper-600); --color-focus:var(--info-600);
}
[data-theme="dark"] {
  --color-bg:var(--carbon-900); --color-bg-alt:var(--carbon-950);
  --color-surface:var(--carbon-800); --color-text:var(--concrete-50);
  --color-text-muted:var(--concrete-300); --color-text-subtle:var(--concrete-400);
  --color-border:var(--carbon-700); --color-border-strong:var(--carbon-600);
  --color-accent-text:var(--copper-400); --color-focus:var(--yellow-300);
}
:focus-visible { outline:2px solid var(--color-focus); outline-offset:2px; }
::selection { background:var(--yellow-200); color:var(--carbon-950); }
```

### 11.3 Konvensi komponen Svelte

- **Svelte 5 runes** (`$props`, `$state`, `$derived`); props bertipe TypeScript, `...rest` diteruskan ke elemen root.
- **Styling:** `<style>` scoped per komponen + custom property tokens. Tidak ada nilai HEX mentah di komponen.
  *(Jika tim memilih Tailwind v4, petakan token di `@theme` dengan nama yang sama.)*
- **Varian lewat atribut data / kelas**, bukan props style inline: `class="btn" data-variant="primary" data-size="md"`.
- **Slot = Snippet**: `children`, `icon`, `media`, `actions`.
- **Polimorfik link/button**: render `<a>` jika `href` ada.
- **Form** memakai SvelteKit **form actions** + `use:enhance` (progressive enhancement: form tetap bekerja tanpa JS).
- **Dokumentasi & QA visual:** Storybook (`@storybook/sveltekit`) dengan story per state (default/hover/focus/active/disabled/loading/error), plus addon a11y.
- **Penamaan:** PascalCase komponen, kebab-case token, BEM ringan untuk kelas (`.card__media`).

---

## 12. Data Dinamis: Galeri, Media & Form

### 12.1 Model data (PostgreSQL / Neon, ringkas)

```sql
projects (id, slug, title, category, client_name, region, comuna, year,
          area_m2, steel_tons, duration_months, summary, body_json,
          cover_media_id, status ['draft'|'published'], featured bool, sort_order,
          published_at, updated_at)

media    (id, project_id, storage_key, mime, width, height, bytes,
          focal_x, focal_y,             -- 0..1 untuk object-position
          blurhash, dominant_color,     -- placeholder & latar skeleton
          alt_es, caption_es, credit, taken_at, sort_order)

rfq_requests (id, ticket_code, status, contact_json, project_json,
              consent_at, created_at, source_url, ip_hash)
rfq_files    (id, rfq_id, storage_key, filename, mime, bytes, scan_status)

site_settings (key, value_json)        -- kontak, sosial, statistik, RUT
```

### 12.2 Pipeline gambar resolusi tinggi

1. **Upload (CMS):** browser → **presigned URL** ke Object Storage (S3‑compatible) → simpan master asli (`originals/…`).
2. **Proses (job/serverless):** buat turunan **AVIF + WebP + JPEG** pada lebar `[320, 480, 768, 1024, 1440, 1920, 2560]`, hapus metadata EXIF/GPS, buat `blurhash` + `dominant_color`, simpan `width/height`.
3. **Delivery:** URL publik via CDN dengan `Cache-Control: public, max-age=31536000, immutable` (nama file ber‑hash).
4. **Render:** komponen `ResponsiveImage.svelte`:

```svelte
<ResponsiveImage
  media={project.cover}           <!-- {key,width,height,alt_es,blurhash,focal_x,focal_y,dominant_color} -->
  ratio="4/3"
  sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
  priority={false}                <!-- true hanya untuk LCP (hero) → fetchpriority="high", tanpa lazy -->
/>
```

Output: `<picture>` dengan `<source type="image/avif">`, `<source type="image/webp">`, `<img loading="lazy" decoding="async" width height>`. Placeholder `dominant_color` / blurhash menempati ruang (**CLS = 0**), lalu fade‑in 200 ms setelah `load`.

> Catatan: detail API storage (presigned URL, transformasi gambar on‑the‑fly) bergantung pada penyedia object storage yang dipakai. Pastikan bucket kompatibel S3 atau sediakan adapter di `$lib/server/storage.ts` agar komponen UI tidak terikat penyedia.

### 12.3 Galeri & listing proyek

- **SSR halaman pertama** (12 item) di `+page.server.ts` untuk SEO; muat berikutnya via `LoadMore` (fetch `?page=2`) **dan** link pagination asli.
- Filter dan sort tersimpan di **query string** (`/proyectos?categoria=montaje&orden=recientes`) sehingga bisa dibagikan dan tombol back berfungsi.
- Layout galeri: **grid seragam 4:3** untuk listing (presisi, rapi); **bento** untuk beranda; **masonry** hanya di galeri detail proyek (pakai `width/height` asli).
- **Lightbox:** muat gambar 1920/2560 hanya saat dibuka; prefetch gambar sebelah; dukung swipe & pinch‑zoom; URL hash `#foto-4` untuk deep link.
- **Empty state:** "Aún no hay proyectos en esta categoría" + ikon + tombol "Ver todos".
- **Error state:** Alert error + "Reintentar".
- Target performa: **LCP < 2,5 s** (4G), **CLS < 0,05**, gambar kartu ≤ 120 KB (AVIF 768w).

### 12.4 Konten CMS → UI

- Semua komponen menerima data **opsional** dan harus **gagal dengan anggun**: field kosong tidak dirender (statistik "0", testimoni kosong, logo klien kosong).
- `alt_es` **wajib** di CMS untuk setiap media (validasi saat publish); gambar dekoratif ditandai `alt=""`.
- Panjang teks dibatasi di CMS sesuai desain: judul proyek ≤ 60 karakter, ringkasan ≤ 160, deskripsi layanan kartu ≤ 120.
- CMS Admin memakai token yang sama, dengan densitas lebih padat (input `sm`, tabel), agar konsisten dan hemat waktu pengembangan.

### 12.5 Form → database & storage

- Upload lampiran RFQ: presigned PUT per file → progress di `FileDropzone` → `storage_key` dikirim bersama form; server memverifikasi ukuran/MIME dan menandai `scan_status`.
- Submit memakai form action → validasi server → insert `rfq_requests` → kirim email notifikasi + konfirmasi → redirect ke `/cotizacion/gracias?ticket=RFQ-2026-00142`.
- Pesan error server dipetakan ke field yang sama (struktur `{ field: message }`).

---

## 13. Aksesibilitas

| Area | Standar |
|---|---|
| Target | **WCAG 2.2 AA** |
| Kontras | Teks ≥ 4,5 : 1; teks besar & komponen UI ≥ 3 : 1 (lihat §3.8) |
| Fokus | `:focus-visible` selalu terlihat; urutan tab logis; skip link |
| Target sentuh | ≥ 44 × 44 px (2.5.8 minimal 24 px, kita pakai 44) |
| Form | Label eksplisit, `autocomplete` benar (`name`, `organization`, `email`, `tel`), error teks + ikon, error summary, tanpa batas waktu |
| Media | `alt` deskriptif dalam bahasa Spanyol; video tanpa suara atau dengan subtitle |
| Bahasa | `<html lang="es-CL">` |
| Motion | `prefers-reduced-motion` dihormati |
| Struktur | Satu `h1` per halaman, landmark (`header`, `nav`, `main`, `footer`), heading tidak melompat level |
| Uppercase | Ditulis normal di HTML, diubah dengan `text-transform` (screen reader membaca benar) |
| Zoom | Layout tetap utuh pada zoom 200 % dan lebar 320 px |

---

## 14. Checklist QA

**Visual & token**

- [ ] Tidak ada HEX mentah di komponen; semua lewat token/alias.
- [ ] Kuning tidak pernah dipakai sebagai teks di latar terang.
- [ ] Maksimal satu tombol Primary per viewport.
- [ ] Heading UPPERCASE ≤ 3 baris (desktop); satu highlight per heading.
- [ ] Semua jarak kelipatan 4 px.

**Komponen**

- [ ] Setiap komponen interaktif punya story untuk default, hover, focus, active, disabled (+ loading/error bila relevan).
- [ ] Kartu proyek: gambar `width/height` + placeholder, tanpa CLS.
- [ ] Form: validasi RUT, telepon +56, error summary, draft tersimpan, sukses dengan nomor tiket.
- [ ] Navbar: mega‑menu & drawer bisa dioperasikan dengan keyboard; Esc menutup; focus trap.

**Konten & foto**

- [ ] Semua foto publik menampilkan pekerja dengan APD lengkap.
- [ ] Logo dalam SVG (emblem, horizontal, mono, favicon).
- [ ] Data kontak, statistik, dan sosial berasal dari CMS; nilai kosong disembunyikan.
- [ ] Copy dalam Español (Chile), format angka `es-CL`.

**Performa & a11y**

- [ ] Lighthouse ≥ 90 (Performance, Accessibility, Best Practices, SEO) di mobile.
- [ ] LCP < 2,5 s, CLS < 0,05, INP < 200 ms.
- [ ] Uji axe/Storybook a11y tanpa pelanggaran serius; uji manual NVDA/VoiceOver pada form RFQ.

---

*Othalan Design System "Faena" v1.0 — dokumen hidup. Perubahan token wajib dicatat di `CHANGELOG.md` dan disinkronkan ke `tokens.json`.*
