# Execution Plan — Website & CMS Othalan

> **Versi** 1.0 · 17 Oktober 2026
> **Proyek** Website company profile + CMS untuk **Othalan Ingeniería y Construcción** (Chile)
> **Bahasa situs** Español (Chile) · `lang="es-CL"` · zona waktu `America/Santiago`
> **Stack** SvelteKit (Svelte 5) · PostgreSQL di **Neon** · Object Storage · deploy ke **Cloudflare Workers**
> **Acuan desain** [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) ("Faena")

Dokumen ini adalah rencana eksekusi end‑to‑end: arsitektur, skema data, sitemap, modul CMS, fase kerja beserta kriteria selesai, serta risiko dan keputusan yang perlu diambil. Dokumen ditulis dalam Bahasa Indonesia; semua copy UI, slug URL, dan label CMS dalam bahasa Spanyol.

---

## Daftar Isi

1. [Ringkasan & Tujuan](#1-ringkasan--tujuan)
2. [Ruang Lingkup](#2-ruang-lingkup)
3. [Arsitektur Teknis](#3-arsitektur-teknis)
4. [Sitemap & Konten Situs Publik](#4-sitemap--konten-situs-publik)
5. [CMS (Panel Admin)](#5-cms-panel-admin)
6. [Model Data (PostgreSQL)](#6-model-data-postgresql)
7. [Media & Object Storage](#7-media--object-storage)
8. [Form: Cotización, Contacto, Empleo](#8-form-cotización-contacto-empleo)
9. [SEO, Performa & Aksesibilitas](#9-seo-performa--aksesibilitas)
10. [Keamanan & Kepatuhan Hukum Chile](#10-keamanan--kepatuhan-hukum-chile)
11. [Fase Eksekusi & Timeline](#11-fase-eksekusi--timeline)
12. [Testing & QA](#12-testing--qa)
13. [Deployment, Environment & CI/CD](#13-deployment-environment--cicd)
14. [Peluncuran & Pasca‑Peluncuran](#14-peluncuran--pasca-peluncuran)
15. [Risiko & Mitigasi](#15-risiko--mitigasi)
16. [Keputusan Terbuka & Kebutuhan dari Klien](#16-keputusan-terbuka--kebutuhan-dari-klien)
17. [Lampiran: Foto Equipo Directivo](#17-lampiran-foto-equipo-directivo)

---

## 1. Ringkasan & Tujuan

| Tujuan bisnis | Indikator keberhasilan (KPI) |
|---|---|
| Menghasilkan **permintaan penawaran (cotización)** yang berkualitas | ≥ 3 % konversi pengunjung halaman layanan → form; waktu respons internal < 24 jam |
| Membangun **kepercayaan** di mata mandante, perusahaan tambang/industri, dan publik | Portofolio ≥ 12 proyek dengan ficha técnica; sertifikasi & indikator keselamatan tampil |
| Menjadi **sumber resmi** data perusahaan untuk proses licitación / registro de proveedores | Dokumen perusahaan dapat diunduh (brochure, certificados) |
| **Merekrut** tenaga kerja lapangan & profesional | Halaman "Trabaja con nosotros" dengan lowongan aktif dan form postulación |
| Konten **mandiri** dikelola tim Othalan tanpa developer | Semua teks, foto, proyek, tim, statistik, dan kontak dapat diubah lewat CMS |

**Prinsip eksekusi:**

- **Design system dulu:** token dan komponen dari `DESIGN-SYSTEM.md` dibangun di awal, lalu halaman disusun dari komponen tersebut.
- **Konten nyata:** tidak ada angka atau testimoni palsu. Komponen yang datanya kosong otomatis disembunyikan.
- **Progressive enhancement:** form tetap berfungsi tanpa JavaScript (SvelteKit form actions).
- **Edge‑first:** SSR di Cloudflare Workers, database serverless Neon, dan media lewat CDN.

---

## 2. Ruang Lingkup

### 2.1 Termasuk (MVP — Rilis 1.0)

- Situs publik berbahasa Spanyol dengan ±15 template halaman (lihat §4).
- **Section "Equipo directivo"** (pejabat perusahaan) di Inicio dan Nosotros, dikelola dari CMS.
- CMS lengkap: konten, media library, inbox cotización/contacto/postulaciones, pengguna & peran, pengaturan situs.
- Form cotización multi‑langkah dengan upload planos/EETT, form kontak, dan form postulación (CV).
- Notifikasi email ke tim + email konfirmasi ke pengirim.
- SEO teknis (sitemap, schema.org, Open Graph), analytics, dan banner cookie.
- Deploy produksi di Cloudflare Workers + domain `othalan.cl`, migrasi dari WordPress/Elementor lama.

### 2.2 Tidak termasuk (kandidat Fase 2)

- Multi‑bahasa (EN) → struktur DB sudah disiapkan (§6.4), UI belum.
- Portal klien (status proyek, dokumen privat).
- Integrasi CRM (HubSpot/Pipedrive) dan WhatsApp Business API (MVP memakai link `wa.me`).
- Kalkulator estimasi biaya.
- Blog dengan komentar.

---

## 3. Arsitektur Teknis

### 3.1 Diagram

```
                    ┌──────────────────────────── Cloudflare ────────────────────────────┐
 Pengunjung ──HTTPS─▶  DNS + WAF + Turnstile                                             │
 Admin      ──HTTPS─▶  Worker: SvelteKit (adapter-cloudflare)                            │
                    │   ├─ Static assets (JS/CSS/fonts) via Workers Static Assets         │
                    │   ├─ SSR halaman publik  ──▶ KV (cache konten, versi)              │
                    │   ├─ /admin (CMS)        ──▶ auth session (cookie HttpOnly)        │
                    │   ├─ Form actions        ──▶ Rate Limiting binding                 │
                    │   └─ Image Transformations (resize/format on the fly)              │
                    └────────┬───────────────────────────┬──────────────────────────────┘
                             │ HTTP (neon serverless)     │ S3 API (presigned, aws4fetch)
                    ┌────────▼─────────┐        ┌─────────▼──────────┐       ┌──────────────┐
                    │ Neon PostgreSQL  │        │  Object Storage    │       │ Resend (email)│
                    │ main / preview / │        │  originals/ media/ │       └──────────────┘
                    │ dev branches     │        │  private/ (RFQ, CV)│
                    └──────────────────┘        └────────────────────┘
```

### 3.2 Pilihan teknologi

| Lapisan | Pilihan | Alasan / catatan |
|---|---|---|
| Framework | **SvelteKit 2 + Svelte 5** (runes), TypeScript strict | Sesuai permintaan; SSR + form actions |
| Adapter | **`@sveltejs/adapter-cloudflare`** (target Workers + Static Assets) | Konfigurasi di `wrangler.jsonc`, flag `nodejs_compat` |
| Database | **Neon PostgreSQL** + **`@neondatabase/serverless`** | Driver HTTP/WebSocket yang berjalan di Workers. Client dibuat per request (bukan global). |
| ORM & migrasi | **Drizzle ORM** (`drizzle-orm/neon-http`) + **drizzle-kit** | Ringan, type‑safe, tanpa binary engine, cocok untuk Workers |
| Transaksi | `drizzle-orm/neon-serverless` (Pool via WebSocket) | Hanya untuk operasi multi‑statement (mis. simpan proyek + media) |
| Object storage | **Storage S3‑compatible** via **`aws4fetch`** | Ringan, berbasis `fetch`, presigned URL. Lihat keputusan **D1** di §16 terkait penyedia storage. |
| Gambar | **Cloudflare Image Transformations** | Resize + AVIF/WebP on the fly; tidak perlu `sharp` (tidak jalan di Workers) |
| Auth CMS | **Better Auth** (adapter Drizzle) + plugin 2FA TOTP + RBAC | Mendukung Workers & Postgres; sesi cookie HttpOnly |
| Validasi | **Valibot** | Bundle kecil; skema dipakai bersama client & server |
| Rich text | **Tiptap** (JSON) → render server dengan static renderer + sanitasi | Konten aman, struktur terkontrol |
| Email | **Resend** (HTTP API) + template `svelte-email`/HTML | Workers tidak mendukung SMTP langsung |
| Anti‑spam | **Cloudflare Turnstile** + honeypot + Rate Limiting binding | — |
| Cache | **Workers KV** (snapshot konten) + header `Cache-Control` | Versi konten di‑bump saat publish |
| Ikon | `@tabler/icons-svelte` | Sesuai design system |
| Font | `@fontsource/barlow-condensed`, `@fontsource-variable/inter`, `@fontsource/jetbrains-mono` | Self‑host |
| Analytics | Cloudflare Web Analytics (tanpa cookie) + GA4 opsional (dengan consent) | — |
| Monitoring | Workers Logs / Observability + Sentry (`@sentry/cloudflare`) | — |
| Testing | Vitest, Playwright, axe‑core, Lighthouse CI | — |
| Dokumentasi UI | Storybook (`@storybook/sveltekit`) | State komponen sesuai design system |

### 3.3 Struktur repository

```
othalan-web/
├─ src/
│  ├─ app.html · app.d.ts · hooks.server.ts      # auth, locale, security headers, db per request
│  ├─ lib/
│  │  ├─ styles/        tokens.css · semantic.css · base.css · layout.css · utilities.css
│  │  ├─ components/    ui/ form/ cards/ media/ navigation/ sections/ feedback/   ← dari DESIGN-SYSTEM §11
│  │  ├─ admin/         komponen khusus CMS (DataTable, MediaPicker, Editor, SortableList…)
│  │  ├─ server/
│  │  │  ├─ db/         schema/*.ts · client.ts · queries/*.ts
│  │  │  ├─ storage/    s3.ts (aws4fetch) · keys.ts
│  │  │  ├─ auth.ts     Better Auth config + guards (requireRole)
│  │  │  ├─ email/      templates/*.ts · send.ts
│  │  │  ├─ cache.ts    KV snapshot + bumpVersion()
│  │  │  └─ audit.ts
│  │  ├─ validation/    rut.ts · phone-cl.ts · schemas/*.ts (Valibot)
│  │  ├─ i18n/          es-CL.ts (string UI)
│  │  └─ utils/         format-cl.ts · image-url.ts · slug.ts · seo.ts
│  ├─ routes/
│  │  ├─ (site)/        halaman publik (§4)
│  │  ├─ admin/         CMS (§5)
│  │  ├─ api/           upload/presign · media/confirm · health · preview
│  │  ├─ sitemap.xml/   robots.txt/
│  │  └─ +error.svelte
│  └─ params/           matcher slug
├─ drizzle/             migrations SQL
├─ scripts/             seed.ts · migrate-wp.ts · generate-variants.ts
├─ static/              favicon, manifest
├─ tests/               unit/ e2e/ a11y/
├─ .storybook/
├─ wrangler.jsonc · drizzle.config.ts · svelte.config.js · vite.config.ts
└─ .github/workflows/   ci.yml · preview.yml · deploy.yml
```

### 3.4 Konfigurasi Workers (cuplikan)

```jsonc
// wrangler.jsonc
{
  "name": "othalan-web",
  "main": ".svelte-kit/cloudflare/_worker.js",
  "compatibility_date": "2026-10-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "binding": "ASSETS", "directory": ".svelte-kit/cloudflare" },
  "kv_namespaces": [{ "binding": "CONTENT_CACHE", "id": "<id>" }],
  "ratelimits": [{ "name": "FORM_LIMITER", "namespace_id": "1001", "simple": { "limit": 5, "period": 60 } }],
  "vars": { "PUBLIC_SITE_URL": "https://www.othalan.cl", "STORAGE_BUCKET": "othalan-media" },
  "observability": { "enabled": true }
  // secrets (wrangler secret put): DATABASE_URL, STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY,
  // STORAGE_ENDPOINT, BETTER_AUTH_SECRET, RESEND_API_KEY, TURNSTILE_SECRET_KEY, SENTRY_DSN
}
```

```ts
// src/lib/server/db/client.ts — satu client per request (dipanggil di hooks.server.ts)
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
export const createDb = (url: string) => drizzle(neon(url), { schema });
```

---

## 4. Sitemap & Konten Situs Publik

### 4.1 Sitemap

| Rute | Halaman | Sumber konten (CMS) | Prioritas |
|---|---|---|---|
| `/` | **Inicio** | Home blocks, services, projects (featured), stats, team (teaser), clients, testimonials | MVP |
| `/servicios` | Servicios (indeks) | `services` | MVP |
| `/servicios/[slug]` | Detalle de servicio | `services`, proyek terkait, FAQ | MVP |
| `/proyectos` | Proyectos (galeri + filter) | `projects`, `project_categories` | MVP |
| `/proyectos/[slug]` | Detalle de proyecto (ficha técnica + galeri) | `projects`, `project_media` | MVP |
| `/nosotros` | Nosotros: historia, misión, visión, valores, **Equipo directivo** | `pages`, `team_members`, `timeline_events` | MVP |
| `/nosotros/equipo` | Equipo (halaman lengkap, opsional bila > 6 orang) | `team_members` | MVP |
| `/seguridad-y-calidad` | Seguridad, Salud y Medio Ambiente (HSE) + certificaciones + indikator | `certifications`, `safety_stats`, `pages` | MVP |
| `/clientes` | Clientes & mandantes (logo + sektor) | `clients`, `testimonials` | MVP |
| `/cotizacion` | **Solicitar cotización** (multi‑langkah) | `rfq_requests` (tulis) | MVP |
| `/cotizacion/gracias` | Konfirmasi + nomor tiket | — | MVP |
| `/contacto` | Contacto (form singkat, data kontak, peta, WhatsApp) | `site_settings`, `offices` | MVP |
| `/trabaja-con-nosotros` | Empleos (lowongan) | `job_openings` | MVP |
| `/trabaja-con-nosotros/[slug]` | Detalle + form postulación | `job_applications` (tulis) | MVP |
| `/proveedores` | Info untuk pemasok/subkontraktor + form registro | `pages`, `supplier_registrations` | Should |
| `/noticias`, `/noticias/[slug]` | Noticias / blog | `posts` | Should |
| `/descargas` | Brochure, certificados, registro de contratista | `downloads` | MVP |
| `/preguntas-frecuentes` | FAQ | `faqs` | Should |
| `/canal-de-denuncias` | Canal de denuncias (Ley Karin / Ley 20.393) | `pages` + form/eksternal | Should (lihat §10.3) |
| `/politica-de-privacidad`, `/terminos-y-condiciones`, `/politica-de-cookies` | Legal | `pages` | MVP |
| `/sitemap.xml`, `/robots.txt` | SEO | generated | MVP |
| `404`, `500` | Error | — | MVP |

### 4.2 Konten "wajib" company profile — checklist

**Umum**

- [ ] Value proposition jelas di hero + CTA cotización & WhatsApp
- [ ] Layanan dengan halaman detail masing‑masing
- [ ] Portofolio proyek dengan **ficha técnica** (mandante, ubicación, año, m², toneladas de acero, plazo, alcance)
- [ ] Tentang perusahaan: historia, misión, visión, valores
- [ ] **Equipo directivo** (foto, nama, jabatan, bio singkat, LinkedIn)
- [ ] Klien/mandante (logo) + testimoni nyata
- [ ] Statistik perusahaan (años, proyectos, m², trabajadores), **disembunyikan bila kosong**
- [ ] Kontak lengkap: alamat, teléfono, email, horario, peta, WhatsApp, redes sociales
- [ ] Data legal: razón social, **RUT empresa**, giro
- [ ] Kebijakan privasi, syarat, cookie
- [ ] Rekrutmen

**Spesifik konstruksi / Chile**

- [ ] **Seguridad (HSE)**: kebijakan keselamatan, indikator (tasa de accidentabilidad, días sin accidentes, HH trabajadas), afiliasi **mutualidad** (ACHS / Mutual de Seguridad / IST), comité paritario
- [ ] **Certificaciones**: ISO 9001 / 14001 / 45001 (jika dimiliki), sertifikat pengelasan (AWS/ CWB / NCh), dengan tanggal berlaku & file PDF
- [ ] **Registros de contratista**: Registro MOP, MINVU (RENAC), ChileProveedores, SICEP, Achilles/REPRO (pertambangan), sesuai yang dimiliki
- [ ] **Capacidades**: maquinaria & equipos, taller de estructuras metálicas (m², kapasitas ton/bulan), cobertura regional (peta wilayah Chile)
- [ ] **Proceso de trabajo** 4 tahap (lihat design system §7.2.6)
- [ ] **Descargas**: brochure corporativo, certificados, ficha empresa
- [ ] **Soporte 24/7 / respuesta en terreno** (sesuai klaim situs lama)
- [ ] **Proveedores / subcontratistas**: cara mendaftar
- [ ] **Canal de denuncias** (lihat §10.3)

### 4.3 Struktur halaman Inicio (urutan section)

| # | Section | Komponen (design system) | Data |
|---|---|---|---|
| 1 | Hero | `Hero`, `FeatureCard` ×3 | `home.hero` (judul, highlight, subjudul, CTA, foto/video) |
| 2 | Clientes | `LogoStrip` | `clients` (featured) |
| 3 | Servicios | `SectionHeading`, `ServiceCard` ×4 | `services` (sort_order) |
| 4 | ¿Por qué Othalan? | foto + `StatCard` + daftar 01–04 | `home.why`, `stats` |
| 5 | Proceso | `ProcessSteps` | `home.process` |
| 6 | Proyectos destacados | `ProjectBento` | `projects` (featured, 5) |
| 7 | **Equipo directivo** | `TeamCard` ×3 + link "Conoce al equipo" | `team_members` (`show_on_home`) |
| 8 | Seguridad & certificaciones | badge sertifikat + indikator | `certifications`, `safety_stats` |
| 9 | Testimonios | `TestimonialCard` (carousel) | `testimonials` |
| 10 | CTA band | `CtaBand` | `home.cta` |
| 11 | Footer | `Footer` | `site_settings` |

Admin dapat **mengaktifkan/menonaktifkan dan mengurutkan** section 2–10 dari CMS.

### 4.4 Section Equipo directivo (permintaan pemilik)

- **Data awal (seed):**

| Orden | Nombre | Cargo (ES) | Foto |
|---|---|---|---|
| 1 | Juan Marcelo Escalona Aranda | Gerente General · Ingeniero en Construcción (UC), fundador | `juan-marcelo-escalona-aranda.jpg` |
| 2 | Simón Calaf Aguilera | Jefe de Operaciones | `simon-calaf-aguilera.jpg` |
| 3 | Consuelo Escalona | Jefa de Desarrollo de Negocios | `consuelo-escalona.jpg` |

  > Jabatan dalam bahasa Spanyol diterjemahkan dari nama file (*General Manager, Head of Operations, Head of Business Development*). **Konfirmasi ke klien** apakah memakai istilah ini atau versi bahasa Inggris.

- **Tampilan:** grid 3 kolom (tablet 2, mobile 1 / carousel), `TeamCard` rasio 4:5, nama `h4`, jabatan, bio ≤ 280 karakter (expand), ikon LinkedIn & email.
- **Interaksi:** klik kartu membuka dialog bio lengkap (aksesibel, `<dialog>`).
- **CMS:** urutan drag‑and‑drop, toggle `show_on_home`, kategori `directivo` / `jefatura` / `equipo` agar bisa dikembangkan menjadi struktur organisasi.
- **Schema.org:** `Person` dengan `worksFor` → `Organization`.

---

## 5. CMS (Panel Admin)

Dibangun custom di dalam aplikasi SvelteKit yang sama (`/admin`), memakai token dan komponen dari design system dengan densitas lebih padat. Alasan custom (bukan headless CMS pihak ketiga): satu deploy, satu database, tanpa biaya lisensi, dan model konten spesifik konstruksi.

### 5.1 Peran & hak akses (RBAC)

| Modul | `admin` | `editor` | `comercial` | `rrhh` |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Konten (páginas, servicios, proyectos, equipo, noticias, FAQ, clientes, certificaciones, descargas) | ✅ | ✅ | 👁 | — |
| Media library | ✅ | ✅ | 👁 | — |
| Cotizaciones & contacto (inbox) | ✅ | 👁 | ✅ | — |
| Empleos & postulaciones | ✅ | ✅ (lowongan) | — | ✅ |
| Proveedores | ✅ | — | ✅ | — |
| Configuración del sitio, SEO global, redirects | ✅ | — | — | — |
| Usuarios & roles, audit log | ✅ | — | — | — |

✅ = baca & tulis · 👁 = baca saja · — = tidak ada akses

### 5.2 Modul CMS

| Modul | Fitur utama |
|---|---|
| **Dashboard** | Kartu ringkas: cotizaciones nuevas (7 hari), mensajes, postulaciones, konten draft; daftar aktivitas terakhir; shortcut "Nuevo proyecto". |
| **Inicio (Home builder)** | Edit setiap section (§4.3), toggle tampil/sembunyi, urutan drag‑and‑drop, pilih proyek/servis unggulan. |
| **Páginas** | Halaman statis (Nosotros, Seguridad, Proveedores, legal) dengan editor blok: teks rich, gambar, galeri, CTA, kutipan, dua kolom, embed video. |
| **Servicios** | Judul, slug, ikon, ringkasan, konten, sub‑layanan, kapabilitas (spec list), foto, proyek terkait, FAQ terkait, SEO. |
| **Proyectos** | Ficha técnica (mandante, kategori, sektor, región/comuna, año, m², toneladas, plazo, monto opsional/disembunyikan), narasi desafío/solución/resultado, galeri (upload multi, urutan, cover, focal point), proyek unggulan, status *Borrador/Publicado/Programado*. |
| **Categorías** | Construcción, Industria, Montaje, Mantención, Obras civiles (bisa ditambah). |
| **Equipo** | Foto (crop 4:5 di CMS), nama, cargo, kategori, bio, LinkedIn, email publik, urutan, `show_on_home`. |
| **Clientes & Testimonios** | Logo (SVG/PNG), nama, sektor, link; testimoni terhubung ke klien & proyek, wajib persetujuan publikasi (checkbox). |
| **Certificaciones & Registros** | Nama, entitas penerbit, nomor, tanggal terbit/expiry (pengingat email 30 hari sebelum kedaluwarsa), PDF, logo. |
| **Seguridad (indicadores)** | Input periodik: HH trabajadas, accidentes, días sin accidentes, tasa; tanggal pembaruan tampil di situs. |
| **Estadísticas** | Label, nilai, sufiks (+, m², t), ikon, urutan. Nilai 0/kosong → otomatis disembunyikan. |
| **Noticias** | Post dengan editor, kategori, cover, penulis, publish terjadwal. |
| **FAQ** | Pertanyaan/jawaban, kategori, urutan. |
| **Descargas** | File PDF di storage + judul, kategori, tampil/sembunyi. |
| **Empleos** | Lowongan: cargo, ubicación, tipo (plazo fijo/indefinido/por obra), requisitos, fecha cierre; status. |
| **Bandeja: Cotizaciones** | Daftar + filter (status, layanan, región, tanggal), detail dengan lampiran (download via signed URL), **pipeline status** *Nueva → En revisión → Visita técnica → Cotizada → Adjudicada / No adjudicada*, penugasan ke user, catatan internal, export CSV. |
| **Bandeja: Contacto** | Pesan kontak, tandai dibaca/dijawab. |
| **Bandeja: Postulaciones** | CV (signed URL), status *Recibida → Preseleccionada → Entrevista → Descartada/Contratada*. |
| **Proveedores** | Registro pemasok/subkontraktor (RUT, rubro, documentos). |
| **Media library** | Upload drag‑and‑drop (multi), metadata **alt (wajib)**, caption, crédito, focal point, folder/tag, pencarian, deteksi file tidak terpakai, penggantian file. |
| **Configuración** | Data perusahaan (razón social, RUT, alamat, teléfono, email, WhatsApp, horario, redes), logo, email penerima notifikasi per jenis form, kode analytics, banner pengumuman. |
| **SEO & Redirects** | Default meta, OG image, redirect 301 (penting untuk migrasi URL WordPress lama). |
| **Usuarios** | Undang via email, peran, nonaktifkan, reset 2FA. |
| **Auditoría** | Log siapa mengubah apa & kapan. |

### 5.3 Fitur lintas modul

- **Draft / Publicado / Programado** pada konten utama; jadwal publish dijalankan oleh **Cron Trigger** Workers (tiap 5 menit).
- **Preview** halaman sebelum publish (`/api/preview?token=…`, token sekali pakai, `noindex`).
- **Riwayat revisi** (tabel `revisions`, snapshot JSON) dengan tombol *Restaurar*.
- **Kolom SEO per entitas**: meta title, description, OG image, `noindex`.
- **Slug otomatis** dari judul (normalisasi aksen: "Montaje Industrial" → `montaje-industrial`), unik, dengan redirect otomatis bila slug berubah.
- **Validasi panjang** sesuai design system (judul ≤ 60, ringkasan ≤ 160).
- **Invalidasi cache:** setiap publish memanggil `bumpVersion()` pada KV.
- **Autosave** draft di editor (tiap 10 detik, lokal + server).
- **Bahasa UI CMS:** Spanyol (agar tim Othalan nyaman).

---

## 6. Model Data (PostgreSQL)

### 6.1 Konvensi

- PK `uuid` (`gen_random_uuid()`), `created_at`/`updated_at` `timestamptz`, soft delete `deleted_at` pada konten.
- Enum Postgres untuk status; slug `citext` unik.
- Konten rich text disimpan sebagai `jsonb` (Tiptap).
- Indeks pada `status`, `published_at`, `slug`, `category_id`, `sort_order`.

### 6.2 Tabel

| Domain | Tabel | Kolom penting |
|---|---|---|
| **Auth** | `users`, `sessions`, `accounts`, `verifications`, `two_factors` *(Better Auth)* | `role` enum(`admin`,`editor`,`comercial`,`rrhh`), `active` |
| **Pengaturan** | `site_settings` | `key` PK, `value jsonb` (contact, social, legal, analytics, notification_emails) |
| | `offices` | nama, alamat, comuna, región, lat/lng, teléfono, horario |
| | `redirects` | `from_path` unik, `to_path`, `status_code` |
| **Media** | `media` | `storage_key`, `mime`, `width`, `height`, `bytes`, `alt_es`, `caption_es`, `credit`, `focal_x`, `focal_y`, `blurhash`, `dominant_color`, `folder`, `uploaded_by` |
| **Halaman** | `pages` | `slug`, `title`, `blocks jsonb`, `seo jsonb`, `status` |
| | `home_sections` | `key`, `enabled`, `sort_order`, `data jsonb` |
| **Layanan** | `services` | `slug`, `title`, `icon`, `summary`, `body jsonb`, `capabilities jsonb`, `cover_media_id`, `sort_order`, `status`, `seo` |
| **Proyek** | `project_categories` | `slug`, `name`, `sort_order` |
| | `projects` | `slug`, `title`, `category_id`, `client_id`, `region`, `comuna`, `year`, `area_m2`, `steel_tons`, `duration_months`, `amount_clp` (privat), `show_amount`, `summary`, `challenge`, `solution`, `result` (jsonb), `cover_media_id`, `featured`, `status`, `published_at`, `seo` |
| | `project_media` | `project_id`, `media_id`, `sort_order`, `caption_es` |
| | `project_services` | relasi n‑n proyek ↔ layanan |
| **Organisasi** | `team_members` | `name`, `role_title_es`, `group` enum(`directivo`,`jefatura`,`equipo`), `bio`, `photo_media_id`, `linkedin_url`, `email_public`, `show_on_home`, `sort_order`, `status` |
| | `timeline_events` | `year`, `title`, `description` |
| | `values` | `title`, `description`, `icon`, `sort_order` |
| **Kepercayaan** | `clients` | `name`, `logo_media_id`, `sector`, `url`, `featured` |
| | `testimonials` | `client_id`, `project_id`, `author_name`, `author_role`, `quote`, `consent`, `status` |
| | `certifications` | `name`, `issuer`, `code`, `issued_at`, `expires_at`, `file_media_id`, `logo_media_id`, `kind` enum(`certificacion`,`registro`) |
| | `safety_stats` | `period`, `hh_worked`, `accidents`, `days_without_accidents`, `rate`, `published` |
| | `stats` | `label`, `value`, `suffix`, `icon`, `sort_order` |
| **Konten lain** | `posts`, `faqs`, `downloads` | standar |
| **Rekrutmen** | `job_openings` | `slug`, `title`, `location`, `contract_type`, `body`, `closes_at`, `status` |
| | `job_applications` | `job_id`, `name`, `rut`, `email`, `phone`, `cv_storage_key`, `message`, `status`, `consent_at` |
| **Lead** | `rfq_requests` | `ticket_code` unik (`RFQ-2026-00001`), `status` enum, `assigned_to`, `contact jsonb`, `project jsonb`, `service_id`, `region`, `budget_range`, `source_url`, `utm jsonb`, `consent_at`, `ip_hash` |
| | `rfq_files` | `rfq_id`, `storage_key`, `filename`, `mime`, `bytes` |
| | `rfq_notes` | `rfq_id`, `user_id`, `body` |
| | `contact_messages`, `supplier_registrations` | standar + `status` |
| **Sistem** | `revisions` | `entity`, `entity_id`, `snapshot jsonb`, `user_id` |
| | `audit_log` | `user_id`, `action`, `entity`, `entity_id`, `diff jsonb`, `ip_hash` |

### 6.3 Seed awal

- Kategori proyek (5), layanan (4 dari situs lama: *Ingeniería y planificación*, *Construcción y obras civiles*, *Montaje y soluciones industriales*, *Mantención y mejoras*), nilai perusahaan (*Seguridad, Calidad, Cumplimiento, Criterio técnico, Compromiso en terreno, Trato directo*).
- **Equipo directivo** (3 orang, foto hasil edit).
- 3 foto pekerjaan dari `assets/works/` sebagai proyek contoh (status *Borrador* sampai datanya dilengkapi).
- User admin pertama dibuat via script `scripts/seed.ts` (password diatur sendiri oleh pemilik melalui link undangan).

### 6.4 Kesiapan multi‑bahasa

Kolom teks utama diberi sufiks `_es`; tabel `translations` (entity, field, locale, value) dapat ditambahkan di Fase 2 tanpa migrasi besar.

---

## 7. Media & Object Storage

### 7.1 Struktur bucket

```
othalan-media/
├─ public/media/{yyyy}/{mm}/{uuid}.{ext}     # gambar & PDF publik (via CDN)
├─ private/rfq/{rfq_id}/{uuid}-{filename}    # lampiran cotización (signed URL saja)
├─ private/cv/{application_id}/{uuid}.pdf    # CV pelamar
└─ private/suppliers/{id}/…
```

### 7.2 Alur upload (tanpa melewati batas body Worker)

1. CMS / form → `POST /api/upload/presign` (cek sesi/peran atau Turnstile, MIME, ukuran) → presigned **PUT** URL berlaku 10 menit.
2. Browser upload langsung ke storage, dengan progress bar di `FileDropzone`.
3. Di CMS: browser menghitung `width`, `height`, `blurhash`, dan `dominant_color` dari gambar (canvas) sebelum/selama upload.
4. `POST /api/media/confirm` → server memverifikasi objek (`HEAD`: ukuran & content‑type) → insert ke `media`.
5. **Delivery publik:** `https://www.othalan.cl/cdn-cgi/image/width=768,format=auto,quality=80/media/…` (Image Transformations) atau route Worker `/media/*` yang mem‑proxy storage dengan cache 1 tahun.
6. **File privat:** hanya lewat signed **GET** URL berumur pendek (5 menit) yang dibuat setelah cek peran.

### 7.3 Batasan

| Jenis | Format | Maks |
|---|---|---|
| Gambar CMS | JPG, PNG, WebP, AVIF | 20 MB, sisi panjang ≤ 8000 px |
| Dokumen CMS | PDF | 25 MB |
| Lampiran cotización | PDF, DWG, DXF, JPG, PNG, XLSX, DOCX, ZIP | 25 MB/file, 10 file |
| CV | PDF, DOCX | 5 MB |

- EXIF/GPS dihapus dari gambar publik. Browser me‑re‑encode gambar sebelum upload di CMS. Lihat keputusan **D3** di §16.
- Komponen `ResponsiveImage` (design system §12.2) membangun `srcset` dari helper `imageUrl(key, { w, format })`.

---

## 8. Form: Cotización, Contacto, Empleo

| Form | Langkah / field | Server | Notifikasi |
|---|---|---|---|
| **Cotización** | 4 langkah sesuai design system §7.3.5 (Contacto → Proyecto → Detalles & archivos → Revisión) | Form action + Valibot; nomor tiket berurutan per tahun (sequence Postgres) | Email ke `comercial` (isi + link CMS) & konfirmasi ke pengirim; opsional webhook WhatsApp/Slack |
| **Contacto** | nombre, email, teléfono, empresa, mensaje | Form action | Email ke penerima yang diatur di CMS |
| **Postulación** | nombre, RUT, email, teléfono, cargo, CV, mensaje | Form action + upload privat | Email ke `rrhh` |
| **Proveedores** | razón social, RUT, rubro, contacto, documentos | Form action | Email ke `comercial` |

**Aturan umum:**

- Validasi **RUT** (módulo 11), teléfono `+56`, email; pesan error dalam bahasa Spanyol yang ramah.
- **Turnstile** (managed/invisible) + honeypot + **Rate Limiting binding** (5 submit/menit/IP) + penolakan submit < 3 detik setelah render.
- Checkbox **consentimiento** dengan link Política de Privacidad; `consent_at` disimpan.
- `use:enhance` untuk UX tanpa reload, dengan fallback tanpa JS.
- Tracking konversi (event `generate_lead`) hanya setelah consent analytics.

---

## 9. SEO, Performa & Aksesibilitas

### 9.1 SEO

- `<html lang="es-CL">`, meta title/description per halaman dari CMS, canonical, Open Graph & Twitter card (OG image default bermerek).
- **Schema.org JSON‑LD:** `GeneralContractor` / `Organization` (nama, logo, RUT sebagai `taxID`, alamat, `areaServed`: regiones de Chile, `sameAs`), `WebSite`, `BreadcrumbList`, `Service`, `CreativeWork` untuk proyek, `JobPosting` untuk lowongan, `FAQPage`, `Person` untuk tim.
- `sitemap.xml` dinamis (termasuk `lastmod`), `robots.txt`; environment preview `noindex`.
- **Redirect 301** dari URL WordPress lama (dikumpulkan di Fase 0).
- Google Search Console + Bing Webmaster; sinkronisasi **Google Business Profile** (alamat, telepon, jam, foto).
- Kata kunci target (contoh): *empresa constructora [región]*, *estructuras metálicas Chile*, *montaje industrial*, *obras civiles*, *mantención industrial*, *galpones industriales*.

### 9.2 Performa (target mobile 4G)

| Metrik | Target |
|---|---|
| LCP | < 2,5 s |
| CLS | < 0,05 |
| INP | < 200 ms |
| JS halaman publik | < 90 KB gzip |
| Lighthouse (4 kategori) | ≥ 90 |

Caranya: SSR + cache KV, preload font kritis, gambar `srcset` + AVIF, `fetchpriority="high"` hanya untuk hero, lazy‑load peta (embed muncul setelah klik), dan route CMS di‑split dari bundle publik.

### 9.3 Aksesibilitas

WCAG 2.2 AA sesuai design system §13; uji otomatis axe di setiap PR + uji manual NVDA/VoiceOver untuk form cotización dan navigasi.

---

## 10. Keamanan & Kepatuhan Hukum Chile

### 10.1 Keamanan aplikasi

- Header: CSP ketat (nonce via `kit.csp`), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.
- CSRF: proteksi bawaan SvelteKit (origin check) untuk form actions.
- Auth CMS: password + **2FA TOTP wajib untuk admin**, sesi 12 jam idle / 7 hari maks, rate limit login, lockout bertahap. `/admin` juga dapat dilindungi **Cloudflare Access** sebagai lapisan tambahan (opsional).
- Otorisasi di server pada **setiap** load/action (`requireRole`), bukan hanya disembunyikan di UI.
- Sanitasi rich text saat render; upload hanya ke storage (tidak dieksekusi) dengan whitelist MIME dan ekstensi.
- Secrets di `wrangler secret`; tidak ada secret di repo; rotasi kunci storage tiap 6 bulan.
- IP disimpan sebagai hash (SHA‑256 + salt), bukan teks asli.
- Backup: Neon point‑in‑time restore + `pg_dump` mingguan ke storage privat; versioning bucket bila didukung penyedia.

### 10.2 Perlindungan data pribadi

- **Ley 19.628** (berlaku) dan **Ley 21.719** (undang‑undang perlindungan data baru yang dijadwalkan berlaku penuh pada **1 Desember 2026**, hanya beberapa minggu setelah rencana peluncuran). Situs harus disiapkan sesuai standar baru:
  - Política de privacidad yang menjelaskan tujuan, dasar hukum (consentimiento), masa simpan, penerima data (email provider, storage), serta hak ARCO+ (acceso, rectificación, supresión, oposición, portabilidad).
  - Masa simpan: cotización 3 tahun, CV 1 tahun, pesan kontak 2 tahun → **job purge otomatis** (Cron Trigger).
  - Fitur CMS: **export & hapus data** per orang (atas permintaan).
- Banner cookie: analytics non‑esensial **default off**.
- **Catatan:** isi legal final wajib ditinjau oleh pengacara Chile. Rencana ini bukan nasihat hukum.

### 10.3 Canal de denuncias (direkomendasikan)

Perusahaan di Chile umumnya menyediakan kanal pelaporan untuk **Ley 21.643 (Ley Karin)** terkait pelecehan/kekerasan kerja, dan untuk modelo de prevención de delitos (**Ley 20.393**) bila relevan. Opsi: halaman informasi + form anonim terenkripsi, atau link ke layanan pihak ketiga. Konfirmasi dengan klien (**D6**).

---

## 11. Fase Eksekusi & Timeline

Estimasi untuk tim **1 tech lead/full‑stack + 1 front‑end + 1 UI/UX (paruh waktu) + QA (paruh waktu)**. Total ± **12 minggu** hingga go‑live, ditambah 4 minggu hypercare.

```
Minggu:        1   2   3   4   5   6   7   8   9  10  11  12  13–16
F0 Discovery   ███
F1 Fondasi         ███
F2 Design sys.     ███████
F3 Data & CMS          ███████████
F4 Situs publik            ███████████
F5 Form & email                    ███████
F6 Konten & migrasi                    ███████████
F7 QA & hardening                              ███████
F8 Go‑live                                         ███
F9 Hypercare                                           ████████
```

### F0 — Discovery & Persiapan (Minggu 1)

| Tugas | Output |
|---|---|
| Kickoff dengan pemilik: tujuan, KPI, persona (mandante privat, tambang/industri, sektor publik, pelamar kerja) | Brief disetujui |
| Inventaris konten & URL situs lama (WordPress/Elementor); daftar redirect | `content-inventory.xlsx`, `redirects.csv` |
| Kumpulkan data perusahaan: razón social, RUT, alamat, kontak, sertifikasi, registros, daftar proyek + foto, klien, testimoni | Checklist §16.2 terisi |
| Putuskan keputusan terbuka D1–D7 (§16) | Decision log |
| Siapkan akun: Cloudflare (Workers Paid), Neon, storage, Resend, GitHub, domain DNS | Akses tim |
| Wireframe low‑fi halaman utama + CMS | Disetujui klien |

**Selesai bila:** brief, sitemap final, dan keputusan D1–D7 disetujui tertulis.

### F1 — Fondasi Proyek (Minggu 2)

- [ ] Inisialisasi repo SvelteKit (TS strict, ESLint, Prettier, Vitest, Playwright, Storybook).
- [ ] `adapter-cloudflare`, `wrangler.jsonc`, binding KV + rate limit, deploy "hello world" ke `*.workers.dev`.
- [ ] Neon: project + branch `main`, `preview`, `dev`; Drizzle + migrasi awal.
- [ ] Storage: bucket, CORS untuk upload dari domain admin, kunci akses.
- [ ] `hooks.server.ts`: db per request, security headers, locale `es-CL`.
- [ ] CI GitHub Actions: lint → check → unit → build; preview deploy per PR + Neon branch per PR.

**Selesai bila:** PR otomatis menghasilkan URL preview dengan database branch sendiri.

### F2 — Implementasi Design System (Minggu 2–3)

- [ ] `tokens.css`, `semantic.css`, `base.css`, `layout.css` sesuai DESIGN-SYSTEM §11.
- [ ] Font self‑host + preload.
- [ ] Komponen atom & molekul: Button (4 varian × states), IconButton, Badge/Tag, Eyebrow, SectionHeading, TextField, Textarea, Select, Combobox (comunas), Checkbox, Radio, RadioCard, ChipGroup, FileDropzone, FormStepper, ErrorSummary, Alert, Toast, Skeleton, Spinner.
- [ ] Kartu: ProjectCard, ServiceCard, FeatureCard, StatCard, **TeamCard**, TestimonialCard.
- [ ] Navigasi: Header (mega‑menu + drawer), Footer, Breadcrumb, Pagination, SkipLink, WhatsApp float.
- [ ] Media: ResponsiveImage, GalleryGrid, Lightbox.
- [ ] Story Storybook untuk tiap state + addon a11y.

**Selesai bila:** semua komponen ada di Storybook, lolos axe, dan disetujui UI/UX.

### F3 — Data Layer & CMS (Minggu 3–6)

- [ ] Skema Drizzle lengkap (§6) + migrasi + seed.
- [ ] Better Auth: login, undangan user, reset password, 2FA, peran; guard `requireRole`.
- [ ] Shell admin: layout, navigasi samping, DataTable (sort/filter/paginate), form builder, konfirmasi hapus, toast.
- [ ] Media library + alur presign/confirm + focal point + crop 4:5 untuk foto tim.
- [ ] Modul konten (§5.2) secara berurutan: Configuración → Servicios → Proyectos (+galeri) → **Equipo** → Clientes/Testimonios → Certificaciones/Seguridad/Estadísticas → Inicio builder → Páginas → FAQ/Descargas → Noticias → Empleos.
- [ ] Draft/publish/schedule, preview, revisions, audit log, invalidasi cache KV.
- [ ] Cron Trigger: publish terjadwal, pengingat sertifikat kedaluwarsa, purge data.

**Selesai bila:** editor non‑teknis dapat membuat proyek lengkap dengan 10 foto dan mempublikasikannya dalam < 10 menit (uji dengan pengguna dari Othalan).

### F4 — Situs Publik (Minggu 4–7)

- [ ] Layout `(site)` + Header/Footer dari `site_settings`.
- [ ] Halaman: Inicio, Servicios (+detail), Proyectos (+filter via query string, LoadMore + pagination, detail + lightbox), Nosotros (+**Equipo directivo**), Seguridad y calidad, Clientes, Contacto, Descargas, Trabaja con nosotros, Noticias, FAQ, legal, 404/500.
- [ ] Empty state dan penyembunyian komponen saat data kosong.
- [ ] SEO: meta, JSON‑LD, sitemap, robots, OG image.
- [ ] Cache KV untuk query publik, `Cache-Control` sesuai jenis halaman.

**Selesai bila:** semua halaman dirender dari data CMS (tanpa hard‑code) dan Lighthouse mobile ≥ 90 di preview.

### F5 — Form, Email & Integrasi (Minggu 7–8)

- [ ] Form cotización multi‑langkah + draft `sessionStorage` + upload lampiran privat + nomor tiket.
- [ ] Form contacto, postulación, proveedores.
- [ ] Turnstile, honeypot, rate limit.
- [ ] Template email (ES) bermerek: notifikasi internal + konfirmasi; domain pengirim terverifikasi (SPF, DKIM, DMARC).
- [ ] Inbox CMS + pipeline status + export CSV.
- [ ] Analytics + consent banner + event konversi.

**Selesai bila:** uji end‑to‑end dari pengisian form hingga email diterima dan entri muncul di CMS, di desktop & mobile.

### F6 — Konten & Migrasi (Minggu 7–10)

- [ ] Copywriting ES‑CL untuk semua halaman (draft oleh tim, review oleh pemilik).
- [ ] Input ≥ 12 proyek dengan ficha técnica dan foto terkurasi (lihat aturan APD di design system §9.1).
- [ ] Upload foto **Equipo directivo** hasil edit (§17) + bio.
- [ ] Logo SVG (emblem, horizontal, monokrom, favicon), sesuai design system §9.6.
- [ ] Sertifikasi, registros, indikator keselamatan, klien & testimoni (dengan izin tertulis).
- [ ] Teks legal (privasi, cookie, términos) ditinjau pengacara.
- [ ] Peta redirect URL lama → baru diimpor ke tabel `redirects`.

**Selesai bila:** pemilik menyetujui seluruh konten di staging.

### F7 — QA & Hardening (Minggu 10–11)

- [ ] Rangkaian tes §12 lulus.
- [ ] Uji keamanan: OWASP ZAP baseline, uji akses peran, uji upload berbahaya.
- [ ] Uji beban ringan form (k6, 50 RPS), memverifikasi rate limit.
- [ ] Uji lintas peramban/perangkat (Chrome, Safari iOS, Firefox, Edge, Android).
- [ ] Pelatihan CMS (2 sesi × 90 menit, bahasa Spanyol) + manual singkat PDF/video.

### F8 — Go‑live (Minggu 12)

Lihat checklist §14.1.

### F9 — Hypercare (Minggu 13–16)

Monitoring harian minggu pertama, perbaikan bug prioritas, laporan KPI bulanan pertama, dan backlog Fase 2.

### Ringkasan deliverable per fase

| Fase | Deliverable utama | Persetujuan oleh |
|---|---|---|
| F0 | Brief, sitemap, decision log, wireframe | Pemilik |
| F2 | Storybook design system | UI/UX + Pemilik |
| F3 | CMS di staging | Perwakilan editor Othalan |
| F4–F5 | Situs publik + form berfungsi di staging | Pemilik |
| F6 | Konten final | Pemilik |
| F7 | Laporan QA | Tech lead |
| F8 | Situs produksi | Pemilik |

---

## 12. Testing & QA

| Jenis | Alat | Cakupan |
|---|---|---|
| Unit | Vitest | `rut.ts`, `phone-cl.ts`, format CLP/tanggal, slug, guard peran, builder `srcset` |
| Komponen | Vitest + Testing Library / Storybook interaction | Button states, form field error, stepper |
| E2E | Playwright (desktop + mobile viewport) | Navigasi, filter proyek, lightbox, **form cotización lengkap dengan upload**, login CMS + 2FA, CRUD proyek & tim, publish → tampil di situs |
| Aksesibilitas | axe (Playwright & Storybook), uji manual screen reader | Semua template halaman & form |
| Visual regression | Playwright screenshots / Chromatic | Komponen kunci & halaman utama |
| Performa | Lighthouse CI (budget §9.2) | Inicio, Proyectos, Detalle proyek, Cotización |
| Keamanan | ZAP baseline, `npm audit`, Dependabot | Setiap rilis |
| Konten | Link checker, validasi `alt` kosong, Rich Results Test | Sebelum go‑live |

**Definition of Done per fitur:** kode di‑review, tes lulus, story Storybook ada, sesuai token design system, a11y tanpa pelanggaran serius, teks ES‑CL tanpa typo, dan dokumentasi CMS diperbarui.

---

## 13. Deployment, Environment & CI/CD

| Environment | Worker | Database Neon | Storage | Domain |
|---|---|---|---|---|
| Local | `vite dev` (+ `wrangler dev` untuk binding) | branch `dev-<nama>` | bucket dev | `localhost` |
| Preview (per PR) | versi preview Worker | branch otomatis per PR | bucket dev | `*.workers.dev` (noindex) |
| Staging | `othalan-web-staging` | branch `staging` | bucket staging | `staging.othalan.cl` (Cloudflare Access) |
| Production | `othalan-web` | branch `main` (dengan PITR) | bucket produksi | `www.othalan.cl` (+ redirect apex) |

**Pipeline (GitHub Actions):**

1. `ci.yml` (setiap PR): install → lint → `svelte-check` → unit → build → Playwright (melawan preview) → Lighthouse CI.
2. `preview.yml`: buat Neon branch (`neondatabase/create-branch-action`) → `drizzle-kit migrate` → `wrangler versions upload` → komentar URL di PR → hapus branch saat PR ditutup.
3. `deploy.yml` (merge ke `main`): migrasi ke staging → deploy staging → smoke test → **approval manual** → backup snapshot → migrasi produksi → `wrangler deploy` → smoke test → notifikasi.

**Aturan migrasi:** hanya perubahan *expand → migrate → contract* (kompatibel mundur) agar rollback Worker aman. Rollback via `wrangler rollback` + Neon restore point.

---

## 14. Peluncuran & Pasca‑Peluncuran

### 14.1 Checklist go‑live

- [ ] DNS `othalan.cl` di Cloudflare (catat TTL lama, turunkan 24 jam sebelumnya)
- [ ] SSL Full (strict), HSTS, redirect apex → `www`
- [ ] Redirect 301 URL lama terverifikasi (sampel 100 %)
- [ ] Email: SPF, DKIM, DMARC untuk domain pengirim; uji ke Gmail/Outlook
- [ ] Turnstile & rate limit aktif di produksi
- [ ] Sitemap dikirim ke Search Console; properti GA/Cloudflare Analytics aktif
- [ ] Google Business Profile diperbarui dengan URL baru
- [ ] Backup awal & uji restore
- [ ] Akun CMS untuk semua pengguna Othalan + 2FA admin
- [ ] Hapus kredit/footer lama yang tidak relevan; pastikan statistik bukan "0"
- [ ] Rencana komunikasi (LinkedIn, email ke klien)

### 14.2 Operasional berkelanjutan

| Kegiatan | Frekuensi |
|---|---|
| Review inbox cotización (SLA < 24 jam) | Harian (tim comercial) |
| Tambah proyek baru + foto | Setiap proyek selesai |
| Update indikator keselamatan | Bulanan |
| Cek sertifikat kedaluwarsa (otomatis + review) | Bulanan |
| Laporan KPI (trafik, lead, konversi, Core Web Vitals) | Bulanan |
| Update dependensi & patch keamanan | Bulanan |
| Uji restore backup | Triwulan |

---

## 15. Risiko & Mitigasi

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R1 | Penyedia object storage belum pasti (lihat **D1**) | Tinggi | Lapisan `storage/s3.ts` berbasis API S3 generik; dapat diganti tanpa mengubah UI/CMS |
| R2 | Library Node (mis. `sharp`, SMTP) tidak berjalan di Workers | Sedang | Pilih library berbasis `fetch`; gambar via Image Transformations / pemrosesan di browser |
| R3 | Batas CPU/ukuran bundle Worker | Sedang | Split bundle CMS, hindari dependensi berat, pantau ukuran di CI |
| R4 | Konten (foto/proyek/testimoni) terlambat dari klien | Tinggi | Daftar kebutuhan di F0, tenggat per minggu, template input di CMS lebih awal (F3) |
| R5 | Foto lapangan menampilkan pekerja tanpa APD | Sedang (reputasi) | Kurasi wajib, checklist APD sebelum publish |
| R6 | Spam pada form | Sedang | Turnstile + honeypot + rate limit + moderasi |
| R7 | Kepatuhan Ley 21.719 menjelang berlaku | Sedang | Tinjauan pengacara, fitur hak data di CMS, retensi otomatis |
| R8 | Kehilangan SEO saat migrasi | Sedang | Peta redirect lengkap, Search Console, pantau 404 minggu pertama |
| R9 | Cold start koneksi DB | Rendah | Driver HTTP Neon, cache KV untuk halaman publik, pertimbangkan Hyperdrive |
| R10 | Kualitas foto sumber rendah (ponsel) | Sedang | Jadwalkan sesi foto profesional di lapangan (Fase 6/pasca‑rilis) |

---

## 16. Keputusan Terbuka & Kebutuhan dari Klien

### 16.1 Keputusan teknis/bisnis

| ID | Keputusan | Rekomendasi |
|---|---|---|
| **D1** | **Penyedia object storage.** Brief menyebut "Object Storage dari Neon". Neon dikenal sebagai layanan Postgres; ketersediaan, API, dan harga layanan object storage dari Neon perlu **diverifikasi di dokumentasi resmi** sebelum F1. | Jika tersedia & kompatibel S3, pakai sesuai brief. Jika tidak, pakai **Cloudflare R2** (binding native di Workers, tanpa biaya egress), dengan kode adapter yang sama. |
| D2 | Penyedia email transaksional | Resend (alternatif: Postmark, Amazon SES) |
| D3 | Strategi varian gambar | Image Transformations Cloudflare (paket berbayar) + re‑encode di browser saat upload |
| D4 | Lapisan Cloudflare Access untuk `/admin` | Ya, untuk staging; opsional di produksi (2FA sudah wajib) |
| D5 | Analytics | Cloudflare Web Analytics (tanpa cookie) + GA4 dengan consent |
| D6 | Canal de denuncias: form internal atau layanan pihak ketiga | Diskusikan dengan legal/klien |
| D7 | Nama jabatan tim dalam ES atau EN di situs | ES (konsisten dengan situs) |

### 16.2 Data & materi yang dibutuhkan dari Othalan

- [ ] Razón social, RUT, giro, alamat kantor/taller, telepon, email, horario, akun media sosial
- [ ] Tahun berdiri, sejarah singkat, misi, visi
- [ ] Daftar proyek (min. 12) dengan data ficha técnica + foto resolusi penuh + izin publikasi mandante
- [ ] Logo dalam format vektor (atau persetujuan untuk digambar ulang)
- [ ] Bio singkat & LinkedIn untuk 3 anggota Equipo directivo; konfirmasi jabatan
- [ ] Sertifikasi, registros de contratista, afiliasi mutualidad, indikator keselamatan
- [ ] Logo klien + izin; testimoni dengan nama & jabatan + izin tertulis
- [ ] Daftar maquinaria/equipos & kapasitas taller
- [ ] Email penerima notifikasi per jenis form
- [ ] Akses domain/DNS dan hosting situs lama
- [ ] Brochure corporativo (bila ada)

---

## 17. Lampiran: Foto Equipo Directivo

Foto para pejabat sudah disunting dan disimpan di **`assets/stakeholders/edited/`**:

| File | Keterangan |
|---|---|
| `juan-marcelo-escalona-aranda.jpg` / `.webp` | Gerente General |
| `simon-calaf-aguilera.jpg` / `.webp` | Jefe de Operaciones |
| `consuelo-escalona.jpg` / `.webp` | Jefa de Desarrollo de Negocios |
| `*-cutout.png` | Versi latar transparan (untuk komposisi lain, mis. latar Carbón atau banner) |

**Yang dilakukan:**

- Latar belakang asli dihapus (ruang rumah, pintu, dan papan informasi di belakang) dan diganti latar studio seragam bergradasi warna **Hormigón** dari design system (`#F6F4EF` → `#CFCAC1`) dengan bayangan lembut.
- Format seragam **4:5, 1200 × 1500 px**; tinggi kepala dan garis mata disamakan (mata di ±38 % dari atas) agar ketiganya sejajar di grid.
- Koreksi warna ringan (auto‑level, kontras, saturasi), sedikit sharpening setelah pembesaran.
- **Tidak ada retouching wajah atau perubahan fitur** demi keaslian. Untuk Consuelo dipakai foto **asli** (bukan versi PNG yang sudah diproses sebelumnya).

**Catatan kualitas:** resolusi sumber terbatas (foto ponsel 915–1200 px), sehingga foto diperbesar ±1,4–1,7×. Hasilnya layak untuk kartu tim di web (tampil ±400 px), tetapi **untuk hasil terbaik disarankan sesi foto profesional** dengan latar, pencahayaan, dan busana yang seragam (mis. kemeja + rompi/helm berlogo Othalan untuk nuansa lapangan). Sesi foto ini bisa masuk Fase 6 atau pasca‑rilis.

---

*Execution Plan v1.0. Dokumen hidup: setiap perubahan ruang lingkup dicatat di decision log dan disetujui pemilik proyek.*
