"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Activity, LayoutTemplate, MessageSquare, Network } from 'lucide-react';

type LayoutMode = 'Linear Chat' | 'Bento Dashboard' | 'Spatial Canvas';

export default function AdaptiveSimulator() {
  const [mode, setMode] = useState<LayoutMode>('Linear Chat');
  const [status, setStatus] = useState<'Stable' | 'Morphing'>('Stable');
  const [simState, setSimState] = useState(0);

  const runSimulation = () => {
    setSimState(prev => prev + 1);
  };

  useEffect(() => {
    if (simState === 0) return;
    
    let isMounted = true;
    
    const sequence = async () => {
      setStatus('Morphing');
      setMode('Linear Chat');
      await new Promise(r => setTimeout(r, 600));
      if (!isMounted) return;
      
      setStatus('Stable');
      await new Promise(r => setTimeout(r, 2000));
      if (!isMounted) return;
      
      setStatus('Morphing');
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;
      setMode('Bento Dashboard');
      setStatus('Stable');
      
      await new Promise(r => setTimeout(r, 2500));
      if (!isMounted) return;
      
      setStatus('Morphing');
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;
      setMode('Spatial Canvas');
      setStatus('Stable');
    };

    sequence();
    return () => { isMounted = false; };
  }, [simState]);

  return (
    <div className="w-full max-w-4xl mx-auto my-12 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-sans">
      {/* Simulator Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-zinc-100 tracking-wide">Adaptive UI Simulator</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <span className="text-zinc-500">Layout Status</span>
            <span className={`px-2 py-0.5 rounded-full border ${status === 'Stable' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' : 'bg-amber-950/50 text-amber-400 border-amber-900/50 animate-pulse'}`}>
              {status}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <span className="text-zinc-500">Active Mode</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              {mode === 'Linear Chat' && <MessageSquare className="w-3 h-3" />}
              {mode === 'Bento Dashboard' && <LayoutTemplate className="w-3 h-3" />}
              {mode === 'Spatial Canvas' && <Network className="w-3 h-3" />}
              {mode}
            </span>
          </div>

          <button 
            onClick={runSimulation}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <RefreshCcw className="w-3 h-3" /> Replay
          </button>
        </div>
      </div>

      {/* Simulator Canvas */}
      <div className="h-[500px] p-6 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
        
        <AnimatePresence mode="wait">
          {mode === 'Linear Chat' && (
            <motion.div 
              key="linear"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg flex flex-col gap-4"
            >
              <div className="self-end bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm w-3/4 shadow-lg text-sm">
                Generate a multi-variable analysis of our Q3 growth metrics vs server costs.
              </div>
              <div className="self-start bg-zinc-800 text-zinc-200 p-4 rounded-2xl rounded-tl-sm w-5/6 shadow-lg text-sm">
                Analyzing dataset... I've prepared a comprehensive dashboard showing user acquisition overlaying infrastructure burn rate.
              </div>
            </motion.div>
          )}

          {mode === 'Bento Dashboard' && (
            <motion.div 
              key="bento"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }}
              className="w-full h-full grid grid-cols-3 grid-rows-2 gap-4"
            >
              <motion.div className="col-span-2 row-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
                <h3 className="text-zinc-400 text-sm font-semibold mb-4 uppercase tracking-wider">Growth vs Cost</h3>
                <div className="flex-1 flex items-end gap-2">
                  {[40, 55, 45, 70, 60, 85, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500/80 rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </motion.div>
              <motion.div className="col-span-1 row-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
                 <h3 className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Total Active</h3>
                 <div className="text-4xl font-bold text-zinc-100">1.2M</div>
                 <div className="text-emerald-500 text-xs mt-2">+14% MoM</div>
              </motion.div>
              <motion.div className="col-span-1 row-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
                 <h3 className="text-zinc-500 text-xs font-semibold mb-1 uppercase tracking-wider">Burn Rate</h3>
                 <div className="text-4xl font-bold text-zinc-100">$42k</div>
                 <div className="text-red-500 text-xs mt-2">-2.4% MoM</div>
              </motion.div>
            </motion.div>
          )}

          {mode === 'Spatial Canvas' && (
            <motion.div 
              key="spatial"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full relative"
            >
               {/* Center Node */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-700 p-4 rounded-xl shadow-2xl z-10 w-64">
                 <div className="text-sm text-zinc-200">Q3 Analysis Base</div>
                 <div className="text-xs text-zinc-500 mt-1">Root Context Node</div>
               </div>

               {/* Branch 1 */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <path d="M 450 250 C 350 250, 250 150, 150 150" fill="none" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
               </svg>
               <div className="absolute top-[150px] left-[150px] -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-blue-900/50 p-4 rounded-xl shadow-xl w-56">
                 <div className="text-sm text-blue-400 font-semibold">Cost Optimization Pivot</div>
                 <div className="text-xs text-zinc-400 mt-1 text-ellipsis overflow-hidden">What if we migrate to ARM?</div>
               </div>

               {/* Branch 2 */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <path d="M 450 250 C 350 250, 250 350, 150 350" fill="none" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
               </svg>
               <div className="absolute top-[350px] left-[150px] -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-emerald-900/50 p-4 rounded-xl shadow-xl w-56">
                 <div className="text-sm text-emerald-400 font-semibold">Marketing Spend Pivot</div>
                 <div className="text-xs text-zinc-400 mt-1 text-ellipsis overflow-hidden">Correlate with ad campaigns.</div>
               </div>

               <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-zinc-800 flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
