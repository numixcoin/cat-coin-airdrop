
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import EligibilityCheck from './EligibilityCheck';
import ClaimSection from './ClaimSection';
import SocialTasks from './SocialTasks';
import PresaleSection from './PresaleSection';
import WalkingCatAnimation from './WalkingCatAnimation';
import RentRecovery from './RentRecovery';
import { toast } from '@/components/ui/sonner';
import { useWallet } from '../hooks/useWallet';
import { useAirdrop } from '../hooks/useAirdrop';
import { usePresale } from '../hooks/usePresale';

declare global {
  interface Window {
    solana?: any;
    phantom?: any;
    solflare?: any;
  }
}

const AirdropContainer = () => {
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [socialTasksCompleted, setSocialTasksCompleted] = useState(false);
  
  // Use custom hooks for wallet and smart contract functionality
  const { connected, publicKey, connecting, wallet, connectWallet, disconnectWallet } = useWallet();
  const airdrop = useAirdrop(wallet);
  const presale = usePresale(wallet);

  // Auto-connect effect is handled by useWallet hook
  useEffect(() => {
    if (connected && publicKey) {
      toast.success('Wallet connected to Matrix Protocol');
    }
  }, [connected, publicKey]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold glitch-text animate-pulse text-white matrix-font text-center leading-tight">
            CAT COIN
          </h1>
          
          {/* Walking Cat Animation */}
          <WalkingCatAnimation />
          
          <p className="text-lg md:text-xl text-white typewriter text-center">
            {'>'} cats are better then dogs
          </p>
        </div>
      </div>

      {/* Presale Section - First Priority */}
      <PresaleSection 
        wallet={''} 
        provider={null}
        presale={presale}
      />

      {/* Social Tasks - Second Priority */}
      <SocialTasks 
        wallet={''}
        onTasksComplete={setSocialTasksCompleted}
      />

      {/* Eligibility Check - Third Priority */}
      <EligibilityCheck 
        wallet={''}
        onEligibilityCheck={setEligibilityChecked}
        onEligibilityResult={setIsEligible}
      />

      {/* Claim Section - Only after eligibility check */}
      {eligibilityChecked && isEligible && (
        <ClaimSection 
          wallet={''} 
          provider={null}
          airdrop={airdrop}
        />
      )}

      {/* Address Generator Link */}
      <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
              <Zap className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Custom Address Generator</h3>
            </div>
            <p className="text-sm text-green-300/70 mb-4">
              Generate custom Solana wallet addresses with your desired prefix/suffix or completely random addresses
            </p>
            <Link to="/generator">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Generate Custom Address
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Rent Recovery Section */}
      <RentRecovery />
    </div>
  );
};

export default AirdropContainer;
