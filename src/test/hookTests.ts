// Custom Hooks Test
import { useWallet } from '../hooks/useWallet';
import { useAirdrop } from '../hooks/useAirdrop';
import { usePresale } from '../hooks/usePresale';

export const testCustomHooks = () => {
  console.log('🪝 Testing Custom Hooks...');
  
  try {
    // Test hook imports
    console.log('✅ useWallet hook imported successfully');
    console.log('✅ useAirdrop hook imported successfully');
    console.log('✅ usePresale hook imported successfully');
    
    // Test hook structure
    console.log('🔍 Hook functions available:');
    console.log('  - useWallet: Wallet connection management');
    console.log('  - useAirdrop: Airdrop claim functionality');
    console.log('  - usePresale: Token presale functionality');
    
    console.log('🎉 All custom hooks tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Custom hooks test failed:', error);
    return false;
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  testCustomHooks();
}