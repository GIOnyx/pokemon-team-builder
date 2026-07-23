const POKE_API_BASE = 'https://pokeapi.co/api/v2';

const getMegaStone = (name) => {
  if (!name.includes('-mega')) return null;
  if (name === 'rayquaza-mega') return null; // Rayquaza doesn't use a Mega Stone
  const parts = name.split('-');
  const base = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  if (base === 'Charizard' && parts[2] === 'x') return 'Charizardite X';
  if (base === 'Charizard' && parts[2] === 'y') return 'Charizardite Y';
  if (base === 'Mewtwo' && parts[2] === 'x') return 'Mewtwonite X';
  if (base === 'Mewtwo' && parts[2] === 'y') return 'Mewtwonite Y';
  if (base === 'Abomasnow') return 'Abomasite';
  if (base === 'Houndoom') return 'Houndoominite';
  if (base === 'Banette') return 'Banettite';
  return base + 'ite';
};

// Fetch the list of all pokemon for search
export const fetchPokemonList = async () => {
  try {
    const response = await fetch(`${POKE_API_BASE}/pokemon?limit=1500`);
    const data = await response.json();
    return data.results
      .filter((p, index) => index < 1025 || p.name.includes('-mega'))
      .map(p => {
        const id = p.url.split('/').filter(Boolean).pop();
        return {
          id: id,
          name: p.name,
          url: p.url,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        };
      });
  } catch (error) {
    console.error("Error fetching pokemon list:", error);
    return [];
  }
};

// Fetch specific details for a pokemon
export const fetchPokemonDetails = async (idOrName) => {
  try {
    const response = await fetch(`${POKE_API_BASE}/pokemon/${idOrName}`);
    const data = await response.json();
    const isMega = data.name.includes('-mega');
    return {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      sprite: data.sprites.front_default || data.sprites.other['official-artwork'].front_default,
      cry: data.cries?.latest || data.cries?.legacy || null,
      held_item: getMegaStone(data.name),
      isLockedMega: isMega,
      stats: data.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error(`Error fetching details for ${idOrName}:`, error);
    return null;
  }
};
