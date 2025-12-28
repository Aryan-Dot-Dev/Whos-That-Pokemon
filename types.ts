
export enum GameMode {
  SILHOUETTE = 'SILHOUETTE',
  DEX_ENTRY = 'DEX_ENTRY',
  TYPE_DEDUCTION = 'TYPE_DEDUCTION',
  STAT_RADAR = 'STAT_RADAR',
  EVOLUTION_MYSTERY = 'EVOLUTION_MYSTERY',
  MOVE_MASTER = 'MOVE_MASTER',
  TWO_TRUTHS = 'TWO_TRUTHS',
  REVERSE_GUESS = 'REVERSE_GUESS',
  SPEED_RUN = 'SPEED_RUN'
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  sprite: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  generation: number;
  flavorText: string;
  moves: string[];
  evolutionChainId?: number;
}

export interface GameSession {
  targetPokemon: Pokemon | null;
  mode: GameMode;
  cluesUsed: number;
  attempts: number;
  score: number;
  isGameOver: boolean;
  startTime: number;
  // Mode specific extras
  timeLeft?: number;
  speedRunScore?: number;
  reverseGuessHistory?: { question: string; answer: string }[];
  currentAkinatorQuestion?: string;
  twoTruths?: { statement: string; isLie: boolean }[];
}

export interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  highestStreak: number;
  currentStreak: number;
  lastDailyDate?: string;
  badges: Record<string, string>; // Maps GameMode to a base64/URL badge image
}

export interface PokemonListItem {
  id: number;
  name: string;
}
