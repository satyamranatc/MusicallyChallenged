import { motion } from 'framer-motion'
import PianoKeyboard from '../components/PianoKeyboard'

export default function Piano() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full relative w-full p-0 pt-4 sm:py-12 sm:px-4 flex-1">
      <div className="text-center z-10 max-w-3xl mx-auto w-full px-4 hidden sm:block sm:mb-10 lg:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-linear-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6 tracking-tight">
          Grand Studio Synthesis
        </h1>
        <p className="text-gray-500 text-base sm:text-lg md:text-xl font-light leading-relaxed">
          Premium high-fidelity Web Audio synthesis. Explore the keys with your tap or use your <span className="text-teal-600 font-medium px-2 py-0.5 bg-teal-50 rounded-md border border-teal-100 shadow-sm">[A-Z]</span> keyboard globally.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full flex-1 flex flex-col justify-end sm:justify-center relative z-10"
      >
        <PianoKeyboard />
      </motion.div>
    </div>
  )
}
