import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import PaymentPopup from './PaymentPopup';
import CountdownTimer from './CountdownTimer';

interface PresaleSectionProps {
  wallet: string;
  provider: any;
  presale: any;
}

const PresaleSection: React.FC<PresaleSectionProps> = ({ wallet, provider, presale }) => {
  const [solAmount, setSolAmount] = useState<string>('');
  const [showCalculation, setShowCalculation] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const handleSolAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSolAmount(value);
      setShowCalculation(value !== '' && parseFloat(value) > 0);
    }
  };

  const handleBuyTokens = async () => {
    if (!solAmount || parseFloat(solAmount) <= 0) {
      toast.error('Enter a valid SOL amount');
      return;
    }

    const amount = parseFloat(solAmount);
    if (amount < 0.01) {
      toast.error('Minimum purchase is 0.01 SOL');
      return;
    }

    if (amount > 10) {
      toast.error('Maximum purchase is 10 SOL per transaction');
      return;
    }

    // Show payment popup instead of processing directly
    setShowPaymentPopup(true);
  };

  const calculateTokens = (sol: number): number => {
    return sol * presale.PRESALE_RATE;
  };

  return (
    <Card className="bg-black/80 border-white border-2 matrix-font">
      <CardHeader>
        <CardTitle className="text-white text-lg matrix-font">
          {'>'} PRESALE SECTION
        </CardTitle>
      </CardHeader>
      
      {/* Countdown Timer */}
      <div className="p-4 border-b border-white">
        <CountdownTimer />
      </div>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-white text-sm">{'>'} PRESALE RATE:</div>
          <div className="bg-black border border-white p-3 rounded">
            <div className="text-white font-mono text-center text-lg">
              1 SOL = {presale.PRESALE_RATE.toLocaleString()} CAT COIN
            </div>
          </div>
        </div>

        {presale.error && (
          <div className="bg-red-900/50 border border-red-500 p-3 rounded">
            <div className="text-red-400 text-sm">❌ {presale.error}</div>
          </div>
        )}

        {presale.purchased && (
          <div className="bg-white/20 border border-white p-3 rounded">
            <div className="text-white text-sm">
              ✅ Purchase successful: {presale.purchaseAmount} SOL = {presale.tokenAmount.toLocaleString()} CAT COIN
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-white text-sm block mb-2">
              {'>'} SOL amount for purchase:
            </label>
            <Input
              type="text"
              value={solAmount}
              onChange={(e) => handleSolAmountChange(e.target.value)}
              placeholder="0.1"
              className="bg-black border-white text-white placeholder-white/60"
              disabled={presale.purchasing}
            />
            <div className="text-xs text-white/60 mt-1">
              Min: 0.01 SOL | Max: 10 SOL per transaction
            </div>
          </div>

          {showCalculation && (
            <div className="bg-black border border-white p-3 rounded">
              <div className="text-white text-sm mb-1">{'>'} Calculation:</div>
              <div className="text-white font-mono">
                {parseFloat(solAmount)} SOL = {calculateTokens(parseFloat(solAmount)).toLocaleString()} CAT COIN
              </div>
            </div>
          )}

          <Button
            onClick={handleBuyTokens}
            disabled={presale.purchasing || !solAmount || parseFloat(solAmount) <= 0}
            className="w-full matrix-button"
          >
            {presale.purchasing ? '{\'>\'}  PROCESSING PURCHASE...' : '{\'>\'}  BUY CAT COIN'}
          </Button>
        </div>

        <div className="border-t border-white pt-4">
          <div className="text-white text-sm mb-2">{'>'} PRESALE INFO:</div>
          <div className="space-y-1 text-xs text-white">
            <div>• Rate: 1 SOL = 2,500,000 CAT COIN</div>
            <div>• Minimum: 0.01 SOL</div>
            <div>• Maximum: 10 SOL per transaction</div>
            <div>• Tokens will be sent directly to your wallet</div>
            <div>• Presale uses Solana blockchain</div>
          </div>
        </div>

        {presale.totalPurchased > 0 && (
          <div className="bg-white/10 border border-white p-3 rounded">
            <div className="text-white text-sm">
              {'>'} Your total purchases: {presale.totalPurchased} SOL
            </div>
          </div>
        )}
      </CardContent>

    {/* Payment Popup */}
    <PaymentPopup
      isOpen={showPaymentPopup}
      onClose={() => setShowPaymentPopup(false)}
      solAmount={parseFloat(solAmount) || 0}
      tokenAmount={calculateTokens(parseFloat(solAmount) || 0)}
    />
  </Card>
);
};

export default PresaleSection;