import React, { useState, useEffect } from 'react';

const WalkingCatAnimation: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [position, setPosition] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);

  // ASCII art frames for walking cat
  const catFrames = [
    // Frame 1 - Standing
    `    /\\_/\\  
   ( o.o ) 
    > ^ <  `,
    
    // Frame 2 - Walking step 1
    `    /\\_/\\  
   ( ^.^ ) 
    > - <  `,
    
    // Frame 3 - Walking step 2
    `    /\\_/\\  
   ( -.^ ) 
    > ~ <  `,
    
    // Frame 4 - Walking step 3
    `    /\\_/\\  
   ( o.- ) 
    > ^ <  `,
    
    // Frame 5 - Walking step 4
    `    /\\_/\\  
   ( ^.o ) 
    > - <  `,
    
    // Frame 6 - Walking step 5
    `    /\\_/\\  
   ( o.o ) 
    > ~ <  `
  ];

  // Glitch characters for ASCII effect
  const glitchChars = ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□', '▪', '▫', '◆', '◇', '◈', '◉'];

  useEffect(() => {
    // Cat walking animation
    const walkInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % catFrames.length);
    }, 500);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.15) { // 15% chance for glitch
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }
    }, 1000);

    return () => {
      clearInterval(walkInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  // Function to apply glitch effect to text
  const applyGlitch = (text: string): string => {
    if (!glitchActive) return text;
    
    return text
      .split('')
      .map(char => {
        if (char !== ' ' && char !== '\n' && Math.random() < 0.3) {
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        return char;
      })
      .join('');
  };

  return (
    <div className="w-full overflow-hidden bg-black/20 border border-white/30 rounded-lg p-4 my-4">
      {/* ASCII Border Top */}
      <div className="text-white/60 text-xs font-mono text-center mb-2">
        ═══════════════════════════════════════════════════════════════
      </div>
      
      {/* Walking Cat Container */}
      <div className="relative h-16 overflow-hidden">
        <div 
          className={`absolute transition-all duration-300 ease-linear ${
            glitchActive ? 'animate-pulse text-red-400' : 'text-green-400'
          }`}
          style={{ 
            left: `${position}%`,
            transform: 'translateX(-50%)',
            fontFamily: 'monospace',
            fontSize: '10px',
            lineHeight: '1.2',
            whiteSpace: 'pre'
          }}
        >
          {applyGlitch(catFrames[currentFrame])}
        </div>
        
        {/* Trail effect */}
        <div 
          className="absolute text-green-400/30"
          style={{ 
            left: `${(position - 10 + 100) % 100}%`,
            transform: 'translateX(-50%)',
            fontFamily: 'monospace',
            fontSize: '10px',
            lineHeight: '1.2',
            whiteSpace: 'pre'
          }}
        >
          {catFrames[(currentFrame - 1 + catFrames.length) % catFrames.length]}
        </div>
      </div>
      
      {/* ASCII Border Bottom */}
      <div className="text-white/60 text-xs font-mono text-center mt-2">
        ═══════════════════════════════════════════════════════════════
      </div>
      
      {/* Status Text */}
      <div className="text-center mt-2">
        <span className={`text-xs font-mono ${
          glitchActive ? 'text-red-400 animate-pulse' : 'text-green-400'
        }`}>
          {glitchActive ? '>>> GLITCH DETECTED <<<' : '>>> CAT WALKING IN THE MATRIX <<<'}
        </span>
      </div>
      
      {/* Matrix-style progress dots */}
      <div className="flex justify-center mt-2 space-x-1">
        {Array.from({ length: 20 }, (_, i) => (
          <span
            key={i}
            className={`text-xs ${
              i === Math.floor(position / 5) ? 'text-green-400' : 'text-green-400/30'
            }`}
          >
            •
          </span>
        ))}
      </div>
    </div>
  );
};

export default WalkingCatAnimation;