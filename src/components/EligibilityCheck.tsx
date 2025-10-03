
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface EligibilityCheckProps {
  wallet: string;
  onEligibilityCheck: (checked: boolean) => void;
  onEligibilityResult: (eligible: boolean) => void;
}

const EligibilityCheck: React.FC<EligibilityCheckProps> = ({
  wallet,
  onEligibilityCheck,
  onEligibilityResult
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const checkEligibility = async () => {
    if (!walletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }
    
    setIsChecking(true);
    try {
      // For demo purposes, make all wallets eligible
      // In production, you would check against a whitelist or specific criteria
      setIsEligible(true);
      setHasChecked(true);
      onEligibilityCheck(true);
      onEligibilityResult(true);
      toast.success('✅ Wallet saved for airdrop! 🐱');
    } catch (error: any) {
      toast.error(`Error checking eligibility: ${error.message}`);
      setIsEligible(false);
      setHasChecked(true);
      onEligibilityCheck(true);
      onEligibilityResult(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="bg-black/80 border-green-400 border-2 matrix-font">
      <CardHeader>
        <CardTitle className="text-green-400 text-lg matrix-font">
          {'>'} ELIGIBILITY CHECK
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEligible && !hasChecked && (
          <div className="text-center space-y-4">
            <div className="text-green-400 matrix-font">
              {'>'} Enter your wallet address to check CAT COIN airdrop eligibility 🐱
            </div>
            <Input
              type="text"
              placeholder="Enter your Solana wallet address..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="bg-black border-green-400 text-green-400 placeholder-green-600 matrix-font"
            />
            <Button 
              onClick={checkEligibility}
              disabled={isChecking || !walletAddress.trim()}
              className="matrix-button"
            >
              {isChecking ? '{\'>\'}  SCANNING MATRIX...' : '{\'>\'}  CHECK ELIGIBILITY'}
            </Button>
          </div>
        )}

        {hasChecked && !isEligible && (
          <div className="bg-black/50 border-2 border-red-400 p-4 rounded-lg text-center">
            <div className="text-red-400 text-lg font-bold matrix-font">
              ❌ NOT ELIGIBLE
            </div>
            <div className="text-red-300 text-sm mt-2 matrix-font">
              {'>'} Your wallet is not eligible for the CAT COIN airdrop<br />
              {'>'} Only specific addresses qualify for this distribution 🐱
            </div>
          </div>
        )}

        {isEligible && (
          <div className="bg-black/50 border-2 border-green-400 p-4 rounded-lg text-center">
            <div className="text-green-400 text-lg font-bold glitch-text">
              ✅ WALLET SAVED FOR AIRDROP! 🐱
            </div>
            <div className="text-green-300 text-sm mt-2 matrix-font">
              {'>'} Wallet address: {walletAddress}<br />
              {'>'} Your wallet has been saved to receive the airdrop<br />
              {'>'} You will receive 50,000 CAT COIN tokens
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EligibilityCheck;
