# 📚 Akademik Blockchain

Sistem Informasi Akademik berbasis Blockchain menggunakan smart contract Ethereum dan frontend JavaScript.
Dirancang untuk menghindari duplikasi nilai dan manipulasi data oleh pihak administratif melalui pencatatan yang transparan dan terdesentralisasi.

---

## 🎯 Tujuan Proyek

Menyediakan prototipe SIAKAD modern yang:
- Menjamin keaslian dan keutuhan nilai mahasiswa
- Menghindari kelalaian administratif seperti duplikasi nilai atau mata kuliah
- Mengintegrasikan teknologi blockchain dengan pendekatan data mining untuk pengambilan keputusan akademik

---

## ⚙️ Teknologi

- Smart Contract: Solidity (Truffle)
- Frontend: HTML, JavaScript, Web3.js
- Blockchain: Ethereum (Ganache lokal / Testnet)

---

## 📦 Struktur Direktori

```
.
├── contracts/               # Smart contract Solidity
│   └── Akademik.sol
├── migrations/              # Skrip migrasi Truffle
│   └── 2_deploy_contracts.js
├── build/contracts/         # Output ABI dari compile
│   └── Akademik.json
├── frontend/                # Frontend berbasis Web3
│   ├── abi.json             # ABI dari smart contract
│   ├── config.json          # Alamat contract
│   ├── index.html           # UI pengguna
│   └── app.js               # Logika koneksi dan interaksi
├── tests/                  # Uji coba smart contract
│   └── .gitkeep
├── truffle-config.js        # Konfigurasi Truffle
└── .gitignore
```

---

## 🚀 Cara Menjalankan

### 1. Clone Repo
```bash
git clone https://github.com/ardie069/akademik-blockchain.git
cd akademik-blockchain
```

### 2. Jalankan Ganache
Pastikan Ganache berjalan di `localhost:8545`

### 3. Compile dan Migrate Smart Contract
```bash
truffle compile
truffle migrate
```

### 4. Salin Alamat Kontrak
Dari hasil migrate, salin alamat dan simpan di `frontend/config.json`:
```json
{
  "contractAddress": "0x1234567890abcdef..."
}
```

### 5. Jalankan Frontend
```bash
cd frontend
npx http-server
```
Buka browser ke `http://127.0.0.1:8080` dan pastikan MetaMask sudah aktif.

---

## 🧪 Fitur

- ✅ Tambah Nilai
- 🔍 Lihat Nilai Mahasiswa
- ✏️ Update Nilai Berdasarkan Mata Kuliah
- ❌ Hapus Nilai
- 🎯 Filter Nilai dengan Ambang Minimum

---

## 📊 Rencana Pengembangan

- 🔒 Otentikasi akun mahasiswa & dosen
- ⛓️ Integrasi ke IPFS untuk lampiran
- 📈 Kombinasi data mining: pencarian mahasiswa bermasalah, performa akademik, dsb

---

## 📖 Lisensi

MIT License

---

> Tugas Akhir oleh Ardiansyah
> Program Studi Teknik Elektro Konsentrasi Informatika, Sekolah Tinggi Teknik Malang
> Tahun: 2025

