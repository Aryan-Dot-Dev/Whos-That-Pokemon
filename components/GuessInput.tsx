
import React, { useState, useEffect, useRef } from 'react';
import { PokemonListItem } from '../types';

interface GuessInputProps {
  pokemonList: PokemonListItem[];
  onGuess: (name: string) => void;
  disabled?: boolean;
  isError?: boolean;
}

const GuessInput: React.FC<GuessInputProps> = ({ pokemonList, onGuess, disabled, isError }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PokemonListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = pokemonList
        .filter(p => p.name.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, pokemonList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query) {
      onGuess(query.trim());
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative w-full ${isError ? 'animate-shake' : ''}`} ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ENTER SUBJECT NAME..."
          disabled={disabled}
          className="relative w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl text-lg font-lcd tracking-wider focus:outline-none focus:border-red-600 transition-all placeholder-slate-800 shadow-inner text-white uppercase"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-md"
        >
          SCAN
        </button>
      </form>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-slate-900 border border-red-600 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {suggestions.map((p) => (
            <li
              key={p.id}
              onClick={() => {
                onGuess(p.name);
                setQuery('');
                setIsOpen(false);
              }}
              className="px-5 py-3 hover:bg-red-600/10 cursor-pointer transition-colors border-b border-slate-800 last:border-none group flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="font-lcd text-slate-600 text-[8px]">#{p.id.toString().padStart(4, '0')}</span>
                <span className="ml-3 font-black text-white text-sm uppercase tracking-widest group-hover:text-red-500 transition-colors">{p.name}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-red-500"></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GuessInput;
