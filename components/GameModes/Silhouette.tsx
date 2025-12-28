
import React from 'react';
import { Pokemon } from '../../types';

interface SilhouetteProps {
  pokemon: Pokemon;
  cluesUsed: number;
  revealed: boolean;
}

const Silhouette: React.FC<SilhouetteProps> = ({ pokemon, cluesUsed, revealed }) => {
  const brightness = revealed ? 100 : Math.min(cluesUsed * 8, 30);
  const contrast = revealed ? 100 : Math.min(cluesUsed * 15, 40);
  const grayscale = revealed ? 0 : 100;
  const blur = revealed ? 0 : Math.max(0, 15 - cluesUsed * 3);
  const scale = revealed ? 'scale-110' : 'scale-100';

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-lg min-h-0">
      {/* Classic Yellow Circle Background Area */}
      <div className="relative w-full aspect-square md:w-[450px] md:h-[450px] bg-[#ffde00] border-8 border-black rounded-[3rem] flex items-center justify-center shadow-2xl overflow-hidden group">
        
        {/* Animated Blue Dashed Circles Ritual Pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[85%] h-[85%] border-8 border-dashed border-[#3b4cca]/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute w-[60%] h-[60%] border-8 border-dashed border-[#3b4cca]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            <div className="absolute w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#3b4cca 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        </div>
        
        <img
          src={pokemon.sprite}
          alt="Bio-Signal"
          className={`w-[75%] h-[75%] object-contain transition-all duration-1000 select-none pointer-events-none z-10 ${scale}`}
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) blur(${blur}px) ${revealed ? 'drop-shadow(0 0 25px rgba(255,255,255,0.8))' : ''}`,
          }}
        />

        {revealed && (
            <div className="absolute inset-0 bg-white animate-[flash_0.6s_ease-out_forwards] z-20 pointer-events-none"></div>
        )}
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-4 w-full px-4 shrink-0">
        <div className={`p-4 bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] transition-all duration-700 ${cluesUsed >= 2 || revealed ? 'opacity-100' : 'opacity-40 grayscale'}`}>
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">SPECTRAL TYPE</p>
          <div className="flex flex-wrap gap-2">
            {(cluesUsed >= 2 || revealed) ? pokemon.types.map(t => (
              <span key={t} className="text-white font-black text-[10px] uppercase tracking-tighter bg-[#3b4cca] px-3 py-1 rounded-full border-2 border-black">{t}</span>
            )) : <span className="text-slate-400 font-lcd text-[10px] tracking-widest">UNKNOWN</span>}
          </div>
        </div>
        <div className={`p-4 bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] transition-all duration-700 ${cluesUsed >= 3 || revealed ? 'opacity-100' : 'opacity-40 grayscale'}`}>
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">ORIGIN LOG</p>
          <div className="flex gap-2">
            {(cluesUsed >= 3 || revealed) ? (
              <span className="text-black font-black text-[10px] bg-[#ffde00] px-3 py-1 rounded-full border-2 border-black">GEN {pokemon.generation}</span>
            ) : <span className="text-slate-400 font-lcd text-[10px] tracking-widest">LOCKED</span>}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flash {
            0% { opacity: 0.9; }
            100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Silhouette;
