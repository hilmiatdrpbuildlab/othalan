# Othalan — Website & CMS

Website company profile berbahasa Spanyol (Chile) + CMS untuk **Othalan Ingeniería y Construcción**.
SvelteKit 2 (Svelte 5) · PostgreSQL **Neon** · **Neon Object Storage** (S3) · deploy ke **Cloudflare Workers**.
Desain mengikuti [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md); ruang lingkup mengikuti [`execution_plan.md`](./execution_plan.md).

---

## Mulai cepat (lokal, tanpa setup apa pun)

```bash
npm install
npm run dev          # http://localhost:5173  ·  CMS: http://localhost:5173/admin
```

Saat pertama kali dijalankan **tanpa** `DATABASE_URL`, dev server otomatis:

1. membuat database **PGlite** (Postgres embedded) di `.data/pglite` dan menjalankan migrasi;
2. mengisi konten awal (layanan, Equipo directivo + foto, 3 proyek contoh berstatus *Borrador*, FAQ, halaman legal);
3. membuat admin `admin@othalan.cl` dengan password sementara yang dicetak di terminal **dan** disimpan di `.data/admin-credentials.txt`.

File upload disimpan di `.data/storage`. Untuk mulai dari nol: hentikan server, hapus `.data/`, jalankan lagi.

> Ingin develop langsung ke Neon? Salin `.env.example` → `.env`, isi `DATABASE_URL` (branch dev Neon) dan variabel `STORAGE_*`, lalu `npm run db:setup`.

### Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server (PGlite + storage lokal bila `.env` kosong) |
| `npm run check` | `svelte-check` (TypeScript strict) |
| `npm test` | Unit test (RUT, telepon, format CL, slug, zona waktu Santiago, sanitasi Markdown, password) |
| `node tests/e2e/smoke.mjs <email> <password>` | Tes end‑to‑end (perlu `npm run dev` berjalan & Chrome terpasang) |
| `npm run build` | Build produksi untuk Cloudflare Workers |
| `npm run db:generate` | Buat migrasi SQL baru dari `src/lib/server/db/schema.ts` |
| `npm run db:migrate` / `db:seed` / `db:setup` | Migrasi / seed (Neon bila `DATABASE_URL` diisi, selain itu PGlite) |
| `npm run user:create -- <email> <rol> "<Nombre>"` | Buat/reset pengguna CMS (`admin`, `editor`, `comercial`, `rrhh`) |
| `npm run photos:team` | Proses ulang foto Equipo directivo dari `*-cutout.png` |
| `node scripts/screenshot.mjs <ruta> <out.png> [ancho] [--full]` | Screenshot untuk QA visual |

---

## Deploy produksi

### 1. Neon (database + object storage)

1. Buat project Neon (region **AWS us-east-1/us-east-2** — Object Storage saat ini tersedia di region AWS tertentu; cek dokumentasi Neon).
2. Ambil connection string (pooled) → `DATABASE_URL`.
3. Aktifkan **Object Storage** pada branch `main`, buat bucket `othalan-media` (akses **private** cukup — semua file publik dilayani lewat Worker di `/media/*`, file privat lewat `/admin/archivos/*` dengan cek peran).
4. Catat `s3_endpoint`, `token_id` (`nak_live_…`) dan `s3_secret_access_key` (`nsk_live_…`).
5. Migrasi + seed:
   ```bash
   DATABASE_URL=... STORAGE_ENDPOINT=... STORAGE_ACCESS_KEY_ID=... STORAGE_SECRET_ACCESS_KEY=... \
   SEED_ADMIN_EMAIL=admin@othalan.cl SEED_ADMIN_PASSWORD='<contraseña segura>' npm run db:setup
   ```

> Storage memakai API S3 generik (`aws4fetch`, path‑style). Bila nanti pindah ke Cloudflare R2 atau S3 lain, cukup ganti variabel `STORAGE_*` — kode tidak berubah.

### 2. Cloudflare Workers

```bash
npx wrangler login
npx wrangler secret put DATABASE_URL
npx wrangler secret put STORAGE_ENDPOINT
npx wrangler secret put STORAGE_ACCESS_KEY_ID
npx wrangler secret put STORAGE_SECRET_ACCESS_KEY
npx wrangler secret put SESSION_SECRET        # string acak ≥ 32 karakter
npx wrangler secret put CRON_SECRET           # untuk /api/cron
npx wrangler secret put RESEND_API_KEY        # opsional: email notifikasi
npx wrangler secret put TURNSTILE_SECRET_KEY  # opsional: anti-spam (+ var PUBLIC_TURNSTILE_SITE_KEY)
npm run deploy
```

Variabel non‑rahasia ada di `wrangler.jsonc` (`PUBLIC_SITE_URL`, `STORAGE_BUCKET`, `STORAGE_REGION`, `EMAIL_FROM`, `PUBLIC_IMAGE_TRANSFORMS`).
Binding **Rate Limiting** `FORM_LIMITER` (5 kiriman/menit/IP) sudah dikonfigurasi.

- **Image Transformations**: aktifkan di zona Cloudflare lalu set `PUBLIC_IMAGE_TRANSFORMS=true` → `srcset` otomatis (480–1920 px, AVIF/WebP).
- **Email**: verifikasi domain pengirim di Resend (SPF/DKIM/DMARC). Tanpa `RESEND_API_KEY`, email hanya dicatat di log.
- **Cron**: `.github/workflows/cron.yml` memanggil `/api/cron` setiap hari (secret `CRON_SECRET` di GitHub).
- **CI/CD**: `.github/workflows/ci.yml` — check → test → build; push ke `main` menjalankan migrasi Neon + `wrangler deploy` (environment `production`, tambahkan reviewer untuk approval manual).

---

## Peta situs publik (es‑CL)

`/` Inicio · `/servicios` (+ detail) · `/proyectos` (filter kategori, paginasi + "Cargar más", detail dengan ficha técnica & lightbox) · `/nosotros` (historia, misión/visión, valores, **Equipo directivo**, trayectoria, maquinaria, certificaciones) · `/nosotros/equipo` · `/seguridad-y-calidad` (indikator HSE, sertifikasi, registros) · `/clientes` · `/cotizacion` (form 4 langkah + lampiran) · `/contacto` · `/trabaja-con-nosotros` (+ form postulación dengan CV) · `/proveedores` · `/noticias` · `/descargas` · `/preguntas-frecuentes` · `/canal-de-denuncias` (Ley Karin, opsi anonim, folio) · halaman legal · `sitemap.xml` · `robots.txt`.

SEO: meta + Open Graph per halaman, JSON‑LD (`GeneralContractor`, `Service`, `CreativeWork`, `JobPosting`, `FAQPage`, `Article`, `Person`), redirect 301 dari CMS.

## CMS (`/admin`)

| Modul | Isi |
|---|---|
| Panel | Ringkasan inbox, draft, sertifikat yang akan kedaluwarsa, checklist sebelum peluncuran, aktivitas |
| Bandeja | Cotizaciones (pipeline status, penanggung jawab, catatan, lampiran, ekspor CSV), Mensajes, Postulaciones (CV), Proveedores, Denuncias (khusus admin) |
| Sitio | Editor halaman Inicio (aktif/nonaktif & urutan section, semua teks/gambar/CTA), Biblioteca de medios (alt text, titik fokus, cek pemakaian) |
| Konten | Servicios, Proyectos (+galeri drag & drop), Categorías, Páginas, Noticias, FAQ, Descargas, Equipo, Valores, Historia, Estadísticas, Maquinaria, Oficinas, Clientes, Testimonios, Certificaciones, Indicadores de seguridad, Ofertas de empleo, Redirecciones |
| Administración | Configuración (data perusahaan, kontak, sosial, penerima notifikasi per form, SEO, logo, banner, analytics), Usuarios & roles, Auditoría |

Fitur lintas modul: status *Borrador/Publicado* + jadwal publikasi, riwayat revisi dengan *Restaurar*, audit log, slug otomatis, validasi panjang teks, wajib alt text sebelum publikasi, peringatan perubahan belum disimpan, hapus data pribadi (Ley 21.719).
Konvensi judul: kata di antara `*asterisks*` ditampilkan dengan warna sorotan.

## Struktur kode

```
src/
├─ hooks.server.ts            db per request, sesi CMS, redirect 301, header keamanan
├─ lib/
│  ├─ styles/                 tokens.css · base.css · components.css · admin.css  (DESIGN-SYSTEM §11)
│  ├─ components/             ui/ cards/ sections/ navigation/ media/ form/ admin/
│  ├─ cms/                    tipe field CMS + upload sisi browser (resize/WebP/strip EXIF)
│  ├─ server/
│  │  ├─ db/                  schema.ts (Drizzle) · client.ts (Neon HTTP)
│  │  ├─ cms/                 resources.ts (definisi konten) · engine.ts (CRUD generik)
│  │  ├─ auth.ts              sesi, PBKDF2, lockout, RBAC
│  │  ├─ storage.ts           S3 (Neon Object Storage) via aws4fetch
│  │  ├─ content.ts           query publik · forms.ts anti-spam/upload · email.ts/notify.ts
│  └─ utils/                  rut.ts · phone.ts · format.ts · slug.ts · image.ts · chile.ts
├─ routes/(site)/             situs publik
├─ routes/admin/              CMS
scripts/                      migrate · seed · create-user · process-team-photos · screenshot
drizzle/                      migrasi SQL
```

Menambah jenis konten baru biasanya cukup: tabel di `schema.ts` → `npm run db:generate` → satu entri di `src/lib/server/cms/resources.ts`.

---

## Catatan implementasi vs. execution plan

| Plan | Implementasi | Alasan |
|---|---|---|
| D1: storage Neon perlu diverifikasi | **Neon Object Storage** (S3‑compatible, beta) dipakai via `aws4fetch` | Sudah diverifikasi di dokumentasi Neon; adapter tetap generik |
| Better Auth + 2FA TOTP | Auth custom (sesi HttpOnly di Postgres, PBKDF2 100k, lockout 5×/15 menit, idle 12 jam / maks 7 hari, RBAC server‑side) | Lebih ringan & terkontrol di Workers. **2FA TOTP belum ada** — direkomendasikan sebelum go‑live (atau lindungi `/admin` dengan Cloudflare Access, D4) |
| Tiptap (JSON) | Markdown dengan toolbar + pratinjau; HTML mentah di‑escape, URL berbahaya diblok | Bundle kecil, aman, mudah dipakai editor non‑teknis |
| Presigned PUT langsung ke storage | Upload lewat Worker (gambar sudah di‑resize/WebP di browser) | Tidak perlu konfigurasi CORS bucket; batas body Worker (100 MB) cukup |
| KV snapshot cache | Header `Cache-Control` + cache redirect per isolate | KV dapat ditambahkan nanti bila trafik menuntut |
| Cron Trigger Workers | `/api/cron` + GitHub Actions harian; publikasi terjadwal dihitung saat query (`published_at <= now()`) | adapter‑cloudflare tidak menyediakan handler `scheduled` |
| `project_media` (tabel) | Kolom `gallery` (jsonb: mediaId + caption, berurutan) | Sederhana untuk urutan & caption |
| Soft delete | Hapus permanen + snapshot di tabel `revisions` | — |

## Foto Equipo directivo

Foto diproses ulang dari `assets/stakeholders/edited/*-cutout.png` (`npm run photos:team`): matte alpha dibersihkan (tonjolan dekat rahang Simón, tepi bahu Consuelo yang bergerigi), rona sian dari dinding asli dinetralkan, lalu dikomposit ke latar studio Hormigón seragam dengan bayangan lembut, 1200×1500 (4:5). Versi sebelumnya disimpan di `assets/stakeholders/edited/_v1/`. Tidak ada retouching wajah. Untuk hasil terbaik tetap disarankan sesi foto profesional (plan §17).

## Logo

`static/favicon.svg` / `logo-emblem.svg` adalah **gambar ulang vektor** dari `assets/logo.jpg` (roda gigi + busur konsentris) beserta favicon PNG. Wordmark di header dirender sebagai teks. Disarankan meminta file vektor resmi ke klien; logo dapat diganti dari CMS (Configuración → Marca).

## Sebelum go‑live (lihat juga checklist di Panel CMS)

- [ ] Isi data perusahaan (RUT, dirección, teléfono, WhatsApp, redes) dan email penerima per form
- [ ] Lengkapi & publikasikan proyek dengan ficha técnica (3 proyek contoh masih *Borrador*)
- [ ] Isi estadísticas (disembunyikan selama kosong), certificaciones, indikator keselamatan, clientes/testimonios dengan izin tertulis
- [ ] Konfirmasi jabatan & bio Equipo directivo (D7); bio saat ini adalah draf
- [ ] Teks legal ditinjau pengacara Chile (privasi, cookies, términos, canal de denuncias)
- [ ] Turnstile, Resend (SPF/DKIM/DMARC), Image Transformations, 2FA / Cloudflare Access untuk `/admin`
- [ ] Redirect 301 dari URL WordPress lama (CMS → Redirecciones)
