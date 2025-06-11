
import React from 'react';
import AirdropContainer from '@/components/AirdropContainer';
import WalletProvider from '@/components/WalletProvider';

const AirdropPage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <WalletProvider>
        <AirdropContainer />
      </WalletProvider>
    </div>
  );
};

export default AirdropPage;
