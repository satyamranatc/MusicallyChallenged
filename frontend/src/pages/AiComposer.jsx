import { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import askAi from '../utils/askAi';
import { Sparkles, Play, Square, Loader2, Download, RefreshCcw, History, Trash2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiComposer() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('short');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [currentComposition, setCurrentComposition] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [history, setHistory] = useState([]);
  
  const synthRef = useRef(null);
  const recorderRef = useRef(null);
  const playIdRef = useRef([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_composer_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_composer_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
        A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
        A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
        A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
        A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
        A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
        A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
        A7: "A7.mp3", C8: "C8.mp3"
      },
      release: 1.5,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => setIsLoaded(true)
    });
    
    // EQ to give that 'crystal clear' bright natural sound
    const eq = new Tone.EQ3({ low: 1.0, mid: -1.0, high: 5.0 });
    const reverb = new Tone.Reverb({ decay: 5, preDelay: 0.1, wet: 0.4 }).toDestination();
    const recorder = new Tone.Recorder();
    
    sampler.chain(eq, reverb);
    reverb.connect(recorder);
    
    synthRef.current = sampler;
    recorderRef.current = recorder;

    return () => {
      sampler.dispose();
      eq.dispose();
      reverb.dispose();
      stopPlayback();
    };
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    stopPlayback(); 
    
    try {
      if (Tone.context.state !== 'running') await Tone.start();
      const result = await askAi({ prompt, duration });
      
      if (result && result.notes && result.notes.length > 0) {
        const compId = Date.now();
        result.id = compId;
        setCurrentComposition(result);
        
        const newEntry = {
          id: compId,
          prompt,
          duration,
          composition: result,
          date: new Date().toLocaleDateString()
        };
        setHistory(prev => [newEntry, ...prev]);
        
        void playComposition(result);
      } else {
        setError('Failed to generate a valid melody. Please try to elaborate the situation more!');
      }
    } catch (err) {
      setError('An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playComposition = (comp = currentComposition) => {
    return new Promise(async (resolve) => {
      if (!comp) return resolve();
      if (Tone.context.state !== 'running') await Tone.start();
      
      stopPlayback();
      setIsPlaying(true);
      
      Tone.Transport.bpm.value = comp.tempo || 120;
      const now = Tone.now() + 0.2;
      let maxTime = 0;

      comp.notes.forEach(noteObj => {
        const timeOffset = parseFloat(noteObj.time) || 0;
        const noteDuration = typeof noteObj.duration === 'string' ? parseFloat(noteObj.duration) || 0.5 : noteObj.duration || 0.5;
        const noteStr = noteObj.note || "C4";

        synthRef.current.triggerAttackRelease(noteStr, noteDuration, now + timeOffset);
        if (timeOffset + noteDuration > maxTime) maxTime = timeOffset + noteDuration;
      });

      const timeoutId = setTimeout(() => {
        setIsPlaying(false);
        resolve();
      }, (maxTime * 1000) + 2000); // 2sec release tail
      
      playIdRef.current.push(timeoutId);
    });
  };

  const stopPlayback = () => {
    synthRef.current?.releaseAll();
    playIdRef.current.forEach(id => clearTimeout(id));
    playIdRef.current = [];
    setIsPlaying(false);
  };

  const handleDownload = async () => {
    if (!currentComposition || isPlaying) return;
    setIsDownloading(true);
    if (Tone.context.state !== 'running') await Tone.start();
    
    recorderRef.current.start();
    await playComposition(currentComposition);
    
    const recording = await recorderRef.current.stop();
    const url = URL.createObjectURL(recording);
    const anchor = document.createElement("a");
    anchor.download = "ai-score-" + currentComposition.id + ".webm";
    anchor.href = url;
    anchor.click();
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  const loadHistoryItem = (item) => {
    setPrompt(item.prompt);
    setDuration(item.duration || 'short');
    setCurrentComposition(item.composition);
    stopPlayback();
    void playComposition(item.composition);
  };

  const deleteHistoryItem = (e, id) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="flex flex-col xl:flex-row w-full min-h-full relative z-0 items-start">
      
      {/* Main Composer Area */}
      <div className="flex flex-col items-center justify-start sm:justify-center flex-1 py-12 px-4 relative z-10 w-full min-h-full">
        <div className="mb-10 lg:mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-linear-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6 tracking-tight flex flex-wrap items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-teal-500" />
            AI Score Composer
          </h1>
          <p className="text-gray-500 text-base sm:text-lg md:text-xl font-light leading-relaxed">
            Describe an emotion or scene, and the AI will <span className="text-teal-600 font-medium px-2 py-0.5 bg-teal-50 rounded-md border border-teal-100 italic shadow-sm">smartly translate your imagination</span> into a crystal-clear original composition.
          </p>
        </div>

        {!isLoaded ? (
          <div className="flex flex-col items-center gap-4 mt-6 p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-md">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            <span className="text-gray-800 font-bold text-lg">Initializing Natural Acoustic Engine...</span>
            <span className="text-gray-500 text-sm">Downloading high-fidelity Salamander samples</span>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl bg-white rounded-4xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100"
          >
            <form onSubmit={handleGenerate} className="flex flex-col gap-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A lonely cowboy riding his horse through the rainy cyberpunk streets..."
                className="w-full min-h-[140px] p-5 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400 focus:bg-white transition-all resize-none text-gray-800 placeholder:text-gray-400 font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                disabled={isGenerating}
              />
              
              <div className="flex items-center gap-4">
                <label className="text-gray-500 font-bold text-sm uppercase tracking-wider">Duration</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isGenerating}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400 block w-full p-3 outline-none font-semibold transition-all cursor-pointer"
                >
                  <option value="short">Short (10 seconds)</option>
                  <option value="medium">Medium (20 seconds)</option>
                  <option value="long">Long (35+ seconds)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="mt-2 w-full py-5 bg-white text-teal-600 rounded-2xl transition-all border border-gray-200 shadow-sm hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] hover:-translate-y-1 hover:border-teal-300 font-bold text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isGenerating ? (
                  <><Loader2 className="w-6 h-6 animate-spin text-teal-500" /> Translating Imagination...</>
                ) : (
                  <><Sparkles className="w-6 h-6 text-teal-500 group-hover:scale-110 transition-transform" /> Generate & Perform</>
                )}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {currentComposition && !isGenerating && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-8"
                >
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => isPlaying ? stopPlayback() : playComposition()}
                      title={isPlaying ? "Stop Playback" : "Replay Tune"}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isPlaying 
                          ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 shadow-md' 
                          : 'bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-200 hover:scale-105 shadow-lg shadow-teal-500/20'
                      }`}
                    >
                      {isPlaying 
                        ? <Square className="fill-current w-8 h-8" /> 
                        : <RefreshCcw className="stroke-[2.5px] w-8 h-8" />
                      }
                    </button>

                    <button
                      onClick={handleDownload}
                      disabled={isDownloading || isPlaying}
                      title="Download Track (WebM)"
                      className="group relative flex items-center gap-3 w-16 h-16 hover:w-48 overflow-hidden rounded-full justify-start pl-5 transition-all duration-500 ease-out border bg-white shadow-sm hover:shadow-md text-gray-700 border-gray-200 hover:border-gray-300 disabled:text-gray-300 disabled:border-gray-100 disabled:cursor-not-allowed"
                    >
                      {isDownloading 
                        ? <Loader2 className="w-6 h-6 animate-spin text-teal-600 shrink-0" /> 
                        : <Download className="w-6 h-6 shrink-0" />
                      }
                      <span className="font-bold text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                        {isDownloading ? "RECORDING..." : "DOWNLOAD"}
                      </span>
                    </button>
                  </div>
                  
                  <div className="px-6 py-2.5 bg-gray-50 rounded-full text-xs text-gray-500 font-mono font-semibold border border-gray-200">
                    <span className="text-teal-600 font-bold">{currentComposition.tempo} BPM</span> • {currentComposition.notes.length} Notes Computed
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* History Sidebar */}
      {history.length > 0 && (
        <div className="w-full xl:w-80 bg-white/80 backdrop-blur-xl border-t xl:border-l xl:border-t-0 border-gray-200 shadow-xl z-20 flex flex-col xl:h-screen xl:sticky xl:top-0 xl:right-0">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 transition-all">
            <div className="flex items-center gap-2 font-black text-gray-800 text-lg tracking-tight">
              <History className="w-5 h-5 text-teal-500" />
              Your Catalog
            </div>
            <span className="text-xs font-bold bg-teal-50 text-teal-600 px-2.5 py-1 rounded-md">{history.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar h-[400px] xl:h-auto">
            <AnimatePresence>
              {history.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  key={item.id} 
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentComposition?.id === item.id 
                      ? 'bg-teal-50 border-teal-200 shadow-sm ring-1 ring-teal-500/20' 
                      : 'bg-white border-gray-100 hover:border-teal-200 hover:shadow-md'
                  }`}
                  onClick={() => loadHistoryItem(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-gray-400 capitalize tracking-wider">{item.date}</span>
                    <button 
                      onClick={(e) => deleteHistoryItem(e, item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-relaxed italic">"{item.prompt}"</p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-sm uppercase tracking-widest font-bold">
                      {item.duration}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-sm flex items-center gap-1 font-bold">
                      <Music className="w-3 h-3" /> {item.composition.notes.length}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Subtle Ambient Lights for Light Theme */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] z-0 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] z-0 mix-blend-multiply pointer-events-none" />
    </div>
  )
}
