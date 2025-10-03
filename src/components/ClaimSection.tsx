import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface ClaimSectionProps {
  wallet: string;
  provider: any;
  airdrop: any;
}

const ClaimSection: React.FC<ClaimSectionProps> = ({ wallet, provider, airdrop }) => {


  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<any>(null);

  const CLAIM_AMOUNT = '100,000';

  // Check if wallet has already claimed
  useEffect(() => {
    checkExistingClaim();
  }, [wallet]);

  const checkExistingClaim = async () => {
    try {
      const { data, error } = await supabase
        .from('airdrop_claims')
        .select('*')
        .eq('wallet_address', wallet)
        .single();

      if (data) {
        setClaimData(data);
        setClaimStatus(data.status);
      }
    } catch (error) {
      // No existing claim found
    }
  };
  const handleClaimAirdrop = async () => {
    try {
      await airdrop.claimAirdrop();
      
      if (airdrop.claimed) {
        // Update database record
        const { error } = await supabase
          .from('airdrop_claims')
          .upsert({
            wallet_address: wallet,
            status: 'completed',
            claim_amount: airdrop.claimAmount,
            completed_at: new Date().toISOString(),
            fee_paid: 0, // No fee for direct claim
            fee_transaction_hash: 'direct_claim' // Placeholder for direct claims
          });

        if (error) {
          console.error('Error updating claim record:', error);
        }

        setClaimStatus('completed');
        toast.success(`Successfully claimed ${airdrop.claimAmount.toLocaleString()} CAT COIN!`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim airdrop');
    }
  };

  const getStatusDisplay = () => {
    if (airdrop.error) {
      return {
        text: `❌ ERROR: ${airdrop.error}`,
        color: 'text-red-400'
      };
    }

    if (airdrop.claimed || claimStatus === 'completed') {
      return {
        text: `✅ AIRDROP SUCCESSFULLY CLAIMED: ${airdrop.claimAmount?.toLocaleString() || CLAIM_AMOUNT} CAT COIN`,
        color: 'text-green-400'
      };
    }

    if (airdrop.claiming) {
      return {
        text: '⚡ SEDANG MEMPROSES CLAIM...',
        color: 'text-yellow-400'
      };
    }

    return null;
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="bg-black/80 border-green-400 border-2 matrix-font">
      <CardHeader>
        <CardTitle className="text-green-400 text-lg matrix-font">
          {'>'} CLAIM YOUR CAT COIN AIRDROP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-green-400 glitch-text">
            {CLAIM_AMOUNT} CAT COIN 🐱
          </div>
          <div className="text-sm text-green-300 matrix-font">
            {'>'} Free for eligible users
          </div>
        </div>

        {statusDisplay && (
          <div className={`p-3 rounded-lg text-sm border-2 border-green-400 bg-black/50 ${statusDisplay.color}`}>
            {statusDisplay.text}
          </div>
        )}

        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleClaimAirdrop}
            disabled={true}
            className="flex-1 matrix-button opacity-50 cursor-not-allowed"
          >
            {'{\'>\'}  CLAIM AIRDROP'}
          </Button>
          <div className="text-xs text-green-400 matrix-font bg-black/50 border border-green-400 px-2 py-1 rounded">
            COMING SOON
          </div>
        </div>

        <div className="bg-black/50 border-2 border-green-400 p-3 rounded-lg text-sm text-green-400 matrix-font">
          <strong>{'>'} AIRDROP INFO:</strong><br />
          {'>'} 1. Click "CLAIM AIRDROP" to start<br />
          {'>'} 2. Smart contract will verify eligibility<br />
          {'>'} 3. {CLAIM_AMOUNT} CAT COIN will be sent to your wallet<br />
          {'>'} 4. Free with no additional fees! 🐱
        </div>

        {(airdrop.claimed || claimStatus === 'completed') && (
          <div className="bg-black/50 border-2 border-green-400 p-3 rounded-lg text-sm text-green-400 matrix-font">
            <strong>✅ CLAIM SUCCESSFUL!</strong><br />
            {'>'} {airdrop.claimAmount?.toLocaleString() || CLAIM_AMOUNT} CAT COIN has been sent<br />
            {'>'} Check your wallet for CAT COIN tokens 🐱<br />
            {'>'} Thank you for joining the CAT COIN Matrix!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimSection;
