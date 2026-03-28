import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PianoKeyboard from '../components/PianoKeyboard';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function Piano() {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFs = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          try {
            if (screen.orientation && screen.orientation.lock) {
              await screen.orientation.lock('landscape');
            }
          } catch(e) {
            console.warn("Orientation lock not supported:", e);
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          try {
            if (screen.orientation && screen.orientation.unlock) {
              screen.orientation.unlock();
            }
          } catch(e) {}
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full relative w-full p-0 sm:pt-4 sm:py-12 sm:px-4 flex-1">
      <div className="text-center z-10 max-w-3xl mx-auto w-full px-4 hidden sm:block sm:mb-10 lg:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-linear-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6 tracking-tight">
          Grand Studio Synthesis
        </h1>
        <p className="text-gray-500 text-base sm:text-lg md:text-xl font-light leading-relaxed">
          Premium high-fidelity Web Audio synthesis. Explore the keys with your tap or use your <span className="text-teal-600 font-medium px-2 py-0.5 bg-teal-50 rounded-md border border-teal-100 shadow-sm">[A-Z]</span> keyboard globally.
        </p>
      </div>

      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`w-full flex-1 flex flex-col justify-end sm:justify-center relative z-10 ${isFullscreen ? 'bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]' : ''}`}
      >
        <button 
          onClick={toggleFs} 
          className="absolute top-4 right-4 z-50 p-2.5 sm:p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 text-gray-700 hover:text-teal-600 hover:scale-110 active:scale-95 transition-all sm:hidden"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Piano"}
        >
          {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
        </button>
        <PianoKeyboard />
      </motion.div>
    </div>
  )
}
