import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Program IDs (placeholder - akan diupdate setelah deploy)
export const PROGRAM_IDS = {
  CAT_TOKEN: new PublicKey('11111111111111111111111111111112'),
  AIRDROP: new PublicKey('11111111111111111111111111111112'),
  PRESALE: new PublicKey('11111111111111111111111111111112'),
};

// Network configuration
export const NETWORK = 'devnet'; // bisa diubah ke 'mainnet-beta' untuk production
export const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

// CAT Token mint address (akan diupdate setelah deploy token)
export const CAT_TOKEN_MINT = new PublicKey('11111111111111111111111111111112');

// Presale rate: 1 SOL = 2,500,000 CAT COIN
export const PRESALE_RATE = 2_500_000;

// Utility functions
export const getProvider = (wallet: any) => {
  if (!wallet) return null;
  
  // Return a simple provider object for now
  return {
    connection,
    wallet,
    publicKey: wallet.publicKey
  };
};

export const getProgram = (provider: any, programId: PublicKey, idl: any) => {
  // Placeholder for program initialization
  return null;
};

// Helper untuk format token amount
export const formatTokenAmount = (amount: number, decimals: number = 9): number => {
  return amount * Math.pow(10, decimals);
};

export const parseTokenAmount = (amount: number, decimals: number = 9): number => {
  return amount / Math.pow(10, decimals);
};

// Helper untuk format SOL amount
export const formatSOL = (lamports: number): number => {
  return lamports / 1e9;
};

export const parseSOL = (sol: number): number => {
  return sol * 1e9;
};