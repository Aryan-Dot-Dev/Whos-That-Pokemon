
import React from 'react';
import { Pokemon } from '../../types';

interface ReverseGuessProps {
  target: Pokemon;
  question: string;
  history: { question: string; answer: string }[];
  onAnswer: (answer: string) => void;
  loading: boolean;
  gameOver: boolean;
}

const ReverseGuess: React.FC<ReverseGuessProps> = ({ target, question, history, onAnswer, loading, gameOver }) => {
  return (
    <div className="w-full max-w-3xl flex flex-col lg:flex-row gap-8 items-start">
      {/* Secret Identity Card */}
      <div className="w-full lg:w-64 shrink-0 bg-[#3b4cca] border-8 border-black rounded-[2rem] p-6 shadow-[10px_10px_0px_#000] flex flex-col items-center">
        <span className="text-white font-black text-[9px] uppercase tracking-widest mb-4 opacity-70">YOUR SECRET IDENTITY</span>
        <div className="w-32 h-32 bg-white rounded-2xl border-4 border-black mb-4 p-2">
           <img src={target.sprite} alt="Identity" className="w-full h-full object-contain" />
        </div>
        <h4 className="text-white font-black text-2xl italic tracking-tighter uppercase drop-shadow-[2px_2px_0px_#000]">{target.name}</h4>
        <div className="mt-4 flex flex-wrap gap-1 justify-center">
          {target.types.map(t => (
            <span key={t} className="px-2 py-0.5 bg-black text-white text-[8px] font-black rounded-full uppercase">{t}</span>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 w-full flex flex-col gap-4">
        <div className="bg-slate-100 border-8 border-black rounded-[2rem] p-6 h-[400px] overflow-y-auto flex flex-col gap-4 shadow-inner">
           {history.map((h, i) => (
             <div key={i} className="flex flex-col gap-2">
                <div className="self-start max-w-[80%] bg-[#ffde00] border-4 border-black p-3 rounded-2xl rounded-tl-none font-bold text-sm italic">
                  DEXTER: {h.question}
                </div>
                <div className="self-end max-w-[80%] bg-black text-white p-3 rounded-2xl rounded-tr-none font-black text-xs uppercase tracking-widest">
                  YOU: {h.answer}
                </div>
             </div>
           ))}
           
           {!gameOver && (
             <div className="self-start max-w-[80%] bg-[#ffde00] border-4 border-black p-4 rounded-2xl rounded-tl-none font-bold text-lg italic shadow-md animate-in slide-in-from-left-4 duration-300">
                {loading ? "ANALYZING BIOSIGNALS..." : `DEXTER: ${question}`}
             </div>
           )}
           
           {gameOver && (
              <div className="self-start w-full bg-green-500 border-4 border-black p-4 rounded-2xl font-black text-center text-white uppercase tracking-tighter text-2xl">
                 SESSION COMPLETE!
              </div>
           )}
        </div>

        {!gameOver && (
          <div className="grid grid-cols-3 gap-2">
            {['YES', 'NO', 'UNSURE'].map(ans => (
              <button
                key={ans}
                disabled={loading}
                onClick={() => onAnswer(ans)}
                className="py-4 bg-black text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#3b4cca] transition-all active:scale-95 disabled:opacity-50"
              >
                {ans}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReverseGuess;
