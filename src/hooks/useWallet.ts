import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  wallet: any;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    publicKey: null,
    connecting: false,
    wallet: null,
  });

  const connectWallet = async () => {
    try {
      setWalletState(prev => ({ ...prev, connecting: true }));

      // Check if Phantom wallet is installed
      const { solana } = window as any;

      if (!solana || !solana.isPhantom) {
        alert('Phantom wallet not found! Please install Phantom wallet first.');
        return;
      }

      // Connect to wallet
      const response = await solana.connect();
      const publicKey = response.publicKey;

      setWalletState({
        connected: true,
        publicKey,
        connecting: false,
        wallet: solana,
      });

      console.log('Wallet connected:', publicKey.toString());
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletState(prev => ({ ...prev, connecting: false }));
    }
  };

  const disconnectWallet = async () => {
    try {
      const { solana } = window as any;
      if (solana) {
        await solana.disconnect();
      }

      setWalletState({
        connected: false,
        publicKey: null,
        connecting: false,
        wallet: null,
      });

      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const { solana } = window as any;
        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          if (response.publicKey) {
            setWalletState({
              connected: true,
              publicKey: response.publicKey,
              connecting: false,
              wallet: solana,
            });
          }
        }
      } catch (error) {
        // Wallet not connected or user rejected
        console.log('Wallet not auto-connected');
      }
    };

    checkWalletConnection();
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
  };
};