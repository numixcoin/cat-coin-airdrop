import React from 'react';
import AddressGenerator from '../components/AddressGenerator';
import WalkingCatAnimation from '../components/WalkingCatAnimation';

const GeneratorPage = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix rain background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="matrix-rain text-xs leading-none">
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="matrix-column" style={{ left: `${i * 2}%` }}>
              {Array.from({ length: 20 }, (_, j) => (
                <div key={j} className="matrix-char animate-pulse">
                  {Math.random() > 0.5 ? '🐱' : String.fromCharCode(0x30A0 + Math.random() * 96)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-8 border-b border-green-500/30">
          <div className="mb-4">
            <pre className="text-green-400 text-sm mb-2 glitch-text">
{`    /\\_/\\  
   ( o.o ) 
    {'>'} ^ {'<'}  `}
            </pre>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold glitch-text animate-pulse text-white matrix-font mb-2">
            CAT COIN
          </h1>
          
          {/* Walking Cat Animation */}
          <div className="mb-4">
            <WalkingCatAnimation />
          </div>
          
          <h2 className="text-xl md:text-2xl text-green-400 mb-2">
            Solana Address Generator
          </h2>
          
          <p className="text-sm text-green-300/70 max-w-2xl mx-auto">
            Generate custom Solana wallet addresses with your desired prefix/suffix or completely random addresses
          </p>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <AddressGenerator />
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-green-500/30 mt-12">
          <div className="border border-green-500/30 p-4 bg-black/50 inline-block">
            <p className="text-sm text-green-400">
              SECURE • FAST • DECENTRALIZED • CAT POWERED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;