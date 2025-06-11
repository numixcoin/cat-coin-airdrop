
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TokenInfo = () => {
  const TOKEN_ADDRESS = '3C2vci7HPSqxgr1xStkJqMJHZnstERZukNgixAnBNkcW';
  const CLAIM_AMOUNT = '50,000';

  return (
    <Card className="bg-gray-800/50 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-lg">Token Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm text-gray-400 mb-1">Token Address:</div>
          <div className="font-mono text-xs bg-gray-700 p-2 rounded break-all text-white">
            {TOKEN_ADDRESS}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Claim Amount:</div>
          <div className="text-lg font-bold text-cyan-400">
            {CLAIM_AMOUNT} CHIMPZY per wallet
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenInfo;
