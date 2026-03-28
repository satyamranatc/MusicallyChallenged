import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

const PIANO_KEYS = [
  { note: 'C4', keyLabel: 'A', type: 'white' },
  { note: 'C#4', keyLabel: 'W', type: 'black' },
  { note: 'D4', keyLabel: 'S', type: 'white' },
  { note: 'D#4', keyLabel: 'E', type: 'black' },
  { note: 'E4', keyLabel: 'D', type: 'white' },
  { note: 'F4', keyLabel: 'F', type: 'white' },
  { note: 'F#4', keyLabel: 'T', type: 'black' },
  { note: 'G4', keyLabel: 'G', type: 'white' },
  { note: 'G#4', keyLabel: 'Y', type: 'black' },
  { note: 'A4', keyLabel: 'H', type: 'white' },
  { note: 'A#4', keyLabel: 'U', type: 'black' },
  { note: 'B4', keyLabel: 'J', type: 'white' },
  { note: 'C5', keyLabel: 'K', type: 'white' },
  { note: 'C#5', keyLabel: 'O', type: 'black' },
  { note: 'D5', keyLabel: 'L', type: 'white' },
  { note: 'D#5', keyLabel: 'P', type: 'black' },
  { note: 'E5', keyLabel: ';', type: 'white' },
];

export default function PianoKeyboard() {
  const [activeKeys, setActiveKeys] = useState({});
  const samplerRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize Tone.Sampler using Salamander Grand Piano samples
    const sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
      },
      release: 1.5,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        setIsLoaded(true);
      }
    });
    
    // Epic & Granular EQ for super clarity and bright professional tone
    const eq = new Tone.EQ3({
      low: 1.5,
      mid: -1.5,
      high: 6.5,
    });
    
    // Compressor to glue the bright sound and add punch
    const comp = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    });
    
    // Large Reverb for an Epic Grand studio ambiance
    const reverb = new Tone.Reverb({
      decay: 4.5,
      preDelay: 0.05,
      wet: 0.4
    }).toDestination();
    
    // Chain the effects to the piano
    sampler.chain(eq, comp, reverb);
    
    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
      eq.dispose();
      comp.dispose();
      reverb.dispose();
    };
  }, []);

  const playNote = async (note) => {
    if (Tone.context.state !== 'running') await Tone.start();
    setActiveKeys(prev => ({ ...prev, [note]: true }));
    if (isLoaded && samplerRef.current) {
      samplerRef.current.triggerAttack(note, Tone.now());
    }
  };

  const stopNote = (note) => {
    setActiveKeys(prev => ({ ...prev, [note]: false }));
    if (isLoaded && samplerRef.current) {
      samplerRef.current.triggerRelease(note, Tone.now());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const keyObj = PIANO_KEYS.find(k => k.keyLabel.toLowerCase() === e.key.toLowerCase());
      if (keyObj && !activeKeys[keyObj.note]) playNote(keyObj.note);
    };
    const handleKeyUp = (e) => {
      const keyObj = PIANO_KEYS.find(k => k.keyLabel.toLowerCase() === e.key.toLowerCase());
      if (keyObj) stopNote(keyObj.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys]);

  let whiteKeyCount = 0;
  
  return (
    <div className="w-full max-w-full overflow-x-auto sm:pb-12 sm:pt-6 sm:px-4 custom-scrollbar flex items-end sm:items-center lg:justify-center will-change-transform relative flex-1">
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm sm:rounded-4xl sm:mx-4 sm:mb-8">
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
            <div className="text-teal-600 font-bold text-lg">Downloading High-Fidelity Samples...</div>
            <div className="text-teal-500/70 text-sm">This may take a few seconds on first load</div>
          </div>
        </div>
      )}
      <div className="relative flex w-full sm:w-auto h-[65vh] sm:h-auto sm:p-4 bg-white sm:rounded-4xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.06)] sm:border sm:border-gray-100 min-w-max border-t border-gray-200">
        {PIANO_KEYS.map((key) => {
          const isActive = activeKeys[key.note];
          
          if (key.type === 'white') {
            whiteKeyCount++;
            return (
              <motion.button
                key={key.note}
                onMouseDown={() => playNote(key.note)}
                onMouseUp={() => stopNote(key.note)}
                onMouseLeave={() => isActive && stopNote(key.note)}
                onTouchStart={(e) => { e.preventDefault(); playNote(key.note); }}
                onTouchEnd={() => stopNote(key.note)}
                animate={{
                  y: isActive ? 6 : 0,
                  rotateX: isActive ? 4 : 0,
                  boxShadow: isActive 
                    ? '0 2px 4px rgba(20,184,166,0.15), inset 0 -3px 8px rgba(0,0,0,0.05), inset 0 3px 8px rgba(0,0,0,0.03)' 
                    : '0 8px 16px rgba(0,0,0,0.06), inset 0 -8px 12px rgba(0,0,0,0.02)'
                }}
                transition={{ type: "spring", stiffness: 800, damping: 25, mass: 0.5 }}
                className={`w-16 sm:w-16 h-full sm:h-[260px] mx-[2px] rounded-b-xl sm:rounded-b-2xl focus:outline-none flex flex-col justify-end pb-4 sm:pb-5 items-center group
                  ${isActive ? 'bg-gray-50' : 'bg-white'} border border-gray-200 sm:border-gray-100/50 relative select-none shrink-0
                `}
                style={{ transformOrigin: 'top center' }}
              >
                <div className={`font-semibold text-xs sm:text-sm transition-colors ${isActive ? 'text-teal-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                  {key.keyLabel}
                </div>
              </motion.button>
            );
          } else {
            // Black key
            return (
              <motion.button
                key={key.note}
                onMouseDown={(e) => { e.stopPropagation(); playNote(key.note); }}
                onMouseUp={(e) => { e.stopPropagation(); stopNote(key.note); }}
                onMouseLeave={(e) => { e.stopPropagation(); isActive && stopNote(key.note); }}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); playNote(key.note); }}
                onTouchEnd={(e) => { e.stopPropagation(); stopNote(key.note); }}
                animate={{
                  y: isActive ? 4 : 0,
                  rotateX: isActive ? 5 : 0,
                  boxShadow: isActive 
                    ? '0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(255,255,255,0.1)' 
                    : '0 6px 12px rgba(0,0,0,0.15), inset 0 -4px 8px rgba(255,255,255,0.1)'
                }}
                transition={{ type: "spring", stiffness: 800, damping: 25, mass: 0.5 }}
                className={`absolute w-10 h-[60%] sm:h-[160px] rounded-b-md sm:rounded-b-lg focus:outline-none z-10 flex flex-col justify-end pb-4 items-center select-none
                  ${isActive ? 'bg-[#1a1a1a]' : 'bg-linear-to-b from-gray-900 to-[#111]'}
                `}
                style={{ 
                  left: `calc(${whiteKeyCount * 4.25}rem - 1.25rem)`,
                  transformOrigin: 'top center'
                }}
              >
                <div className={`font-semibold text-[10px] sm:text-xs transition-colors ${isActive ? 'text-teal-400' : 'text-gray-500'}`}>
                  {key.keyLabel}
                </div>
              </motion.button>
            );
          }
        })}
      </div>
    </div>
  );
}
