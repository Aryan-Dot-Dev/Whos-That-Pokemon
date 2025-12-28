
import React from 'react';

interface RedactedDexProps {
  text: string;
  revealed: boolean;
}

const RedactedDex: React.FC<RedactedDexProps> = ({ text, revealed }) => {
  return (
    <div className="w-full max-w-2xl bg-[#0075be] border-8 border-black rounded-[2rem] p-6 shadow-[15px_15px_0px_#000] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
      
      <div className="bg-[#1a1a1a] border-4 border-black p-8 rounded-xl min-h-[200px] flex flex-col justify-center">
        <h3 className="text-[#0075be] font-lcd text-xs mb-4 tracking-[0.3em] uppercase opacity-70">Pokedex_Data_Stream</h3>
        <p className="text-white font-bold text-xl md:text-2xl leading-relaxed italic">
          "{text}"
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center px-2">
        <div className="flex gap-2">
           <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-black"></div>
           <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-black"></div>
           <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-black"></div>
        </div>
        <div className="text-white font-black text-[10px] tracking-widest uppercase opacity-40">Entry_Encrypted_v2</div>
      </div>
    </div>
  );
};

export default RedactedDex;
