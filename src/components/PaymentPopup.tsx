import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Copy, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  solAmount: number;
  tokenAmount: number;
}

const PAYMENT_ADDRESS = 'CATo5SbyJyhNJmUBpbmc21RN3ERpEun9EmMNZjugeCWy';

const PaymentPopup: React.FC<PaymentPopupProps> = ({ 
  isOpen, 
  onClose, 
  solAmount, 
  tokenAmount 
}) => {
  const [addressCopied, setAddressCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setAddressCopied(true);
      toast.success('Payment address copied to clipboard!');
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-black border-2 border-green-400 text-green-400 matrix-font relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold glitch-text">
              {'>'} SEND SOL PAYMENT
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-black/50 border border-green-400 p-3 rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-lg font-bold">
                {'>'} PAYMENT SUMMARY
              </div>
              <div className="text-sm space-y-1">
                <div>SOL Amount: <span className="text-green-300 font-bold">{solAmount} SOL</span></div>
                <div>You will receive: <span className="text-green-300 font-bold">{tokenAmount.toLocaleString()} CAT COIN</span></div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-black/50 border border-green-400 p-3 rounded-lg text-sm">
            <div className="font-bold mb-2">{'>'} PAYMENT INSTRUCTIONS:</div>
            <div className="space-y-1 text-green-300">
              <div>1. Copy the payment address below</div>
              <div>2. Send exactly {solAmount} SOL to this address</div>
              <div>3. Your CAT COIN tokens will be sent automatically</div>
              <div>4. Transaction may take 1-2 minutes to process</div>
            </div>
          </div>

          {/* Payment Address */}
          <div className="bg-black/50 border border-green-400 p-3 rounded-lg">
            <div className="font-bold mb-2">{'>'} PAYMENT ADDRESS:</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-black border border-green-400 p-2 rounded text-xs font-mono break-all">
                {PAYMENT_ADDRESS}
              </div>
              <Button
                onClick={() => copyToClipboard(PAYMENT_ADDRESS)}
                size="sm"
                className="matrix-button flex-shrink-0"
              >
                {addressCopied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-900/20 border border-red-400 p-3 rounded-lg text-red-400 text-sm">
            <div className="font-bold">⚠️ IMPORTANT:</div>
            <div className="text-xs mt-1">
              • Send EXACTLY {solAmount} SOL - no more, no less<br />
              • Only send from a Solana wallet you control<br />
              • Double-check the address before sending<br />
              • Transactions are irreversible
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-green-400 text-green-400 hover:bg-green-400/10"
            >
              {'>'} CANCEL
            </Button>
            <Button
              onClick={() => {
                toast.success('Payment instructions ready! Send SOL to complete purchase.');
                onClose();
              }}
              className="flex-1 matrix-button"
            >
              {'>'} I UNDERSTAND
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPopup;