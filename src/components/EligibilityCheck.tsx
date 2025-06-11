
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

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
  const [eligibilityStatus, setEligibilityStatus] = useState<string | null>(null);

  const checkEligibility = async () => {
    setIsChecking(true);
    try {
      // Simulate eligibility check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if already claimed (simple localStorage check)
      const claimedWallets = JSON.parse(localStorage.getItem('claimedWallets') || '[]');
      if (claimedWallets.includes(wallet)) {
        setEligibilityStatus('Already claimed');
        onEligibilityResult(false);
        toast.error('This wallet has already claimed the airdrop');
        return;
      }

      // For demo purposes, all connected wallets are eligible
      setEligibilityStatus('Eligible');
      onEligibilityResult(true);
      onEligibilityCheck(true);
      toast.success('You are eligible for the airdrop!');
    } catch (error: any) {
      setEligibilityStatus('Error checking eligibility');
      onEligibilityResult(false);
      toast.error(`Eligibility check failed: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-lg">Eligibility Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {eligibilityStatus && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            eligibilityStatus === 'Eligible' 
              ? 'bg-green-900/50 text-green-400 border border-green-600' 
              : eligibilityStatus === 'Already claimed'
              ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600'
              : 'bg-red-900/50 text-red-400 border border-red-600'
          }`}>
            {eligibilityStatus === 'Eligible' && '✅ '}
            {eligibilityStatus === 'Already claimed' && '⚠️ '}
            {eligibilityStatus === 'Error checking eligibility' && '❌ '}
            {eligibilityStatus}
          </div>
        )}
        
        <Button 
          onClick={checkEligibility}
          disabled={isChecking}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
        >
          {isChecking ? 'Checking Eligibility...' : 'Check Eligibility'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EligibilityCheck;
