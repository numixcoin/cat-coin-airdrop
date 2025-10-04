import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Clock, AlertCircle } from 'lucide-react';

const RentRecovery = () => {
  return (
    <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
            <Coins className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Rent Recovery</h3>
          </div>
          
          <p className="text-sm text-green-300/70 mb-4">
            Close ATA accounts and recover SOL rent fees back to your wallet
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">COMING SOON</span>
            </div>
            
            <div className="bg-black/60 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-yellow-400 font-semibold text-sm mb-1">
                    What is Rent Recovery?
                  </h4>
                  <p className="text-yellow-300/80 text-xs leading-relaxed">
                    Recover SOL from unused Associated Token Accounts (ATA). 
                    Each ATA requires ~0.00203 SOL rent. Close unused accounts 
                    to get your SOL back.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              disabled 
              className="bg-gray-600 text-gray-400 cursor-not-allowed px-6 py-2 w-full"
            >
              <Coins className="w-4 h-4 mr-2" />
              Recover SOL Rent (Coming Soon)
            </Button>
          </div>
          
          <div className="text-xs text-green-300/50 mt-4">
            {'>'} Feature will be available in the next update
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentRecovery;