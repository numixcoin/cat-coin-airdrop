
import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ExternalLink } from 'lucide-react';

interface ClaimSectionProps {
  publicKey: PublicKey;
  onClaimed: () => void;
}

const ClaimSection: React.FC<ClaimSectionProps> = ({ publicKey, onClaimed }) => {
  const { connection } = useConnection();
  const { signTransaction } = useWallet();
  const [isClaiming, setIsClaiming] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const FEE_ADDRESS = 'Ec8pFBaToYb1THRQg9V9juFmYiX93upnT2WA63t7qkt1';
  const CLAIM_FEE = 0.01; // SOL
  const CLAIM_AMOUNT = '50,000';

  const claimAirdrop = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected properly');
      return;
    }

    setIsClaiming(true);
    try {
      // Check wallet balance
      const balance = await connection.getBalance(publicKey);
      const requiredBalance = CLAIM_FEE * LAMPORTS_PER_SOL + 5000; // 5000 lamports for transaction fee
      
      if (balance < requiredBalance) {
        throw new Error(`Insufficient SOL balance. Need at least ${(requiredBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
      }

      // Get recent blockhash
      const { blockhash } = await connection.getRecentBlockhash('finalized');
      
      // Create transaction
      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Add fee transfer instruction
      const feeRecipient = new PublicKey(FEE_ADDRESS);
      const feeInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: feeRecipient,
        lamports: CLAIM_FEE * LAMPORTS_PER_SOL
      });
      transaction.add(feeInstruction);

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        }
      );

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Mark as claimed
      const claimed = JSON.parse(localStorage.getItem('claimedAddresses') || '[]');
      claimed.push(publicKey.toString());
      localStorage.setItem('claimedAddresses', JSON.stringify(claimed));

      setTransactionHash(signature);
      onClaimed();
      toast.success('Airdrop claim processed successfully!');

    } catch (error) {
      console.error('Claim error:', error);
      toast.error(`Claim failed: ${error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  if (transactionHash) {
    return (
      <Card className="bg-green-900/20 border-green-600">
        <CardHeader>
          <CardTitle className="text-green-400 text-lg">🎉 Claim Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-green-300">✅ Fee Payment: 0.01 SOL sent to fee address</p>
            <p className="text-green-300">✅ Amount Reserved: {CLAIM_AMOUNT} CHIMPZY tokens</p>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-2">Transaction Hash:</div>
            <div className="font-mono text-xs bg-gray-700 p-2 rounded break-all text-white">
              {transactionHash}
            </div>
          </div>

          <a 
            href={`https://solscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View on Solscan</span>
          </a>

          <div className="bg-yellow-900/20 border border-yellow-600 rounded p-3">
            <div className="text-yellow-400 font-semibold mb-2">📋 Next Steps:</div>
            <ul className="text-sm text-yellow-300 space-y-1">
              <li>• Your claim has been recorded on-chain</li>
              <li>• Token distribution will be processed within 24 hours</li>
              <li>• Tokens will appear in your wallet automatically</li>
              <li>• You can verify your claim using the transaction hash above</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-lg">Claim Your Airdrop</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">
            {CLAIM_AMOUNT} CHIMPZY
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-3 text-sm">
          <div className="text-gray-300">
            <strong>Claim Fee:</strong> {CLAIM_FEE} SOL
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Fee will be sent to: {FEE_ADDRESS}
          </div>
          <div className="text-xs text-gray-400">
            <strong>Treasury:</strong> vnxiyVZ7dAaRN12gA8EjkQ1NDZ1mD4yQv5SgPv5A9gh
          </div>
        </div>

        <Button
          onClick={claimAirdrop}
          disabled={isClaiming}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
        >
          {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isClaiming ? 'Claiming...' : 'Claim Airdrop'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClaimSection;
