
import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import TokenInfo from '@/components/TokenInfo';
import EligibilityCheck from '@/components/EligibilityCheck';
import ClaimSection from '@/components/ClaimSection';

const AirdropContainer = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [isEligible, setIsEligible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    if (publicKey) {
      checkIfAlreadyClaimed();
    }
  }, [publicKey]);

  const checkIfAlreadyClaimed = () => {
    if (!publicKey) return;
    
    // In production, this would check against Supabase database
    const claimed = JSON.parse(localStorage.getItem('claimedAddresses') || '[]');
    setHasClaimed(claimed.includes(publicKey.toString()));
  };

  const checkEligibility = async () => {
    if (!publicKey || !connection) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsChecking(true);
    try {
      // Check account info
      const accountInfo = await connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        throw new Error('Account not found on Solana network');
      }

      // Check transaction history
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 100 });
      
      if (signatures.length === 0) {
        throw new Error('No transaction history found. Account must be active.');
      }

      // Check if already claimed
      if (hasClaimed) {
        throw new Error('This wallet has already claimed the airdrop');
      }

      setIsEligible(true);
      toast.success('You are eligible to claim the airdrop!');
      
    } catch (error) {
      console.error('Eligibility check error:', error);
      toast.error(`Eligibility check failed: ${error.message}`);
      setIsEligible(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700 text-white">
        <CardHeader className="text-center pb-6">
          <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent pixel-font">
            CHIMPZY
          </div>
          <CardTitle className="text-xl text-gray-300">
            Airdrop Event - Claim Your Tokens!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <TokenInfo />
          
          <div className="text-center">
            <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-600 hover:!from-cyan-600 hover:!to-purple-700" />
          </div>

          {connected && publicKey && (
            <>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Connected Wallet:</div>
                <div className="font-mono text-sm break-all bg-gray-700 p-2 rounded">
                  {publicKey.toString()}
                </div>
              </div>

              <EligibilityCheck 
                onCheck={checkEligibility}
                isChecking={isChecking}
                isEligible={isEligible}
                hasClaimed={hasClaimed}
              />

              {isEligible && !hasClaimed && (
                <ClaimSection 
                  publicKey={publicKey}
                  onClaimed={() => setHasClaimed(true)}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AirdropContainer;
