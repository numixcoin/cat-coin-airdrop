
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface ClaimSectionProps {
  wallet: string;
  provider: any;
}

const ClaimSection: React.FC<ClaimSectionProps> = ({ wallet, provider }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<any>(null);

  const CLAIM_AMOUNT = '50,000';
  const CLAIM_FEE = 0.01;
  const FEE_RECIPIENT = 'Ec8pFBaToYb1THRQg9V9juFmYiX93upnT2WA63t7qkt1';
  const TREASURY = 'vnxiyVZ7dAaRN12gA8EjkQ1NDZ1mD4yQv5SgPv5A9gh';

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

  const claimAirdrop = async () => {
    setIsClaiming(true);
    try {
      toast.info('Processing fee payment...');

      // Simulate fee transaction (in production, this would be actual Solana transaction)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockFeeHash = `fee_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      toast.info('Fee paid! Processing airdrop claim...');

      // Call backend service to process the claim
      const response = await fetch('/api/process-airdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallet,
          feeTransactionHash: mockFeeHash,
          feePaid: CLAIM_FEE
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process claim');
      }

      setClaimData(result.claim);
      setClaimStatus(result.claim.status);
      toast.success('Claim submitted! Tokens will be sent shortly.');

      // Poll for status updates
      pollClaimStatus(result.claim.id);

    } catch (error: any) {
      setClaimStatus('failed');
      toast.error(`Claim failed: ${error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  const pollClaimStatus = async (claimId: string) => {
    const maxAttempts = 20;
    let attempts = 0;

    const poll = async () => {
      try {
        const { data, error } = await supabase
          .from('airdrop_claims')
          .select('*')
          .eq('id', claimId)
          .single();

        if (data) {
          setClaimData(data);
          setClaimStatus(data.status);

          if (data.status === 'completed') {
            toast.success('🎉 Tokens have been sent to your wallet!');
            return;
          } else if (data.status === 'failed') {
            toast.error('Token transfer failed. Please contact support.');
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000); // Poll every 3 seconds
        }
      } catch (error) {
        console.error('Error polling claim status:', error);
      }
    };

    poll();
  };

  const getStatusDisplay = () => {
    switch (claimStatus) {
      case 'pending':
        return { text: '⏳ Claim Pending', color: 'bg-yellow-900/50 text-yellow-400 border-yellow-600' };
      case 'processing':
        return { text: '⚡ Processing Tokens...', color: 'bg-blue-900/50 text-blue-400 border-blue-600' };
      case 'completed':
        return { text: '🎉 Claim Completed!', color: 'bg-green-900/50 text-green-400 border-green-600' };
      case 'failed':
        return { text: '❌ Claim Failed', color: 'bg-red-900/50 text-red-400 border-red-600' };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="bg-gray-800/50 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-lg">Claim Your Airdrop</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-cyan-400">
            {CLAIM_AMOUNT} CHIMPZY
          </div>
          <div className="text-sm text-gray-400">
            <strong>Claim Fee:</strong> {CLAIM_FEE} SOL<br />
            <small>Fee recipient: {FEE_RECIPIENT}</small><br />
            <small><strong>Treasury:</strong> {TREASURY}</small>
          </div>
        </div>

        {statusDisplay && (
          <div className={`p-3 rounded-lg text-sm border ${statusDisplay.color}`}>
            {statusDisplay.text}
            {claimData?.token_transaction_hash && (
              <div className="mt-2">
                <div className="text-xs text-gray-400">Token Transaction Hash:</div>
                <div className="font-mono text-xs bg-gray-700 p-2 rounded break-all">
                  {claimData.token_transaction_hash}
                </div>
              </div>
            )}
            {claimData?.error_message && (
              <div className="mt-2 text-xs text-red-300">
                Error: {claimData.error_message}
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={claimAirdrop}
          disabled={isClaiming || claimStatus === 'completed' || claimStatus === 'processing'}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700"
        >
          {isClaiming ? 'Processing...' : 
           claimStatus === 'completed' ? '✅ Tokens Sent' :
           claimStatus === 'processing' ? '⚡ Processing...' :
           'Claim Airdrop'}
        </Button>

        {claimStatus === 'completed' && (
          <div className="bg-blue-900/50 border border-blue-600 p-3 rounded-lg text-sm text-blue-400">
            <strong>✅ Success!</strong><br />
            • Your tokens have been sent to your wallet<br />
            • Transaction completed at: {new Date(claimData?.completed_at).toLocaleString()}<br />
            • Check your wallet for the CHIMPZY tokens
          </div>
        )}

        {claimStatus === 'processing' && (
          <div className="bg-blue-900/50 border border-blue-600 p-3 rounded-lg text-sm text-blue-400">
            <strong>⚡ Processing...</strong><br />
            • Fee payment confirmed<br />
            • Treasury is sending your tokens<br />
            • This usually takes 30-60 seconds
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimSection;
