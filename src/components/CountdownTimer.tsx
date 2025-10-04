import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [glitchEffect, setGlitchEffect] = useState(false);

  useEffect(() => {
    // Get or set a fixed target date that persists across refreshes
    const getTargetDate = (): Date => {
      const storedTargetDate = localStorage.getItem('presale-countdown-target');
      
      if (storedTargetDate) {
        return new Date(storedTargetDate);
      } else {
        // Set target date to 7 days from now (only on first visit)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);
        localStorage.setItem('presale-countdown-target', targetDate.toISOString());
        return targetDate;
      }
    };

    const targetDate = getTargetDate();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });

        // Random glitch effect
        if (Math.random() < 0.1) {
          setGlitchEffect(true);
          setTimeout(() => setGlitchEffect(false), 150);
        }
      } else {
        // Countdown has ended
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        // Optionally remove the stored target date when countdown ends
        localStorage.removeItem('presale-countdown-target');
      }
    }, 1000);

    // Initial calculation to avoid delay
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    
    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const glitchChars = ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□'];
  const getGlitchChar = () => glitchChars[Math.floor(Math.random() * glitchChars.length)];

  return (
    <div className="bg-black/90 border-2 border-white p-6 rounded matrix-font">
      {/* ASCII Art Header */}
      <div className="text-white text-xs font-mono mb-4 text-center">
        <div className="whitespace-pre-line">
{`╔═══════════════════════════════════════╗
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  ░░██████░░██████░░██████░░██████░░░░  ║
║  ░░██░░██░░██░░██░░██░░██░░██░░██░░░░  ║
║  ░░██████░░██████░░██████░░██████░░░░  ║
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
╚═══════════════════════════════════════╝`}
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <div className="text-white text-lg font-mono">
          {'>'} PRESALE COUNTDOWN {'<'}
        </div>
        <div className="text-white/60 text-sm mt-1">
          ▓▓▓ TIME REMAINING ▓▓▓
        </div>
      </div>

      {/* Countdown Display */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: 'DAYS', value: timeLeft.days },
          { label: 'HOURS', value: timeLeft.hours },
          { label: 'MINS', value: timeLeft.minutes },
          { label: 'SECS', value: timeLeft.seconds }
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="bg-black border border-white p-3 rounded">
              <div className={`text-white font-mono text-2xl ${glitchEffect ? 'animate-pulse' : ''}`}>
                {glitchEffect && Math.random() < 0.3 
                  ? getGlitchChar() + getGlitchChar()
                  : formatNumber(item.value)
                }
              </div>
            </div>
            <div className="text-white/80 text-xs mt-2 font-mono">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* ASCII Progress Bar */}
      <div className="mb-4">
        <div className="text-white/60 text-xs mb-2 font-mono text-center">
          PRESALE PROGRESS
        </div>
        <div className="bg-black border border-white p-2 rounded">
          <div className="text-white font-mono text-xs">
            {'['}
            {'█'.repeat(Math.floor(Math.random() * 20) + 5)}
            {'░'.repeat(25 - Math.floor(Math.random() * 20) + 5)}
            {']'}
          </div>
        </div>
      </div>

      {/* Glitch Text Effect */}
      <div className="text-center">
        <div className={`text-white/80 text-xs font-mono ${glitchEffect ? 'animate-bounce' : ''}`}>
          {glitchEffect 
            ? `${getGlitchChar()}${getGlitchChar()}${getGlitchChar()} SYSTEM ACTIVE ${getGlitchChar()}${getGlitchChar()}${getGlitchChar()}`
            : '▓▓▓ PRESALE ENDING SOON ▓▓▓'
          }
        </div>
      </div>

      {/* Bottom ASCII Border */}
      <div className="text-white/40 text-xs font-mono mt-4 text-center">
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      </div>
    </div>
  );
};

export default CountdownTimer;