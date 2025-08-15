# Ngertiin Labs — Guidebook Singkat (Guru & Murid)

> **Ringkasan**
> Ngertiin Labs membantu **Guru** membuat/ mengelola **Lab (kumpulan soal)** dan memantau progres **Murid**. Murid bergabung dengan **access code**, mengerjakan secara bertahap (**autosave**), lalu **submit** untuk melihat hasil.

---

## Daftar Isi

1. [Peran & Akses](#peran--akses)
2. [Membuat Lab dari PDF/URL (Generative)](#membuat-lab-dari-pdfurl-generative)
3. [Tab Questions — Kelola Soal](#tab-questions--kelola-soal)
4. [Tab Monitoring — Pantau Progres](#tab-monitoring--pantau-progres)
5. [Tab Overview — Ringkasan Lab](#tab-overview--ringkasan-lab)
6. [Murid: Join via Access Code](#murid-join-via-access-code)
7. [Murid: Mengerjakan Sesi Lab](#murid-mengerjakan-sesi-lab)
8. [Aturan Penting](#aturan-penting)
9. [FAQ Singkat](#faq-singkat)
10. [Glosarium](#glosarium)

---

## Peran & Akses

* **Guru (owner lab)**: membuat lab (termasuk **generate dari PDF/URL**), mengedit soal & opsi, mengatur urutan, memantau sesi murid.
* **Murid**: bergabung dengan **access code**, mengerjakan, submit, dan melihat hasil.
* **Batasan**:

  * **Max Attempts** per lab membatasi jumlah percobaan murid.
  * **End Time** membatasi **memulai** sesi baru (resume sesi lama tetap diperbolehkan bila sesi dibuat sebelum end time).

---

## Membuat Lab dari PDF/URL (Generative)

Gunakan konten Anda untuk membuat draft soal cepat, lalu sempurnakan di tab **Questions**.

**Langkah:**

1. Buka halaman pembuatan Lab → isi detail dasar (judul, akses, dsb.).
2. **Upload PDF** (materi/handout) dan/atau tambahkan **URL website** sebagai **konteks sumber**.
3. Tekan **Generate Questions**. Sistem akan memulai proses dan menampilkan **status, step, dan pesan** di area status (lihat Tab Questions).
4. Setelah **Completed**, buka **Tab Questions** untuk **meninjau & mengedit** hasil generasi:

   * Perbaiki redaksi soal, tambah penjelasan, cek kebenaran opsi, dan atur urutan.
   * Ulangi generate (opsional) bila diperlukan, atau lanjutkan kurasi manual.

> **Catatan:** Gunakan materi yang relevan dan terstruktur (PDF jelas, URL dapat diakses) agar hasil generasi lebih akurat.

**\[PLACEHOLDER SCREENSHOT — Form Generate dari PDF/URL]**
`![PLACEHOLDER: Generate Lab dari PDF & URL]()`

---

## Tab Questions — Kelola Soal

**Apa yang terlihat:**

* **Status Generasi** di bagian atas: `pending / completed / failed`, menampilkan **message** & **step** proses.
* **Daftar Soal** (urut berdasarkan **questionOrder**): dapat **drag & drop** untuk mengubah urutan (tersimpan otomatis).
* **Editor Soal**: ubah **Question Text** & **Explanation** (penjelasan).
* **Opsi Jawaban**: tambah/hapus/edit, **tandai benar/salah**, serta ubah urutan opsi.
* **Pencarian**: filter diakritik-insensitif (case/diacritic-insensitive) pada **teks soal**, **explanation**, dan **option text**; hasil di-highlight. Saat pencarian aktif, drag & drop dinonaktifkan.

> **Hanya owner** yang bisa mengedit; pengguna lain melihat versi read-only.

**\[PLACEHOLDER SCREENSHOT — Status & List Soal + DnD]**
`![PLACEHOLDER: Questions Tab (status + list + drag & drop)]()`

---

## Tab Monitoring — Pantau Progres

**Ringkasan:**

* **KPI**: Active, Completed, Completion Rate, Avg Score.
* **Tabel Sesi** (paginated): **User (nama + avatar)**, Attempt, Status, Progress (bar + X/Y, %), Correct/Total (%), Score, Started, Last Activity, Duration.
* **Filter, Pencarian & Sortir**: multi-status + cari nama/email; urutkan berdasarkan **Last activity / Started / Score (desc)**.
* **Detail Jawaban**: expand baris untuk melihat **jawaban per soal** (teks jawaban yang dipilih dan status benar/salah).
* **Format waktu**: Started/Last Activity ditampilkan relatif (mis. "5m ago") dengan tooltip waktu absolut; **Duration** ditampilkan sebagai durasi (mis. "1h 2m 3s").
* **Empty state**: jika filter tidak cocok, tampil pesan "No sessions match your filters." dengan tautan **Clear filters**.

**\[PLACEHOLDER SCREENSHOT — Monitoring Table + Row Expand]**
`![PLACEHOLDER: Monitoring (table + detail answers)]()`

---

## Tab Overview — Ringkasan Lab

* **Status Generasi** + **KPI** utama (participants, active now, completed, completion rate, avg score, avg accuracy).
* Visual cepat: **distribusi status**, **tren aktivitas** (7/30 hari), **histogram skor**; rentang waktu **7/30 hari** dapat diubah via tombol **7D / 30D** di header.
* **Hardest Questions**: daftar soal dengan akurasi terendah (tampilkan akurasi % dan jumlah attempts).
* **Time per Question**: rata-rata waktu per soal (10 teratas).
* **Recent Activity**: aktivitas terbaru berdasarkan `lastActivity`.
* Aksi cepat: ke **Questions**, **Monitoring**, **Settings**.
* **Empty state**: "No data in selected window." (Hardest Questions), "No recent activity." (Recent Activity).

**\[PLACEHOLDER SCREENSHOT — Overview (KPI + charts)]**
`![PLACEHOLDER: Overview Tab]()`

---

## Murid: Join via Access Code

Murid bergabung melalui **modal** “Join via Access Code”.

**Langkah:**

1. Buka modal **Join via Access Code** → masukkan **access code** (tanpa spasi/tanda) → tekan **Continue** (atau **Cancel** untuk menutup).
   - Saat validasi kode, akan muncul indikator loading: "Resolving code..."
   - Kode dinormalisasi ke huruf besar; spasi/dash/underscore dihapus (ditampilkan sebagai "Normalized: ...").
   - Tombol **Continue** aktif jika kode minimal **4** karakter.
2. Sistem menampilkan **Preview Lab**: judul, pengajar, **end time**, **attempts used/left**.
3. Jika masih ada sesi **in_progress** → tombol **Resume**.
   Jika memenuhi syarat memulai → **Start New**. Gunakan **Close** untuk menutup preview.
4. Kode tidak valid → pesan error: "Kode tidak valid atau sudah tidak aktif".

**\[PLACEHOLDER SCREENSHOT — Join Modal + Preview]**
`![PLACEHOLDER: Join via Access Code Modal with Loading Indicator]()`

---

## Murid: Mengerjakan Sesi Lab

**Halaman Sesi** memfasilitasi pengerjaan yang nyaman dan jelas.

**Yang bisa dilakukan:**

* **Autosave** jawaban saat memilih opsi (muncul **indikator kecil “Saved”** — *tanpa toast*).
* **Navigasi**: Previous/Next, dan **Review Panel** untuk lompat ke nomor soal mana pun.
* **Shortcut keyboard**: Arrow Left/Right untuk navigasi; angka **1–9** untuk memilih opsi; **Ctrl/Cmd + Enter** untuk Submit.
* **Progress** di header: terjawab vs total; posisi terakhir disimpan untuk **resume**.
* **Submit**:

  * Terdapat **konfirmasi**: menampilkan jumlah/daftar soal yang belum dijawab.
  * Pilih **Submit anyway** atau **Go to first unanswered**.
* **Hasil** (Result): skor (%) dan **benar/total**, serta **penjelasan (explanation)** per soal.

> Selama submit berlangsung, tombol navigasi & input dinonaktifkan untuk mencegah dobel submit.

**\[PLACEHOLDER SCREENSHOT — Session Page (question + options + indicator)]**
`![PLACEHOLDER: Session (question + saved indicator)]()`

**\[PLACEHOLDER SCREENSHOT — Submit Confirmation Dialog]**
`![PLACEHOLDER: Submit Dialog]()`

**\[PLACEHOLDER SCREENSHOT — Result Page (score + explanation)]**
`![PLACEHOLDER: Result Page]()`

---

## Aturan Penting

* **Max Attempts**: setiap lab menetapkan batas percobaan per murid. Jika habis, murid tidak bisa **memulai** attempt baru.
* **End Time**: membatasi **memulai** attempt baru. **Resume** diperbolehkan jika attempt dibuat **sebelum** end time.
* **Hak Akses**: edit soal & memantau sesi hanya untuk **owner (Guru)**.

---

## FAQ Singkat

**Q:** Saya melewati end time. Masih bisa lanjut?
**A:** **Resume** attempt yang dibuat sebelum end time **boleh**. Memulai attempt baru **tidak**.

**Q:** Tombol Start tidak aktif?
**A:** Periksa **attempts left** dan **end time**. Jika attempts habis atau end time lewat, Start dinonaktifkan.

**Q:** Bisa ubah urutan soal?
**A:** **Bisa**. Gunakan **drag & drop** di tab **Questions** (hanya owner).

---

## Glosarium

* **Lab**: kumpulan soal yang dikerjakan murid.
* **Attempt**: satu percobaan mengerjakan lab oleh seorang murid.
* **End Time**: batas akhir untuk **memulai** attempt baru.
* **Autosave**: jawaban tersimpan otomatis saat memilih opsi.
* **Access Code**: kode yang diberikan guru agar murid bisa bergabung ke lab.

---

> **Checklist Guru (Ringkas)**
>
> 1. Buat Lab → **Upload PDF / tambahkan URL** → **Generate Questions**.
> 2. Tinjau di **Questions**: edit, tandai jawaban benar, atur urutan, gunakan **search**.
> 3. Bagikan **access code** ke murid.
> 4. Pantau di **Monitoring**; lihat ringkasan di **Overview**.
> 5. Perbaiki konten berdasarkan **Hardest Questions** atau hasil murid.

> **Checklist Murid (Ringkas)**
>
> 1. **Join via Code** → Preview → **Start** / **Resume**.
> 2. Pilih jawaban (lihat indikator **Saved**).
> 3. Cek **Review Panel** sebelum submit.
> 4. **Submit** → lihat **hasil & pembahasan**.
