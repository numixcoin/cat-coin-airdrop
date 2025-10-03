# CAT COIN Smart Contracts

Smart contracts untuk CAT COIN Airdrop dan Presale di Solana blockchain.

## Kontrak yang Tersedia

### 1. CAT Token Contract (`cat_token.rs`)
- Token SPL standar untuk CAT COIN
- Total supply maksimum: 1,000,000,000,000,000 (1 quadrillion)
- Fungsi mint, transfer, dan burn

### 2. Airdrop Contract (`airdrop.rs`)
- Sistem klaim airdrop untuk pengguna
- Batasan waktu dan jumlah klaim
- Anti-double claim protection
- Fungsi withdraw untuk authority

### 3. Presale Contract (`presale.rs`)
- Sistem presale dengan rate: 1 SOL = 2,500,000 CAT COIN
- Batasan pembelian per pengguna
- Periode presale yang dapat dikonfigurasi
- Fungsi withdraw SOL dan token untuk authority

## Cara Deploy

1. Install Anchor CLI:
```bash
npm install -g @coral-xyz/anchor-cli
```

2. Build contracts:
```bash
anchor build
```

3. Deploy ke localnet:
```bash
anchor deploy
```

4. Deploy ke devnet:
```bash
anchor deploy --provider.cluster devnet
```

## Testing

```bash
anchor test
```

## Konfigurasi

Edit `Anchor.toml` untuk mengubah:
- Program ID
- Cluster target (localnet/devnet/mainnet)
- Wallet path

## Integrasi Frontend

Gunakan `@coral-xyz/anchor` dan `@solana/web3.js` untuk mengintegrasikan dengan aplikasi React.