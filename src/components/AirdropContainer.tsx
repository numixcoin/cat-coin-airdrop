
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EligibilityCheck from './EligibilityCheck';
import ClaimSection from './ClaimSection';
import SocialTasks from './SocialTasks';
import PresaleSection from './PresaleSection';
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
          <h1 className="text-4xl md:text-6xl font-bold glitch-text animate-pulse text-green-400 matrix-font text-center leading-tight">
            <div className="flex flex-col items-center space-y-2">
              <div>░█▀▀░█▀█░▀█▀░░░█▀▀░█▀█░▀█▀░█▀█</div>
              <div>░█░░░█▀█░░█░░░░█░░░█░█░░█░░█░█</div>
              <div>░▀▀▀░▀░▀░░▀░░░░▀▀▀░▀▀▀░▀▀▀░▀░▀</div>
            </div>
          </h1>
          <p className="text-lg md:text-xl text-green-300 typewriter text-center">
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
    </div>
  );
};

export default AirdropContainer;
