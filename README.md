# CAT COIN Airdrop

CAT COIN Airdrop adalah aplikasi distribusi cryptocurrency dengan tema matrix style yang memungkinkan pengguna untuk mengklaim token CAT COIN gratis.

## Fitur Utama

- **Wallet Integration**: Koneksi dengan Phantom Wallet
- **Airdrop Claims**: Sistem klaim token berbasis smart contract
- **Token Presale**: Penjualan token dengan rate 1 SOL = 2,500,000 CAT
- **Matrix UI**: Interface dengan tema matrix yang menarik
- **Social Tasks**: Tugas sosial media untuk eligibilitas airdrop

## Teknologi

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: Solana Network
- **Smart Contracts**: Rust + Anchor Framework
- **Styling**: Tailwind CSS
- **Wallet**: Phantom Wallet Integration

## Instalasi

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```

## Smart Contracts

Aplikasi ini menggunakan smart contracts yang dibangun dengan Rust dan Anchor framework:

- **CAT Token Contract**: SPL Token untuk CAT COIN
- **Airdrop Contract**: Mengelola distribusi token gratis
- **Presale Contract**: Mengelola penjualan token

## Deployment

Untuk deployment ke production:

1. Build aplikasi:
   ```bash
   npm run build
   ```
2. Deploy smart contracts ke Solana mainnet
3. Update program IDs di konfigurasi
4. Deploy frontend ke hosting pilihan

## Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau buka issue untuk saran dan perbaikan.

## Lisensi

MIT License
