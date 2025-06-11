
import React from 'react';

interface WalletProviderProps {
  children: React.ReactNode;
}

const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export default WalletProvider;
