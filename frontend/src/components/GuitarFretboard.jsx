import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

const CHORDS = {
  'C Major': [null, 'C3', 'E3', 'G3', 'C4', 'E4'],
  'G Major': ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  'A Minor': [null, 'A2', 'E3', 'A3', 'C4', 'E4'],
  'E Minor': ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  'F Major': ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  'D Major': [null, null, 'D3', 'A3', 'D4', 'F#4'],
};

export default function GuitarFretboard() {
  const [activeChord, setActiveChord] = useState('C Major');
  const [vibratingStrings, setVibratingStrings] = useState({});
  const synths = useRef([]);

  useEffect(() => {
    // Reverb for spatial acoustic feel
    const reverb = new Tone.Reverb({ decay: 3, preDelay: 0.05, wet: 0.4 }).toDestination();
    // Chorus adds thickness and "string-like" chorusing
    const chorus = new Tone.Chorus(4, 2.5, 0.4).connect(reverb).start();
    
    // Create an array of PluckSynths to allow overlapping strings without stealing voices
    synths.current = Array.from({ length: 6 }).map(() => {
      const synth = new Tone.PluckSynth({
        attackNoise: 1.5,
        dampening: 5000,
        resonance: 0.96, // Controls how long the string rings
      }).connect(chorus);
      return synth;
    });

    return () => {
      synths.current.forEach(s => s.dispose());
      reverb.dispose();
      chorus.dispose();
    };
  }, []);

  const playString = async (stringIndex, note) => {
    if (!note) return; // String is muted for this chord
    if (Tone.context.state !== 'running') await Tone.start();
    
    // Trigger the note
    synths.current[stringIndex].triggerAttack(note, Tone.now());
    
    // Visual feedback
    setVibratingStrings(prev => ({ ...prev, [stringIndex]: true }));
    setTimeout(() => {
      setVibratingStrings(prev => ({ ...prev, [stringIndex]: false }));
    }, 400); // Stop vibrating after 400ms visually
  };

  const strumChord = async () => {
    if (Tone.context.state !== 'running') await Tone.start();
    const notes = CHORDS[activeChord];
    let delay = 0;
    
    // Strumming effect: play strings rapidly in sequence
    notes.forEach((note, index) => {
      if (note) {
        setTimeout(() => {
          playString(index, note);
        }, delay * 1000);
        delay += 0.045; // 45ms sweep between strings
      }
    });
  };

  // 0 is Low E (String 6) and 5 is High E (String 1)
  // Reversing for visual layout Top -> Bottom (High E -> Low E)
  const visualStrings = [5, 4, 3, 2, 1, 0];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
      {/* Chord Progression Selector */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 lg:mb-16">
        {Object.keys(CHORDS).map(chord => (
          <button
            key={chord}
            onClick={() => setActiveChord(chord)}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border shadow-sm ${
              activeChord === chord
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 border-teal-500 scale-105'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
            }`}
          >
            {chord}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-stretch">
        {/* Strum Action Block */}
        <div className="w-full lg:w-40 flex flex-col justify-center gap-4 shrink-0">
          <button
            onClick={strumChord}
            className="w-full py-10 lg:py-24 bg-linear-to-b from-gray-900 to-gray-800 rounded-3xl lg:rounded-4xl text-white font-black text-2xl tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_50px_rgba(20,184,166,0.3)] hover:scale-[1.03] active:scale-[0.97] transition-all border border-gray-700 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -inset-1 bg-linear-to-r from-teal-500/20 to-emerald-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] transform lg:rotate-180 relative z-10">
              STRUM
            </span>
          </button>
          <div className="text-center text-sm text-gray-400 font-semibold tracking-wide uppercase">Auto-Play</div>
        </div>

        {/* Fretboard & Soundhole UI */}
        <div className="relative flex-1 w-full bg-[#20150f] rounded-[2.5rem] p-8 sm:p-14 shadow-[inset_0_30px_60px_rgba(0,0,0,0.8),0_20px_40px_rgba(0,0,0,0.08)] border-2 border-[#453120] overflow-hidden group/board">
          {/* Wood grain ambient gradient */}
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#5e3820] via-[#20150f] to-black pointer-events-none transition-opacity duration-700 group-hover/board:opacity-80"></div>
          
          {/* Acoustic Sound Hole */}
          <div className="absolute right-[10%] lg:right-[15%] top-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-black shadow-[inset_0_15px_30px_rgba(0,0,0,0.95)] border-[6px] border-[#422e1e] pointer-events-none flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#6d4c41] m-3"></div>
            <div className="absolute inset-0 rounded-full border border-[#8d6e63] m-6 opacity-40"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-between h-64 sm:h-96 w-full py-2">
            {visualStrings.map((stringIndex) => {
              const note = CHORDS[activeChord][stringIndex];
              const isVibrating = vibratingStrings[stringIndex];
              const stringThickness = 1 + (5 - stringIndex) * 0.9; // Dynamic thickness based on string gauge

              return (
                <div key={stringIndex} className="relative w-full flex items-center h-8 sm:h-12 group/string">
                  {/* Invisible Hit Area (Hover to play) */}
                  <div 
                    className="absolute inset-0 w-full cursor-crosshair z-20"
                    onMouseEnter={() => playString(stringIndex, note)}
                  />
                  
                  {/* Note Label */}
                  <div className="absolute -left-4 sm:-left-8 lg:-left-12 w-8 sm:w-10 text-center text-[10px] sm:text-sm font-bold text-gray-400 opacity-20 group-hover/board:opacity-100 transition-opacity">
                    {note ? note : <span className="text-red-400">X</span>}
                  </div>
                  
                  {/* Visual String */}
                  <motion.div
                    animate={
                      isVibrating 
                        ? { y: [0, -3, 4, -2, 2, -1, 1, 0] }
                        : { y: 0 }
                    }
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`w-full shadow-[0_4px_6px_rgba(0,0,0,0.8)] rounded-full transition-all duration-300 ${!note ? 'bg-gray-600 opacity-30 shadow-none' : 'bg-linear-to-b from-gray-200 via-gray-100 to-gray-400 opacity-90 group-hover/string:brightness-125 group-hover/string:shadow-[0_0_10px_rgba(255,255,255,0.3)]'}`}
                    style={{ height: `${stringThickness}px` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
