import { useState } from 'react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getProvider, PROGRAM_IDS, CAT_TOKEN_MINT, connection } from '../utils/solana';

interface AirdropState {
  claiming: boolean;
  claimed: boolean;
  claimAmount: number;
  error: string | null;
}

export const useAirdrop = (wallet: any) => {
  const [airdropState, setAirdropState] = useState<AirdropState>({
    claiming: false,
    claimed: false,
    claimAmount: 0,
    error: null,
  });

  const checkClaimStatus = async (userPublicKey: PublicKey) => {
    try {
      // Implementasi untuk check apakah user sudah claim atau belum
      // Ini akan menggunakan PDA (Program Derived Address) untuk menyimpan status claim
      
      const [claimPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('claim'),
          userPublicKey.toBuffer(),
        ],
        PROGRAM_IDS.AIRDROP
      );

      const accountInfo = await connection.getAccountInfo(claimPda);
      return accountInfo !== null; // true jika sudah claim
    } catch (error) {
      console.error('Error checking claim status:', error);
      return false;
    }
  };

  const claimAirdrop = async () => {
    if (!wallet || !wallet.publicKey) {
      setAirdropState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    try {
      setAirdropState(prev => ({ ...prev, claiming: true, error: null }));

      const userPublicKey = wallet.publicKey;

      // Check if user has already claimed
      const [claimPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('claim'),
          userPublicKey.toBuffer()
        ],
        PROGRAM_IDS.AIRDROP
      );

      const claimAccount = await connection.getAccountInfo(claimPda);
      if (claimAccount) {
        throw new Error('You have already claimed the airdrop');
      }

      // Get user's associated token account
      const userTokenAccount = await getAssociatedTokenAddress(
        CAT_TOKEN_MINT,
        userPublicKey
      );

      // Check if token account exists, create if not
      const tokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
      const instructions = [];
      
      if (!tokenAccountInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            userPublicKey,
            userTokenAccount,
            userPublicKey,
            CAT_TOKEN_MINT
          )
        );
      }

      // Get airdrop PDA
      const [airdropPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('airdrop')],
        PROGRAM_IDS.AIRDROP
      );

      // Simulate claim instruction (will be updated with actual program)
      console.log('Claiming airdrop for:', userPublicKey.toString());
      console.log('Token account:', userTokenAccount.toString());
      console.log('Claim PDA:', claimPda.toString());
      console.log('Airdrop PDA:', airdropPda.toString());

      // For now, simulate successful claim
      setAirdropState(prev => ({
        ...prev,
        claiming: false,
        claimed: true,
        claimAmount: 1000000,
        error: null
      }));

      console.log(`Airdrop successful: ${airdropState.claimAmount.toLocaleString()} CAT COIN claimed`);

    } catch (error: any) {
      console.error('Error claiming airdrop:', error);
      setAirdropState(prev => ({
        ...prev,
        claiming: false,
        error: error.message || 'An error occurred while claiming airdrop',
      }));
    }
  };

  const resetAirdropState = () => {
    setAirdropState({
      claiming: false,
      claimed: false,
      claimAmount: 0,
      error: null,
    });
  };

  return {
    ...airdropState,
    claimAirdrop,
    checkClaimStatus,
    resetAirdropState,
  };
};