
import React from 'react';

interface MoveMasterProps {
  moves: string[];
}

const MoveMaster: React.FC<MoveMasterProps> = ({ moves }) => {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-8">
      <div className="text-center">
        <h3 className="text-4xl font-black text-white italic drop-shadow-[4px_4px_0px_#000] mb-2 uppercase">Move Set Detected!</h3>
        <p className="text-white/60 font-bold text-xs tracking-widest uppercase">Target can perform the following techniques:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {moves.map((move, i) => (
          <div 
            key={i}
            className="bg-white border-8 border-black p-6 rounded-2xl shadow-[8px_8px_0px_#000] flex items-center gap-4 group hover:-translate-y-1 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-xs">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="text-2xl font-black italic uppercase text-black group-hover:text-[#3b4cca] transition-colors">{move}</p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-black w-[40%]" style={{ width: `${40 + (i * 15)}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="w-16 h-16 bg-[#ffcb05] border-4 border-black rounded-full flex items-center justify-center text-3xl shadow-lg animate-bounce">
        ⚔️
      </div>
    </div>
  );
};

export default MoveMaster;
