// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix rain background effect */}
      <div className="absolute inset-0 opacity-20">
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
      
      <div className="text-center z-10 relative">
        <div className="mb-8">
          <pre className="text-green-400 text-lg mb-4 glitch-text">
{`    /\\_/\\  
   ( o.o ) 
    {'>'} ^ {'<'}  `}
          </pre>
        </div>
        <h1 className="text-6xl font-bold mb-4 glitch-text animate-pulse">
          ░█▀▀░█▀█░▀█▀░░░█▀▀░█▀█░▀█▀░█▀█
          ░█░░░█▀█░░█░░░░█░░░█░█░░█░░█░█
          ░▀▀▀░▀░▀░░▀░░░░▀▀▀░▀▀▀░▀▀▀░▀░▀
        </h1>
        <p className="text-xl text-green-300 mb-8 typewriter">
          {'>'} INITIALIZING MATRIX PROTOCOL...
          <br />
          {'>'} CAT COIN AIRDROP SYSTEM ONLINE
          <br />
          {'>'} READY FOR DEPLOYMENT 🐱
        </p>
        <div className="border border-green-400 p-4 bg-black bg-opacity-50">
          <p className="text-sm">ENTER THE MATRIX • CLAIM YOUR COINS • JOIN THE REVOLUTION</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
