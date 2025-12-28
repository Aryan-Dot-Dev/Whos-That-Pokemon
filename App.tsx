
import React, { useState, useEffect, useRef } from 'react';
import { 
  GameMode, 
  GameSession, 
  UserStats, 
  PokemonListItem,
  Pokemon
} from './types';
import { 
  fetchPokemonList, 
  fetchPokemonDetails 
} from './services/pokeApi';
import { 
  getSmartHint, 
  getPostMatchLore, 
  getMissionBriefing, 
  getComparisonHint,
  redactFlavorText,
  getTwoTruths,
  getAkinatorQuestion
} from './services/gemini';
import GuessInput from './components/GuessInput';
import Silhouette from './components/GameModes/Silhouette';
import StatRadar from './components/GameModes/StatRadar';
import RedactedDex from './components/GameModes/RedactedDex';
import MoveMaster from './components/GameModes/MoveMaster';
import TwoTruths from './components/GameModes/TwoTruths';
import ReverseGuess from './components/GameModes/ReverseGuess';
import DialogueBox, { CharacterType } from './components/DialogueBox';
import { Icons, TYPE_COLORS, BadgeIcons, CharacterIcons } from './constants';

type AppView = 'dashboard' | 'missions' | 'pokedex' | 'profile' | 'play';

const BASE_SCORE = 1000;
const CLUE_PENALTY = 150;
const SPEED_RUN_DURATION = 60;

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [session, setSession] = useState<(GameSession & { 
    gaveUp?: boolean; 
    aiHint?: string; 
    aiLore?: string;
    missionBriefing?: string;
    badgeUrl?: string; // Still used to flag victory status, but now we use SVG
    redactedText?: string;
    twoTruths?: { statement: string; isLie: boolean }[];
    currentAkinatorQuestion?: string;
    reverseGuessHistory?: { question: string; answer: string }[];
    speedRunScore?: number;
    timeLeft?: number;
  }) | null>(null);
  
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0,
    totalScore: 0,
    highestStreak: 0,
    currentStreak: 0,
    badges: {}, // Keys are GameMode, Values are just flags
  });
  
  const [loading, setLoading] = useState(false);
  const [guessError, setGuessError] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Pokedex State
  const [pokedexSearch, setPokedexSearch] = useState('');
  const [selectedPokedexEntry, setSelectedPokedexEntry] = useState<Pokemon | null>(null);
  const [pokedexLoading, setPokedexLoading] = useState(false);

  const [activeDialogue, setActiveDialogue] = useState<{ character: CharacterType; message: string; visible: boolean }>({
    character: 'OAK',
    message: '',
    visible: false
  });

  const speedRunTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const list = await fetchPokemonList();
        setPokemonList(list);
        const savedStats = localStorage.getItem('pokeguess_stats_v3');
        if (savedStats) setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Initialization failed", e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem('pokeguess_stats_v3', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (session?.mode === GameMode.SPEED_RUN && !session.isGameOver && (session.timeLeft || 0) > 0) {
      speedRunTimerRef.current = window.setTimeout(() => {
        setSession(prev => prev ? ({ ...prev, timeLeft: (prev.timeLeft || 0) - 1 }) : null);
      }, 1000);
    } else if (session?.mode === GameMode.SPEED_RUN && session.timeLeft === 0 && !session.isGameOver) {
      handleGameOver(true);
    }
    return () => { if (speedRunTimerRef.current) clearTimeout(speedRunTimerRef.current); };
  }, [session?.timeLeft, session?.isGameOver]);

  const showDialogue = (character: CharacterType, message: string) => {
    if (view === 'play' || message.includes('CONFIRMED')) {
        setActiveDialogue({ character, message, visible: true });
    }
  };

  const startGame = async (mode: GameMode) => {
    setLoading(true);
    try {
      const randomId = Math.floor(Math.random() * 1010) + 1;
      const pokemon = await fetchPokemonDetails(randomId);
      const briefing = await getMissionBriefing(mode);
      
      let redactedText = "";
      let twoTruths: any[] = [];
      let initialQuestion = "";

      if (mode === GameMode.DEX_ENTRY) {
        redactedText = await redactFlavorText(pokemon.flavorText, pokemon.name);
      } else if (mode === GameMode.TWO_TRUTHS) {
        twoTruths = await getTwoTruths(pokemon);
      } else if (mode === GameMode.REVERSE_GUESS) {
        initialQuestion = await getAkinatorQuestion([], pokemon.name);
      }

      const newSession = {
        targetPokemon: pokemon,
        mode,
        cluesUsed: 0,
        attempts: 0,
        score: 0,
        isGameOver: false,
        startTime: Date.now(),
        missionBriefing: briefing,
        redactedText,
        twoTruths,
        currentAkinatorQuestion: initialQuestion,
        reverseGuessHistory: [],
        speedRunScore: 0,
        timeLeft: mode === GameMode.SPEED_RUN ? SPEED_RUN_DURATION : undefined
      };
      
      setSession(newSession);
      setView('play');
      setTimeout(() => {
        showDialogue('OAK', briefing);
      }, 500);
    } catch (e) {
      console.error("Failed to start game", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGameOver = async (isCorrect: boolean) => {
    if (!session) return;
    
    if (isCorrect) {
      const timeTaken = (Date.now() - session.startTime) / 1000;
      let finalScore = Math.max(100, BASE_SCORE - (session.cluesUsed * CLUE_PENALTY) - Math.floor(timeTaken));
      
      if (session.mode === GameMode.SPEED_RUN) {
        finalScore = (session.speedRunScore || 0) * 200;
      }

      setAiLoading(true);
      const lore = await getPostMatchLore(session.targetPokemon!.name);
      
      setSession(prev => prev ? ({ ...prev, isGameOver: true, score: finalScore, aiLore: lore, badgeUrl: 'unlocked' }) : null);
      
      showDialogue('DEXTER', `MATCH CONFIRMED! ${lore}`);
      
      setStats(prev => {
        const newBadges = { ...prev.badges };
        newBadges[session.mode] = 'unlocked';
        return {
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          totalScore: prev.totalScore + finalScore,
          currentStreak: prev.currentStreak + 1,
          highestStreak: Math.max(prev.highestStreak, prev.currentStreak + 1),
          badges: newBadges
        };
      });
      setAiLoading(false);
    } else {
      setSession(prev => prev ? ({ ...prev, isGameOver: true, gaveUp: true }) : null);
      setStats(prev => ({ ...prev, currentStreak: 0 }));
      showDialogue('ROCKET', `LOOSER! IT WAS ${session.targetPokemon?.name.toUpperCase()}!`);
    }
  };

  const handleGuess = async (name: string) => {
    if (!session || session.isGameOver) return;
    const isCorrect = name.toLowerCase() === session.targetPokemon?.name.toLowerCase();
    
    if (isCorrect) {
      if (session.mode === GameMode.SPEED_RUN) {
        setSession(prev => prev ? ({ ...prev, speedRunScore: (prev.speedRunScore || 0) + 1 }) : null);
        const nextId = Math.floor(Math.random() * 1010) + 1;
        const nextPoke = await fetchPokemonDetails(nextId);
        setSession(prev => prev ? ({ ...prev, targetPokemon: nextPoke }) : null);
      } else {
        handleGameOver(true);
      }
    } else {
      if (session.mode === GameMode.SPEED_RUN) return;
      setGuessError(true);
      setTimeout(() => setGuessError(false), 500);
      const comparison = await getComparisonHint(session.targetPokemon!.name, name);
      setSession(prev => prev ? ({ ...prev, attempts: prev.attempts + 1 }) : null);
      if (session.attempts >= 2) {
        showDialogue('ROCKET', `MWAHAHA! WRONG! IT'S NOT ${name.toUpperCase()}!`);
      } else {
        showDialogue('DEXTER', comparison);
      }
    }
  };

  const handleAkinatorAnswer = async (answer: string) => {
    if (!session || !session.targetPokemon || aiLoading) return;
    const newHistory = [...(session.reverseGuessHistory || []), { question: session.currentAkinatorQuestion || "", answer }];
    const lastQuestion = session.currentAkinatorQuestion?.toLowerCase() || "";
    if (answer === 'YES' && lastQuestion.includes(session.targetPokemon.name.toLowerCase())) {
      handleGameOver(true);
      return;
    }
    if (newHistory.length >= 15) {
       handleGameOver(false);
       return;
    }
    setAiLoading(true);
    const nextQ = await getAkinatorQuestion(newHistory, session.targetPokemon.name);
    setSession(prev => prev ? ({ ...prev, reverseGuessHistory: newHistory, currentAkinatorQuestion: nextQ }) : null);
    setAiLoading(false);
  };

  const useHint = async () => {
    if (!session || session.isGameOver || aiLoading || session.cluesUsed >= 5) return;
    setAiLoading(true);
    try {
      const hint = await getSmartHint(session.targetPokemon!.name, session.cluesUsed + 1);
      setSession(prev => prev ? ({ ...prev, cluesUsed: prev.cluesUsed + 1, aiHint: hint }) : null);
      showDialogue('DEXTER', hint);
    } catch (e) {
      showDialogue('DEXTER', "SIGNAL INTERFERENCE.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGiveUp = () => {
    if (!session || session.isGameOver) return;
    handleGameOver(false);
  };

  const openPokedexEntry = async (id: number) => {
    setPokedexLoading(true);
    try {
      const data = await fetchPokemonDetails(id);
      setSelectedPokedexEntry(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPokedexLoading(false);
    }
  };

  // View Components
  const Dashboard = () => (
    <div className="flex-1 flex flex-col gap-10 p-6 overflow-y-auto custom-scrollbar pb-24">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase drop-shadow-md">Command Center</h2>
        <p className="text-white/40 font-bold text-xs tracking-widest uppercase">System status: Normal • Neural Link: Active</p>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div 
          onClick={() => startGame(GameMode.SILHOUETTE)}
          className="group relative h-[400px] bg-[#3b4cca] border-8 border-black rounded-[3rem] p-10 overflow-hidden shadow-[15px_15px_0px_#000] cursor-pointer hover:scale-[1.01] transition-all"
        >
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
          <div className="relative z-10 flex flex-col h-full">
            <span className="bg-yellow-400 text-black px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest w-fit mb-4">Elite Mission</span>
            <h3 className="text-6xl font-black text-white italic leading-tight uppercase tracking-tighter mb-4">WHO'S THAT POKÉMON?</h3>
            <p className="text-blue-100 font-bold max-w-sm">The classic shadow recognition challenge. Spectral analysis of bio-signals in progress.</p>
            <div className="mt-auto flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
              DEPLOY NOW <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none translate-x-1/4 translate-y-1/4">
             <div className="w-80 h-80 border-[30px] border-white rounded-full animate-spin-slow"></div>
          </div>
        </div>

        <div 
          onClick={() => startGame(GameMode.SPEED_RUN)}
          className="group relative h-[400px] bg-red-600 border-8 border-black rounded-[3rem] p-10 overflow-hidden shadow-[15px_15px_0px_#000] cursor-pointer hover:scale-[1.01] transition-all"
        >
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 50%, #fff 50%, #fff 75%, transparent 75%, transparent)', backgroundSize: '40px 40px'}}></div>
          <div className="relative z-10 flex flex-col h-full">
            <span className="bg-white text-red-600 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest w-fit mb-4">High Voltage</span>
            <h3 className="text-6xl font-black text-white italic leading-tight uppercase tracking-tighter mb-4">60s SPEED RUN</h3>
            <p className="text-red-100 font-bold max-w-sm">Test your reaction time. Decipher as many signals as possible before the core overheats.</p>
            <div className="mt-auto flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
              ENGAGE <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
             <div className="w-64 h-64 border-[40px] border-white/40 transform rotate-45 translate-x-12 translate-y-12"></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <button onClick={() => setView('missions')} className="flex flex-col items-center justify-center p-8 bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
           <Icons.Rocket className="w-10 h-10 mb-2 text-black" />
           <span className="font-black text-black uppercase tracking-widest text-xs">Missions</span>
        </button>
        <button onClick={() => setView('pokedex')} className="flex flex-col items-center justify-center p-8 bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
           <Icons.Book className="w-10 h-10 mb-2 text-black" />
           <span className="font-black text-black uppercase tracking-widest text-xs">Pokedex</span>
        </button>
        <button onClick={() => setView('profile')} className="flex flex-col items-center justify-center p-8 bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
           <Icons.User className="w-10 h-10 mb-2 text-black" />
           <span className="font-black text-black uppercase tracking-widest text-xs">Trainer</span>
        </button>
        <div className="flex flex-col items-center justify-center p-8 bg-black/20 border-4 border-black rounded-[2rem] opacity-50 cursor-not-allowed">
           <div className="text-4xl mb-2 grayscale">🏆</div>
           <span className="font-black text-white uppercase tracking-widest text-xs leading-tight">Global<br/>(Locked)</span>
        </div>
      </section>
    </div>
  );

  const PokedexView = () => {
    const filtered = pokemonList.filter(p => p.name.toLowerCase().includes(pokedexSearch.toLowerCase()));

    return (
      <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden pb-24">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Regional Pokédex</h2>
            <p className="text-white/40 font-bold text-xs tracking-widest uppercase">Database sync complete • {pokemonList.length} Entries found</p>
          </div>
          <div className="relative w-full md:w-64">
             <input 
               type="text" 
               placeholder="SEARCH DB..."
               value={pokedexSearch}
               onChange={(e) => setPokedexSearch(e.target.value)}
               className="w-full bg-black/40 border-4 border-black rounded-xl p-3 text-white font-lcd text-xs uppercase tracking-widest focus:outline-none focus:border-[#ffcb05] transition-colors"
             />
          </div>
        </header>

        <div className="flex-1 bg-black/30 border-8 border-black rounded-[2.5rem] p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 content-start custom-scrollbar">
          {filtered.map(p => (
            <button 
              key={p.id} 
              onClick={() => openPokedexEntry(p.id)}
              className={`bg-white/5 border-2 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-[#3b4cca] hover:border-[#ffcb05] transition-all group active:scale-95 ${selectedPokedexEntry?.id === p.id ? 'bg-[#3b4cca] border-[#ffcb05]' : 'border-white/10'}`}
            >
               <span className="text-[8px] font-lcd text-white/40 group-hover:text-white">#{p.id.toString().padStart(4, '0')}</span>
               <span className="font-black text-white uppercase text-[10px] tracking-widest text-center truncate w-full">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const Profile = () => {
    const allModes = [
      { mode: GameMode.SILHOUETTE, name: "Shadow Master" },
      { mode: GameMode.SPEED_RUN, name: "Voltage Hero" },
      { mode: GameMode.MOVE_MASTER, name: "Combat Sage" },
      { mode: GameMode.REVERSE_GUESS, name: "Neural Link" },
      { mode: GameMode.TWO_TRUTHS, name: "Truth Seeker" },
      { mode: GameMode.DEX_ENTRY, name: "Historian" },
      { mode: GameMode.STAT_RADAR, name: "Stat Analyst" },
    ];

    return (
      <div className="flex-1 flex flex-col gap-10 p-6 overflow-y-auto pb-24 custom-scrollbar">
        <header className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Trainer Profile</h2>
            <p className="text-white/40 font-bold text-xs tracking-widest uppercase">Global Trainer ID: ELITE-V4-99</p>
          </div>
          <button onClick={() => setView('dashboard')} className="px-6 py-2 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest border-2 border-white/20 hover:bg-white hover:text-black transition-colors">&larr; Dashboard</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 flex flex-col gap-6">
             <div className="bg-white border-8 border-black rounded-[3rem] p-10 flex flex-col items-center text-center shadow-[10px_10px_0px_#000]">
                <div className="w-48 h-48 bg-slate-100 rounded-full border-8 border-[#3b4cca] mb-6 overflow-hidden relative p-4">
                  <CharacterIcons.OAK />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-black">Master_Red</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1 mb-6">Class S Intelligence Officer</p>
                
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border-2 border-black">
                   <div className="h-full bg-red-600 w-[60%]"></div>
                </div>
                <p className="text-[10px] font-black uppercase text-slate-500 mt-2">Rank XP: {stats.totalScore.toLocaleString()}</p>
             </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/40 p-4 border-4 border-black rounded-2xl">
                   <p className="text-white/40 font-black text-[8px] uppercase tracking-widest">Total Wins</p>
                   <p className="text-2xl font-lcd text-white">{stats.gamesPlayed}</p>
                </div>
                <div className="bg-black/40 p-4 border-4 border-black rounded-2xl">
                   <p className="text-white/40 font-black text-[8px] uppercase tracking-widest">Hot Streak</p>
                   <p className="text-2xl font-lcd text-blue-400">{stats.currentStreak}</p>
                </div>
                <div className="bg-black/40 p-4 border-4 border-black rounded-2xl">
                   <p className="text-white/40 font-black text-[8px] uppercase tracking-widest">Max Streak</p>
                   <p className="text-2xl font-lcd text-orange-400">{stats.highestStreak}</p>
                </div>
                <div className="bg-black/40 p-4 border-4 border-black rounded-2xl">
                   <p className="text-white/40 font-black text-[8px] uppercase tracking-widest">Badges</p>
                   <p className="text-2xl font-lcd text-green-400">{Object.keys(stats.badges).length}</p>
                </div>
             </div>

             <div className="bg-white/10 border-8 border-black rounded-[3rem] p-10 flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-black text-xl uppercase italic tracking-widest">Hall of Mastery</h4>
                  <span className="text-white/40 font-bold text-[10px] uppercase">Unlocked: {Object.keys(stats.badges).length}/{allModes.length}</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {allModes.map(({ mode, name }) => {
                      const BadgeComponent = BadgeIcons[mode as GameMode] || Icons.Pokeball;
                      return (
                        <div key={mode} className="flex flex-col items-center gap-3">
                           <div className={`w-24 h-24 rounded-full border-4 border-black flex items-center justify-center relative shadow-lg overflow-hidden p-4 ${stats.badges[mode] ? 'bg-white' : 'bg-black/40 grayscale opacity-20'}`}>
                              <BadgeComponent className="w-full h-full" />
                              {!stats.badges[mode] && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] font-black text-white/80">LOCKED</div>}
                           </div>
                           <p className="text-[9px] font-black text-white uppercase tracking-widest text-center leading-tight">{name}</p>
                        </div>
                      );
                   })}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const MissionsHub = () => (
    <div className="flex-1 flex flex-col gap-10 p-6 overflow-y-auto pb-24 custom-scrollbar">
      <header className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Mission Database</h2>
          <p className="text-white/40 font-bold text-xs tracking-widest uppercase">Select objective for immediate deployment</p>
        </div>
        <button onClick={() => setView('dashboard')} className="px-6 py-2 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest border-2 border-white/20 hover:bg-white hover:text-black transition-colors">&larr; Dashboard</button>
      </header>

      <div className="space-y-12">
        <section>
          <h4 className="text-[#ffde00] font-black uppercase italic tracking-[0.2em] text-sm mb-6 border-l-4 border-[#ffde00] pl-4">Tactical Operations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => startGame(GameMode.SILHOUETTE)} className="mode-card bg-[#3b4cca]">
              <div className="icon"><Icons.Shadow className="w-10 h-10" /></div>
              <div className="info">
                <h5>SHADOW SCAN</h5>
                <p>Classic recognition mode</p>
              </div>
            </button>
            <button onClick={() => startGame(GameMode.SPEED_RUN)} className="mode-card bg-red-500">
              <div className="icon"><Icons.Bolt className="w-10 h-10" /></div>
              <div className="info">
                <h5>SPEED RUN</h5>
                <p>High-stakes time trial</p>
              </div>
            </button>
            <button onClick={() => startGame(GameMode.MOVE_MASTER)} className="mode-card bg-orange-500">
              <div className="icon"><Icons.Swords className="w-10 h-10" /></div>
              <div className="info">
                <h5>MOVE MASTER</h5>
                <p>Combat capability analysis</p>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h4 className="text-blue-400 font-black uppercase italic tracking-[0.2em] text-sm mb-6 border-l-4 border-blue-400 pl-4">Cognitive Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => startGame(GameMode.REVERSE_GUESS)} className="mode-card bg-emerald-600">
              <div className="icon"><Icons.Brain className="w-10 h-10" /></div>
              <div className="info">
                <h5>NEURAL LINK</h5>
                <p>Reverse Akinator guess</p>
              </div>
            </button>
            <button onClick={() => startGame(GameMode.TWO_TRUTHS)} className="mode-card bg-purple-600">
              <div className="icon"><Icons.Truth className="w-10 h-10" /></div>
              <div className="info">
                <h5>LIE DETECTOR</h5>
                <p>Filter corrupted data</p>
              </div>
            </button>
            <button onClick={() => startGame(GameMode.DEX_ENTRY)} className="mode-card bg-sky-500">
              <div className="icon"><Icons.Scroll className="w-10 h-10" /></div>
              <div className="info">
                <h5>DEX REDACTOR</h5>
                <p>Decipher redacted logs</p>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h4 className="text-pink-400 font-black uppercase italic tracking-[0.2em] text-sm mb-6 border-l-4 border-pink-400 pl-4">Bio-Data Scan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => startGame(GameMode.STAT_RADAR)} className="mode-card bg-[#ffcb05] !text-black">
              <div className="icon"><Icons.Chart className="w-10 h-10" /></div>
              <div className="info">
                <h5>RADAR SCAN</h5>
                <p>Base stat distribution</p>
              </div>
            </button>
          </div>
        </section>
      </div>

      <style>{`
        .mode-card {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border-radius: 2rem;
          border: 6px solid black;
          box-shadow: 8px 8px 0px #000;
          text-align: left;
          transition: all 0.2s;
          color: white;
        }
        .mode-card:hover { transform: scale(1.03); }
        .mode-card .icon { font-size: 2.5rem; }
        .mode-card h5 { font-weight: 900; font-style: italic; font-size: 1.25rem; line-height: 1; margin-bottom: 0.25rem; }
        .mode-card p { opacity: 0.7; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
      `}</style>
    </div>
  );

  const PlayView = () => (
    <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start mb-12 animate-in fade-in duration-500 px-4">
      <section className="flex-1 w-full bg-white border-8 border-black rounded-[3rem] p-8 shadow-[20px_20px_0px_#000] min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
         {session?.mode === GameMode.SILHOUETTE && (
           <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
             <h2 className="text-4xl md:text-5xl font-black text-[#3b4cca] italic tracking-tighter text-center whitespace-nowrap drop-shadow-[2px_2px_0px_#ffde00]">
               WHO'S THAT POKÉMON?
             </h2>
           </div>
         )}
         
         <div className="w-full h-full flex items-center justify-center py-12">
           {(session?.mode === GameMode.SILHOUETTE || session?.mode === GameMode.SPEED_RUN) && session?.targetPokemon && (
             <Silhouette 
                pokemon={session.targetPokemon} 
                cluesUsed={session.cluesUsed} 
                revealed={session.isGameOver} 
             />
           )}
           {session?.mode === GameMode.STAT_RADAR && session.targetPokemon && (
             <StatRadar pokemon={session.targetPokemon} revealed={session.isGameOver} />
           )}
           {session?.mode === GameMode.DEX_ENTRY && session.targetPokemon && (
             <RedactedDex text={session.isGameOver ? session.targetPokemon.flavorText : (session.redactedText || "Initializing analysis...")} revealed={session.isGameOver} />
           )}
           {session?.mode === GameMode.MOVE_MASTER && session.targetPokemon && (
             <MoveMaster moves={session.targetPokemon.moves} />
           )}
           {session?.mode === GameMode.TWO_TRUTHS && session.twoTruths && (
             <TwoTruths facts={session.twoTruths} revealed={session.isGameOver} onGuess={(isLie) => handleGameOver(isLie)} />
           )}
           {session?.mode === GameMode.REVERSE_GUESS && session.targetPokemon && (
             <ReverseGuess 
               target={session.targetPokemon} 
               question={session.currentAkinatorQuestion || ""} 
               history={session.reverseGuessHistory || []} 
               onAnswer={handleAkinatorAnswer} 
               loading={aiLoading}
               gameOver={session.isGameOver}
             />
           )}
         </div>
      </section>

      <section className="w-full lg:w-96 flex flex-col gap-6">
        {!session?.isGameOver ? (
          <div className="bg-[#303030] border-8 border-black rounded-[2.5rem] p-8 flex flex-col shadow-[15px_15px_0px_#000]">
            <header className="mb-6 flex justify-between items-center">
              <div className="flex gap-2">
                 <div className="w-3 h-3 bg-red-600 rounded-full border border-black"></div>
                 <div className="w-3 h-3 bg-yellow-400 rounded-full border border-black"></div>
                 <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
              </div>
              <h2 className="text-white font-black text-[10px] uppercase tracking-widest italic">CONSOLE_IDENT_V3</h2>
            </header>
            
            <div className="space-y-6">
              <GuessInput pokemonList={pokemonList} onGuess={handleGuess} isError={guessError} disabled={aiLoading} />
              
              <div className="space-y-3">
                {session?.mode !== GameMode.SPEED_RUN && (
                  <button 
                    onClick={useHint}
                    disabled={aiLoading || session!.cluesUsed >= 5}
                    className="w-full py-5 bg-[#3b4cca] hover:bg-[#2a3a9a] text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all disabled:opacity-50 border-4 border-black shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    {aiLoading ? 'SYNCING...' : 'HINT FROM DEXTER'}
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (session?.mode === GameMode.SPEED_RUN) {
                       handleGameOver(true);
                    } else {
                       handleGiveUp();
                    }
                  }}
                  className="w-full py-2 text-white/40 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                >
                  SURRENDER MISSION
                </button>
              </div>
            </div>

            <footer className="mt-8 pt-6 border-t border-black grid grid-cols-2 gap-4">
               <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">
                    {session?.mode === GameMode.SPEED_RUN ? "STREAK" : "CLUES USED"}
                  </p>
                  <p className="text-xl font-lcd text-white">
                    {session?.mode === GameMode.SPEED_RUN ? session.speedRunScore : session?.cluesUsed} 
                    {session?.mode !== GameMode.SPEED_RUN && <span className="text-xs text-slate-600"> / 5</span>}
                  </p>
               </div>
               <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">FAILS</p>
                  <p className="text-xl font-lcd text-white">{session?.attempts}</p>
               </div>
            </footer>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-8 text-black shadow-[15px_15px_0px_#000] border-8 border-black animate-in zoom-in duration-300 flex flex-col h-full">
             <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h2 className="text-4xl font-black italic uppercase leading-none mb-1 tracking-tighter">
                    {session.gaveUp ? 'DEFEATED' : 'SUCCESS!'}
                  </h2>
                  <p className="font-black text-slate-500 uppercase tracking-widest text-[10px]">REVEALED: {session.targetPokemon?.name}</p>
                </div>
                {!session.gaveUp && (
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">SCORE</p>
                    <p className="text-4xl font-lcd text-[#dc0a2d]">{session.score}</p>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                 <div className="w-44 h-44 bg-slate-50 rounded-full flex items-center justify-center border-4 border-black shadow-xl p-6">
                    {BadgeIcons[session.mode as GameMode] ? (
                      React.createElement(BadgeIcons[session.mode as GameMode], { className: "w-full h-full" })
                    ) : (
                      <div className="text-5xl">🏅</div>
                    )}
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl border-2 border-black italic font-bold text-center leading-tight text-slate-800">
                   "{session.aiLore || "Critical bio-signature recorded in the central database."}"
                 </div>
              </div>

              <button 
                onClick={() => setView('dashboard')}
                className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-2xl hover:bg-slate-900 transition-all active:scale-95 shadow-xl italic mt-6"
              >
                NEXT MISSION
              </button>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#dc0a2d] overflow-hidden">
      {/* Universal Nav */}
      <nav className="w-full bg-black/40 backdrop-blur-xl px-6 py-4 flex justify-between items-center border-b-4 border-black z-[100] shrink-0">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="w-12 h-12 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
          <h1 className="text-white font-black italic tracking-tighter text-2xl drop-shadow-md hidden sm:block">POKEDEX_HUB</h1>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-8">
           <button onClick={() => setView('dashboard')} className={`nav-link ${view === 'dashboard' ? 'active' : ''}`}>HUB</button>
           <button onClick={() => setView('missions')} className={`nav-link ${view === 'missions' ? 'active' : ''}`}>MISSIONS</button>
           <button onClick={() => setView('pokedex')} className={`nav-link ${view === 'pokedex' ? 'active' : ''}`}>DEX</button>
           <button onClick={() => setView('profile')} className={`nav-link ${view === 'profile' ? 'active' : ''}`}>TRAINER</button>
        </div>

        <div className="hidden md:flex gap-4">
           <div className="bg-white border-4 border-black rounded-xl px-4 py-1">
              <span className="text-xl font-lcd text-black">{stats.totalScore.toLocaleString()} XP</span>
           </div>
        </div>
      </nav>

      {/* Main Render Logic */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
         <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, #fff 20px, transparent 20px)', backgroundSize: '100px 100px' }} />
         
         <div className="flex-1 overflow-y-auto w-full relative z-10 py-6">
            {view === 'dashboard' && <Dashboard />}
            {view === 'missions' && <MissionsHub />}
            {view === 'pokedex' && <PokedexView />}
            {view === 'profile' && <Profile />}
            {view === 'play' && <PlayView />}
         </div>
      </div>

      {/* Pokédex Detail Overlay (FIXED AND GLOBAL) */}
      {(selectedPokedexEntry || pokedexLoading) && (
        <div className="fixed inset-0 flex items-center justify-center z-[999] bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="absolute inset-0" onClick={() => setSelectedPokedexEntry(null)}></div>
           
           <div className="relative w-[340px] h-[640px] max-h-[90vh] bg-white border-8 border-black rounded-[3rem] shadow-[30px_30px_0px_#000] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
              <button 
                onClick={() => setSelectedPokedexEntry(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-lg hover:scale-110 transition-transform shadow-lg z-[1000] border-4 border-white"
              >✕</button>

              {pokedexLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center animate-pulse px-6">
                   <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                   <p className="font-black text-xs uppercase tracking-[0.2em] text-black">UPLOADING DATA...</p>
                </div>
              ) : selectedPokedexEntry ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                   <header className="px-6 pt-10 pb-4 text-center shrink-0 border-b-4 border-slate-100 bg-white">
                     <span className="text-[10px] font-lcd text-slate-900 font-black">REG NO: #{selectedPokedexEntry.id.toString().padStart(4, '0')}</span>
                     <h3 className="text-3xl font-black italic uppercase tracking-tighter text-black leading-none mt-1">{selectedPokedexEntry.name}</h3>
                   </header>
                   
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                      <div className="w-full aspect-square bg-slate-100 border-4 border-black rounded-[2rem] p-4 flex items-center justify-center relative shadow-inner">
                         <img src={selectedPokedexEntry.sprite} alt={selectedPokedexEntry.name} className="w-[85%] h-[85%] object-contain z-10" />
                         <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center">
                         {selectedPokedexEntry.types.map(t => (
                           <span key={t} className={`px-4 py-1 text-white font-black uppercase text-[10px] tracking-widest rounded-full border-2 border-black shadow-[3px_3px_0px_#000] ${TYPE_COLORS[t] || 'bg-slate-400'}`}>
                             {t}
                           </span>
                         ))}
                      </div>

                      <div className="bg-slate-900 p-5 rounded-2xl border-4 border-black relative shadow-lg">
                         <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full tracking-widest uppercase border-2 border-black">LORE_MODULE</div>
                         <p className="font-bold text-[13px] italic text-white leading-relaxed font-sans text-center">
                           "{selectedPokedexEntry.flavorText}"
                         </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white p-3 border-4 border-black rounded-xl shadow-[4px_4px_0px_#000]">
                           <p className="text-[9px] font-black uppercase text-slate-900 tracking-widest mb-1">HEIGHT</p>
                           <p className="font-lcd text-xl text-black font-black">{selectedPokedexEntry.height / 10}m</p>
                         </div>
                         <div className="bg-white p-3 border-4 border-black rounded-xl shadow-[4px_4px_0px_#000]">
                           <p className="text-[9px] font-black uppercase text-slate-900 tracking-widest mb-1">WEIGHT</p>
                           <p className="font-lcd text-xl text-black font-black">{selectedPokedexEntry.weight / 10}kg</p>
                         </div>
                      </div>

                      <div className="space-y-2 pb-6">
                         <p className="text-[9px] font-black uppercase text-slate-900 tracking-widest text-center">COMBAT_SIG_ANALYSIS</p>
                         <div className="w-full h-[240px] bg-slate-50 border-4 border-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                            <div className="scale-90 w-full h-full">
                               <StatRadar pokemon={selectedPokedexEntry} revealed={true} />
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="h-10 bg-black w-full flex items-center px-6 overflow-hidden shrink-0 border-t-2 border-white/10">
                      <div className="text-[8px] font-black text-white tracking-[0.4em] uppercase whitespace-nowrap animate-marquee">
                        >> AUTH_USER_VERIFIED >> ENCRYPTED_STREAM_SECURE >> CORE_DATABASE_SYNC >>
                      </div>
                   </div>
                </div>
              ) : null}
           </div>
        </div>
      )}

      {/* Global Footer Ticker */}
      <footer className="w-full bg-black border-t-4 border-black py-2 overflow-hidden whitespace-nowrap z-50 shrink-0">
         <div className="animate-marquee inline-block text-white font-lcd text-[10px] uppercase tracking-[0.4em] px-4">
            >> SYNCING REGIONAL LORE ... GLOBAL POKEDEX TAB NOW ACTIVE ... COLLECT MASTER BADGES TO PROVE YOUR RANK ... GOOD LUCK TRAINER ...
         </div>
      </footer>

      <DialogueBox 
        character={activeDialogue.character}
        message={activeDialogue.message}
        isVisible={activeDialogue.visible}
        onClose={() => setActiveDialogue(prev => ({ ...prev, visible: false }))}
      />

      <style>{`
        .nav-link {
          color: rgba(255,255,255,0.4);
          font-weight: 900;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.5rem 0;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
        }
        .nav-link:hover { color: white; }
        .nav-link.active { color: #ffde00; border-color: #ffde00; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.4); border-radius: 4px; border: 2px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.6); }

        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
