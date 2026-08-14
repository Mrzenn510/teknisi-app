# Cara Mengubah "Teknisi App" Jadi APK Asli

Project di folder ini sudah disiapkan sebagai project **Capacitor** (pembungkus resmi
yang mengubah aplikasi web/PWA menjadi aplikasi Android native, dipakai banyak
aplikasi produksi). Karena proses compile APK butuh Android SDK + Gradle + koneksi
internet ke server Google/Maven (yang tidak tersedia di lingkungan saya), langkah
compile terakhir harus dijalankan di komputer kamu sendiri. Berikut caranya:

## Yang perlu disiapkan (sekali saja)
1. **Node.js** (v18+) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio
   (saat instalasi, biarkan Android SDK & Android SDK Platform-Tools ikut terpasang)

## Langkah build

Buka terminal di folder project ini, lalu jalankan satu-satu:

```bash
# 1. Install semua dependency Capacitor
npm install

# 2. Tambahkan platform Android ke project
npx cap add android

# 3. Sinkronkan file web (index.html, manifest, dll) ke project Android
npx cap sync android

# 4. Buka project di Android Studio
npx cap open android
```

Setelah Android Studio terbuka:
1. Tunggu proses "Gradle Sync" selesai (beberapa menit di percobaan pertama).
2. Klik menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. APK jadi akan muncul di:
   `android/app/build/outputs/apk/debug/app-debug.apk`
4. Salin file itu ke HP kamu (lewat kabel USB, Google Drive, dll), lalu install
   seperti biasa (aktifkan dulu "Izinkan install dari sumber tidak dikenal" di HP).

## Kalau mau APK untuk dibagikan/upload ke Play Store (versi "release")
1. Di Android Studio: **Build → Generate Signed Bundle / APK**.
2. Pilih **APK**, buat *keystore* baru (simpan file & passwordnya baik-baik, ini
   dipakai setiap kali update aplikasi nanti).
3. Pilih *build variant* **release**, lalu Finish.
4. APK release ada di `android/app/release/app-release.apk` — ini APK final yang
   bisa langsung dibagikan.

## Fitur native yang perlu izin (sudah diatur otomatis oleh Capacitor)
Aplikasi ini memakai:
- **Kamera** (untuk scan QR code)
- **Lokasi/GPS**

Capacitor otomatis menambahkan izin `CAMERA` dan `ACCESS_FINE_LOCATION` di
`AndroidManifest.xml`. Saat pertama kali dipakai di HP, Android akan menampilkan
popup minta izin — user tinggal tekan "Izinkan".

## Alternatif lebih mudah (tanpa install apa pun) — PWABuilder
Kalau website kamu (index.html + manifest.json + sw.js) sudah online (misalnya
di-hosting di Netlify/Vercel/GitHub Pages/hosting sendiri), kamu bisa dapat APK
asli tanpa install apa pun:

1. Buka **https://www.pwabuilder.com**
2. Masukkan URL website kamu, klik "Start"
3. Klik tab **Android**, klik **Generate Package**
4. Download file APK/AAB yang dihasilkan — langsung bisa diinstall di HP.

Cara ini paling cepat kalau kamu tidak butuh akses native tambahan di luar yang
sudah didukung PWA (kamera & GPS via browser tetap jalan).
