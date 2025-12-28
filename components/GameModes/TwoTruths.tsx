
import React from 'react';

interface TwoTruthsProps {
  facts: { statement: string; isLie: boolean }[];
  onGuess: (isLie: boolean) => void;
  revealed: boolean;
}

const TwoTruths: React.FC<TwoTruthsProps> = ({ facts, onGuess, revealed }) => {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <div className="text-center mb-4">
        <h3 className="text-3xl md:text-4xl font-black text-[#3b4cca] italic drop-shadow-[2px_2px_0px_#ffde00] uppercase">FIND THE LIE!</h3>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">DEXTER'S DATABASE IS COMPROMISED. POINT OUT THE ERROR.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {facts.map((f, i) => (
          <button
            key={i}
            disabled={revealed}
            onClick={() => onGuess(f.isLie)}
            className={`p-6 border-8 border-black rounded-[1.5rem] shadow-[8px_8px_0px_#000] text-left transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-y-1 ${
              revealed 
                ? (f.isLie ? 'bg-red-500 text-white' : 'bg-green-500 text-white opacity-50')
                : 'bg-white text-black hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black">{i + 1}</span>
              <p className="text-lg md:text-xl font-bold italic">"{f.statement}"</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TwoTruths;
