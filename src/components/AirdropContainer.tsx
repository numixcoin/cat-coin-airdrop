
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TokenInfo from './TokenInfo';
import EligibilityCheck from './EligibilityCheck';
import ClaimSection from './ClaimSection';
import { toast } from '@/components/ui/sonner';

declare global {
  interface Window {
    solana?: any;
    phantom?: any;
    solflare?: any;
  }
}

const AirdropContainer = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  useEffect(() => {
    // Try to auto-connect if previously connected
    checkForWallet();
  }, []);

  const checkForWallet = async () => {
    try {
      if (window.solana?.isPhantom && window.solana.isConnected) {
        setProvider(window.solana);
        setWallet(window.solana.publicKey?.toString());
        toast.success('Auto-connected to Phantom wallet');
      }
    } catch (error) {
      console.log('No auto-connect available');
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!window.solana) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
      }

      const response = await window.solana.connect();
      setProvider(window.solana);
      setWallet(response.publicKey.toString());
      toast.success('Wallet connected successfully!');
      
      // Set up disconnect listener
      window.solana.on('disconnect', () => {
        setWallet(null);
        setProvider(null);
        setIsEligible(false);
        setEligibilityChecked(false);
        toast.info('Wallet disconnected');
      });
    } catch (error: any) {
      toast.error(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent pixel-font">
          CHIMPZY
        </h1>
        <p className="text-xl text-gray-300">Airdrop Event - Claim Your Tokens!</p>
      </div>

      <TokenInfo />

      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-lg">Wallet Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!wallet ? (
            <Button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Connected Wallet:</div>
              <div className="font-mono text-xs bg-gray-700 p-2 rounded break-all text-white">
                {wallet}
              </div>
              <div className="text-green-400 text-sm">✅ Wallet Connected</div>
            </div>
          )}
        </CardContent>
      </Card>

      {wallet && (
        <EligibilityCheck 
          wallet={wallet}
          onEligibilityCheck={setEligibilityChecked}
          onEligibilityResult={setIsEligible}
        />
      )}

      {wallet && eligibilityChecked && isEligible && (
        <ClaimSection wallet={wallet} provider={provider} />
      )}
    </div>
  );
};

export default AirdropContainer;
