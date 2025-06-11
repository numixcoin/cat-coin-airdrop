
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface EligibilityCheckProps {
  onCheck: () => void;
  isChecking: boolean;
  isEligible: boolean;
  hasClaimed: boolean;
}

const EligibilityCheck: React.FC<EligibilityCheckProps> = ({
  onCheck,
  isChecking,
  isEligible,
  hasClaimed
}) => {
  return (
    <Card className="bg-gray-800/50 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white text-lg">Eligibility Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onCheck}
          disabled={isChecking || hasClaimed}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
        >
          {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {hasClaimed ? 'Already Claimed' : 'Check Eligibility'}
        </Button>

        {hasClaimed && (
          <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-400/10 p-3 rounded">
            <CheckCircle className="h-5 w-5" />
            <span>This wallet has already claimed the airdrop</span>
          </div>
        )}

        {isEligible && !hasClaimed && (
          <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 p-3 rounded">
            <CheckCircle className="h-5 w-5" />
            <span>✅ Eligible for airdrop!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EligibilityCheck;
