# Finance App

Aplikasi pencatatan keuangan pribadi dan warung berbasis Expo. Aplikasi memakai Expo SDK 57.

## Persiapan

- Node.js **22.13.0 atau lebih baru**.
- Git.
- Untuk menjalankan lewat Expo Go, pasang Expo Go yang mendukung SDK 57 di HP.
- Untuk OCR struk otomatis, ikuti bagian [OCR dan development build](#ocr-dan-development-build).

## Pertama kali mengambil project

```bash
git clone https://github.com/aidikonami841-debug/Harron.git
cd Harron
npm ci
npx expo start -c
```

Scan QR dari terminal dengan Expo Go. Kalau menjalankan dari folder project yang sudah ada, pastikan terminal berada di folder repository sebelum menjalankan perintah Git:

```powershell
cd "$env:USERPROFILE\Downloads\FinanceApp"
git rev-parse --show-toplevel
```

Perintah kedua harus menampilkan lokasi repository. Jika muncul `fatal: not a git repository`, pindah dulu ke folder project hasil `git clone`.

## Mengambil update terbaru

Tutup Metro/Expo yang sedang berjalan, buka terminal di folder project, lalu cek apakah ada perubahan lokal:

```bash
git status
```

Kalau tidak ada perubahan lokal, ambil update dan pasang dependency dari lockfile:

```bash
git pull --ff-only origin main
npm ci
npx expo start -c
```

Kalau `git status` menunjukkan perubahan yang belum disimpan, commit perubahan ke branch kerja sendiri sebelum pull. Alternatifnya, simpan sementara dengan `git stash push -u`, lakukan pull, lalu pulihkan dengan `git stash pop`. Jika Git melaporkan konflik, selesaikan konflik dulu; jangan pilih overwrite/reset karena itu bisa menghapus pekerjaan lokal.

Jangan jalankan `npm install` untuk sekadar mengambil update. `npm ci` memasang persis versi dependency di `package-lock.json` dan mengganti folder `node_modules` dengan versi yang sesuai.

## Menjalankan di Android/iOS

Untuk mencoba fitur umum lewat Expo Go, jalankan `npx expo start -c` lalu scan QR. Build native lokal bisa dijalankan dengan:

```bash
npm run android
npm run ios
```

Android memerlukan Android Studio dan Android SDK. iOS memerlukan macOS dan Xcode.

## OCR dan development build

Pemilihan/foto struk tersedia melalui Expo Image Picker. Pembacaan teks OCR memakai modul native ML Kit dan **tidak tersedia di Expo Go**. Di Expo Go, nominal dan tanggal bisa diisi manual setelah memilih foto.

Untuk menggunakan OCR otomatis di Android, siapkan Android Studio/SDK, lalu jalankan:

```bash
npm ci
npx expo run:android
```

Perubahan atau penambahan modul native memerlukan build ulang aplikasi. Membuka project dengan Expo Go saja tidak akan menambahkan modul OCR.

## Kolaborasi

Kerjakan perubahan pada branch masing-masing, lalu push branch itu dan ajukan pull request ke `main`. Sebelum mulai mengedit, tarik update terbaru dengan langkah di atas agar tidak menimpa pekerjaan teman.
