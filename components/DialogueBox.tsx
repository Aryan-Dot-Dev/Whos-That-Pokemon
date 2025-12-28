
import React, { useEffect, useState } from 'react';
import { CharacterIcons } from '../constants';

export type CharacterType = 'OAK' | 'DEXTER' | 'ROCKET';

interface DialogueBoxProps {
  character: CharacterType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ character, message, isVisible, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Auto-close after 5 seconds for snappy UX
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  const side = character === 'DEXTER' ? 'right' : 'left';
  const sideClass = side === 'left' ? 'left-6' : 'right-6';
  const animationClass = isVisible 
    ? (side === 'left' ? 'animate-pop-left' : 'animate-pop-right')
    : (side === 'left' ? 'animate-slide-out-left' : 'animate-slide-out-right');

  const Portrait = CharacterIcons[character];

  return (
    <>
      <style>{`
        @keyframes pop-left {
          0% { transform: translateX(-100%) scale(0.9); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes pop-right {
          0% { transform: translateX(100%) scale(0.9); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes slide-out-left {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-120%); opacity: 0; }
        }
        @keyframes slide-out-right {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        .animate-pop-left { animation: pop-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop-right { animation: pop-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-out-left { animation: slide-out-left 0.3s ease-in forwards; }
        .animate-slide-out-right { animation: slide-out-right 0.3s ease-in forwards; }
      `}</style>
      
      <div className={`fixed bottom-10 ${sideClass} z-[100] flex items-end ${side === 'right' ? 'flex-row-reverse' : 'flex-row'} p-4 pointer-events-none transition-all duration-300 ${animationClass}`}>
        {/* Character Portrait with Glow */}
        <div className="relative group shrink-0 w-32 md:w-56 h-32 md:h-56 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-600/10 rounded-full blur-3xl scale-125"></div>
          <div className="w-24 h-24 bg-white border-4 border-black rounded-full p-4 z-10 relative shadow-2xl flex items-center justify-center">
            <Portrait />
          </div>
        </div>

        {/* Comic/Pokedex Style Bubble */}
        <div className={`max-w-xs md:max-w-lg bg-white text-black p-5 md:p-8 rounded-[2rem] border-[6px] border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] relative mb-16 ${side === 'left' ? '-ml-8' : '-mr-8'} pointer-events-auto z-20`}>
          <div className={`absolute -top-5 ${side === 'left' ? 'left-10' : 'right-10'} bg-red-600 text-white px-4 py-1 text-[9px] font-black uppercase tracking-[0.3em] z-30 shadow-md`}>
            {character === 'OAK' ? 'PROF. OAK' : character === 'DEXTER' ? 'DEXTER CORE' : 'TEAM ROCKET'}
          </div>
          
          <p className="font-bold text-sm md:text-xl leading-snug italic font-sans tracking-tight">
            "{message}"
          </p>
        </div>
      </div>
    </>
  );
};

export default DialogueBox;
