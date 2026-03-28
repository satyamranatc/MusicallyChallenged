import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GuitarFretboard from '../components/GuitarFretboard';

export default function Guitar() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-8 relative w-full overflow-hidden">
      <div className="mb-10 lg:mb-16 text-center z-10 max-w-2xl mx-auto">
        <h1 className="flex items-center justify-center gap-3 text-4xl sm:text-5xl md:text-6xl font-black bg-linear-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 tracking-tight">
          Acoustic Simulator
        </h1>
        <p className="text-gray-500 text-base sm:text-lg font-light leading-relaxed">
          Realistic physical modeling string emulation. Strum through the chords.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl relative z-10"
      >
        <GuitarFretboard />
      </motion.div>
    </div>
  );
}
