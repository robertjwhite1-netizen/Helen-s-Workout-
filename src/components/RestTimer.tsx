import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Plus, Minus, X } from 'lucide-react';

interface RestTimerProps {
  key?: any;
  duration: number; // default duration in seconds
  onComplete?: (actualTimeElapsed: number) => void;
  onClose?: () => void;
}

export default function RestTimer({ duration, onComplete, onClose }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPlaying, setIsPlaying] = useState(true); // default auto-start
  const [totalDuration, setTotalDuration] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedAccumulatedRef = useRef<number>(0);

  // Track elapsed time accurately
  useEffect(() => {
    setTimeLeft(duration);
    setTotalDuration(duration);
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    elapsedAccumulatedRef.current = 0;
  }, [duration]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const start = Date.now();
      timerRef.current = setTimeout(() => {
        const delta = Math.round((Date.now() - start) / 1000);
        setTimeLeft((prev) => {
          const next = prev - (delta || 1);
          return next < 0 ? 0 : next;
        });
        elapsedAccumulatedRef.current += (delta || 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  // Handle completion trigger
  useEffect(() => {
    if (timeLeft === 0) {
      // Simple play completion tone or vibration if supported
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch (e) {
          // ignore iframe vibration limits
        }
      }
      setTimeout(() => {
        if (onComplete) {
          onComplete(elapsedAccumulatedRef.current);
        }
      }, 800);
    }
  }, [timeLeft, onComplete]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setTimeLeft(totalDuration);
    setIsPlaying(false);
    elapsedAccumulatedRef.current = 0;
  };

  const adjustTime = (amount: number) => {
    setTimeLeft((prev) => {
      const next = prev + amount;
      if (next <= 0) return 0;
      // Also adjust total duration if it exceeds it to maintain visual ring proportions
      if (next > totalDuration) {
        setTotalDuration(next);
      }
      return next;
    });
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete(elapsedAccumulatedRef.current);
    }
  };

  // SVG parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalDuration > 0 
    ? circumference - (timeLeft / totalDuration) * circumference 
    : 0;

  // Format time (MM:SS)
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="rest-timer-container" className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-[#CBD1BC] border border-black/5 shadow-lg rounded-[32px] p-5 z-50 text-black flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-300">
      
      {/* Title block */}
      <div className="flex justify-between items-center w-full mb-2 px-1">
        <span className="text-xs uppercase tracking-widest font-bold text-gray-700">Resting Phase</span>
        <button 
          id="close-timer-btn"
          onClick={onClose} 
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
          title="Minimize"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main concentric circle timer */}
      <div className="relative w-40 h-40 flex items-center justify-center my-3">
        <svg className="w-full h-full rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="5"
          />
          {/* Interactive foreground circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#97A382"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        {/* Absolute center countdown */}
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-mono font-bold tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
            {isPlaying ? 'resting' : 'paused'}
          </span>
        </div>
      </div>

      {/* Inline Time Adjustments (+15s / -15s) */}
      <div className="flex gap-4 mb-4">
        <button
          id="minus-15s-btn"
          onClick={() => adjustTime(-15)}
          className="flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-full bg-white/40 hover:bg-white/60 transition-all cursor-pointer"
          disabled={timeLeft <= 0}
        >
          <Minus size={12} /> 15s
        </button>
        <button
          id="plus-15s-btn"
          onClick={() => adjustTime(15)}
          className="flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-full bg-white/40 hover:bg-white/60 transition-all cursor-pointer"
        >
          <Plus size={12} /> 15s
        </button>
      </div>

      {/* Primary Commands Center */}
      <div className="flex items-center justify-between w-full px-4 border-t border-black/5 pt-4">
        <button
          id="reset-timer-btn"
          onClick={handleReset}
          className="p-2.5 rounded-full bg-white/30 hover:bg-white/55 transition-all flex items-center justify-center cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw size={18} />
        </button>

        <button
          id="play-pause-timer-btn"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-[#97A382] text-white hover:bg-[#97A382]/90 transition-all flex items-center justify-center shadow-md cursor-pointer"
          title={isPlaying ? 'Pause' : 'Start'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>

        <button
          id="skip-timer-btn"
          onClick={handleSkip}
          className="p-2.5 rounded-full bg-white/30 hover:bg-white/55 transition-all flex items-center justify-center text-black/80 cursor-pointer"
          title="Skip Rest"
        >
          <FastForward size={18} />
        </button>
      </div>
    </div>
  );
}
