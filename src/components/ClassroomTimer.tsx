import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Bell, X } from 'lucide-react';

export const ClassroomTimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 Min default
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState<number>(25 * 60);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsFinished(true);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {}
  };

  const setPreset = (minutes: number) => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(minutes * 60);
    setInitialTime(minutes * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(initialTime);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Mini Toggle Button in Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
          isRunning
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : isFinished
            ? 'bg-rose-50 text-rose-800 border-rose-300 animate-bounce'
            : 'bg-white hover:bg-slate-50 text-gray-700 border-gray-300'
        }`}
        title="Unterrichts-Timer öffnen"
      >
        <Clock className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-[#F39200]' : ''}`} />
        <span>{formatTime(timeLeft)}</span>
      </button>

      {/* Floating Popup */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-100">
            <span className="text-xs font-extrabold text-[#0B7BA7] uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Arbeitsphasen-Timer
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Big Time Display */}
          <div
            className={`text-center py-2 text-3xl font-black font-mono tracking-tight rounded-xl mb-3 ${
              isFinished
                ? 'bg-rose-100 text-rose-800 animate-pulse'
                : 'bg-slate-50 text-gray-800'
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                setIsFinished(false);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-sm text-white transition-transform active:scale-95 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-[#0B7BA7] hover:bg-[#00558F]'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={resetTimer}
              className="p-1.5 rounded-xl border border-slate-300 text-gray-600 hover:bg-slate-100"
              title="Zurücksetzen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Presets */}
          <div className="flex gap-1 justify-between pt-1 border-t border-slate-100">
            <button
              onClick={() => setPreset(15)}
              className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 hover:bg-sky-50 text-gray-700 font-semibold border border-slate-200"
            >
              15m
            </button>
            <button
              onClick={() => setPreset(25)}
              className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 hover:bg-sky-50 text-gray-700 font-semibold border border-slate-200"
            >
              25m
            </button>
            <button
              onClick={() => setPreset(45)}
              className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 hover:bg-sky-50 text-gray-700 font-semibold border border-slate-200"
            >
              45m
            </button>
            <button
              onClick={() => setPreset(90)}
              className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 hover:bg-sky-50 text-gray-700 font-semibold border border-slate-200"
            >
              90m
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
