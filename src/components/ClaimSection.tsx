
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface ClaimSectionProps {
  wallet: string;
  provider: any;
}

const ClaimSection: React.FC<ClaimSectionProps> = ({ wallet, provider }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const claimAirdrop = async () => {
    setIsClaiming(true);
    try {
      // Simulate claim process
      toast.info('Processing airdrop claim...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock transaction hash
      const mockTxHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mark as claimed
      const claimedWallets = JSON.parse(localStorage.getItem('claimedWallets') || '[]');
      claimedWallets.push(wallet);
      localStorage.setItem('claimedWallets', JSON.stringify(claimedWallets));
      
      setTransactionHash(mockTxHash);
      setClaimStatus('Success');
      toast.success('Airdrop claimed successfully!');
    } catch (error: any) {
      setClaimStatus('Failed');
      toast.error(`Claim failed: ${error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  const CLAIM_AMOUNT = '50,000';
  const CLAIM_FEE = '0.01';

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
            <small>Fee recipient: Ec8pFBaToYb1THRQg9V9juFmYiX93upnT2WA63t7qkt1</small><br />
            <small><strong>Treasury:</strong> vnxiyVZ7dAaRN12gA8EjkQ1NDZ1mD4yQv5SgPv5A9gh</small>
          </div>
        </div>

        {claimStatus && (
          <div className={`p-3 rounded-lg text-sm ${
            claimStatus === 'Success' 
              ? 'bg-green-900/50 text-green-400 border border-green-600' 
              : 'bg-red-900/50 text-red-400 border border-red-600'
          }`}>
            {claimStatus === 'Success' ? '🎉 Claim Successful!' : '❌ Claim Failed'}
            {transactionHash && (
              <div className="mt-2">
                <div className="text-xs text-gray-400">Transaction Hash:</div>
                <div className="font-mono text-xs bg-gray-700 p-2 rounded break-all">
                  {transactionHash}
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={claimAirdrop}
          disabled={isClaiming || claimStatus === 'Success'}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700"
        >
          {isClaiming ? 'Claiming...' : claimStatus === 'Success' ? '✅ Already Claimed' : 'Claim Airdrop'}
        </Button>

        {claimStatus === 'Success' && (
          <div className="bg-blue-900/50 border border-blue-600 p-3 rounded-lg text-sm text-blue-400">
            <strong>📋 Next Steps:</strong><br />
            • Your claim has been recorded<br />
            • Token distribution will be processed within 24 hours<br />
            • Tokens will appear in your wallet automatically
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimSection;
