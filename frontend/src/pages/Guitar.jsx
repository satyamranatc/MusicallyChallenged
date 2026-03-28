import GuitarFretboard from '../components/GuitarFretboard';
import * as Tone from 'tone';
import { Activity } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Guitar() {
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  const startAudio = async () => {
    await Tone.start();
    setIsAudioStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 relative">
      <div className="mb-10 lg:mb-16 text-center z-10 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-linear-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6 tracking-tight">
          Acoustic Simulator
        </h1>
        <p className="text-gray-500 text-base sm:text-lg md:text-xl font-light leading-relaxed">
          Interactive string synthesis. Select a chord progression and <span className="text-teal-600 font-medium px-2 py-0.5 bg-teal-50 rounded-md border border-teal-100 italic shadow-sm">swipe your mouse</span> across the strings to strum like a real guitar.
        </p>
      </div>

      {!isAudioStarted ? (
        <motion.button 
          onClick={startAudio}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="group relative flex items-center gap-3 sm:gap-4 px-8 sm:px-10 py-4 sm:py-5 bg-white text-teal-600 rounded-2xl transition-all border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] hover:border-teal-200 z-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Activity className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-lg sm:text-xl font-bold tracking-wider uppercase relative z-10">Initialize Engine</span>
        </motion.button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-full relative z-10"
        >
          <GuitarFretboard />
        </motion.div>
      )}
    </div>
  )
}
