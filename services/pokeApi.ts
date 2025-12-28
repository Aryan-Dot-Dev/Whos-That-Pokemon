
import { Pokemon, PokemonListItem } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Cache for basic metadata to avoid heavy initial loads
let pokemonListCache: PokemonListItem[] | null = null;

export const fetchPokemonList = async (): Promise<PokemonListItem[]> => {
  if (pokemonListCache) return pokemonListCache;
  
  const response = await fetch(`${BASE_URL}/pokemon?limit=1010`);
  const data = await response.json();
  pokemonListCache = data.results.map((p: any, index: number) => ({
    id: index + 1,
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
  }));
  return pokemonListCache || [];
};

export const fetchPokemonDetails = async (idOrName: number | string): Promise<Pokemon> => {
  const [res, speciesRes] = await Promise.all([
    fetch(`${BASE_URL}/pokemon/${idOrName}`),
    fetch(`${BASE_URL}/pokemon-species/${idOrName}`)
  ]);

  const data = await res.json();
  const speciesData = await speciesRes.json();

  const flavorText = speciesData.flavor_text_entries
    .find((entry: any) => entry.language.name === 'en')?.flavor_text || "No Pokédex entry found.";

  // Select 4 random moves from their move pool
  const allMoves = data.moves.map((m: any) => m.move.name.replace('-', ' '));
  const selectedMoves = allMoves.sort(() => 0.5 - Math.random()).slice(0, 4);

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t: any) => t.type.name),
    height: data.height,
    weight: data.weight,
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    stats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      specialAttack: data.stats[3].base_stat,
      specialDefense: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    generation: parseInt(speciesData.generation.url.split('/').filter(Boolean).pop() || '1'),
    flavorText: flavorText.replace(/\f/g, ' '),
    moves: selectedMoves,
    evolutionChainId: parseInt(speciesData.evolution_chain.url.split('/').filter(Boolean).pop() || '0'),
  };
};

export const fetchEvolutionChain = async (chainId: number): Promise<string[]> => {
  const response = await fetch(`${BASE_URL}/evolution-chain/${chainId}`);
  const data = await response.json();
  const chain: string[] = [];
  
  let current = data.chain;
  while (current) {
    chain.push(current.species.name);
    current = current.evolves_to[0];
  }
  return chain;
};
