import { useState } from 'react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getProvider, PROGRAM_IDS, CAT_TOKEN_MINT, connection, PRESALE_RATE } from '../utils/solana';

interface PresaleState {
  purchasing: boolean;
  purchased: boolean;
  purchaseAmount: number;
  tokenAmount: number;
  error: string | null;
  totalPurchased: number;
}

export const usePresale = (wallet: any) => {
  const [presaleState, setPresaleState] = useState<PresaleState>({
    purchasing: false,
    purchased: false,
    purchaseAmount: 0,
    tokenAmount: 0,
    error: null,
    totalPurchased: 0,
  });

  const calculateTokenAmount = (solAmount: number): number => {
    return solAmount * PRESALE_RATE;
  };

  const getUserPurchaseAmount = async (userPublicKey: PublicKey): Promise<number> => {
    try {
      // Get user purchase PDA
      const [purchasePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('purchase'),
          userPublicKey.toBuffer(),
        ],
        PROGRAM_IDS.PRESALE
      );

      const accountInfo = await connection.getAccountInfo(purchasePda);
      if (accountInfo) {
        // Parse account data to get purchase amount
        // Untuk sementara return 0, akan diupdate dengan parser yang sebenarnya
        return 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting user purchase amount:', error);
      return 0;
    }
  };

  const buyTokens = async (solAmount: number) => {
    if (!wallet || !wallet.publicKey) {
      setPresaleState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    if (solAmount <= 0) {
      setPresaleState(prev => ({ ...prev, error: 'SOL amount must be greater than 0' }));
      return;
    }

    try {
      setPresaleState(prev => ({ ...prev, purchasing: true, error: null }));

      const provider = getProvider(wallet);
      if (!provider) {
        throw new Error('Provider not available');
      }

      const userPublicKey = wallet.publicKey;
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      // Check user's SOL balance
      const balance = await connection.getBalance(userPublicKey);
      if (balance < lamports) {
        throw new Error('Insufficient SOL balance');
      }

      // Calculate token amount
      const tokenAmount = calculateTokenAmount(solAmount);

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

      // Create purchase PDA
      const [purchasePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('purchase'),
          userPublicKey.toBuffer(),
        ],
        PROGRAM_IDS.PRESALE
      );

      // Get presale PDA
      const [presalePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('presale')],
        PROGRAM_IDS.PRESALE
      );

      // Simulate purchase instruction (will be updated with actual program)
      console.log('Buying tokens for:', userPublicKey.toString());
      console.log('SOL Amount:', solAmount);
      console.log('Token Amount:', tokenAmount);
      console.log('Token account:', userTokenAccount.toString());
      console.log('Purchase PDA:', purchasePda.toString());
      console.log('Presale PDA:', presalePda.toString());

      // For now, simulate successful purchase
      setPresaleState(prev => ({
        ...prev,
        purchasing: false,
        purchased: true,
        purchaseAmount: solAmount,
        tokenAmount,
        totalPurchased: prev.totalPurchased + solAmount,
        error: null
      }));

      console.log(`Presale successful: ${solAmount} SOL = ${tokenAmount.toLocaleString()} CAT COIN`);
      
    } catch (error: any) {
      console.error('Error buying tokens:', error);
      setPresaleState(prev => ({
        ...prev,
        purchasing: false,
        error: error.message || 'An error occurred while purchasing tokens',
      }));
    }
  };

  const resetPresaleState = () => {
    setPresaleState({
      purchasing: false,
      purchased: false,
      purchaseAmount: 0,
      tokenAmount: 0,
      error: null,
      totalPurchased: 0,
    });
  };

  return {
    ...presaleState,
    buyTokens,
    calculateTokenAmount,
    getUserPurchaseAmount,
    resetPresaleState,
    PRESALE_RATE,
  };
};