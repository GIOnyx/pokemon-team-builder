import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { fetchPokemonList, fetchPokemonDetails } from '../services/pokeApi';

const PokemonSearch = forwardRef(({ onAdd, isTeamFull }, ref) => {
  const [query, setQuery] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingPokemon, setAddingPokemon] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }));

  useEffect(() => {
    const loadPokemon = async () => {
      const list = await fetchPokemonList();
      setPokemonList(list);
      setLoading(false);
    };
    loadPokemon();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredList([]);
      return;
    }
    const filtered = pokemonList.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    setFilteredList(filtered.slice(0, 10)); // Limit to top 10 results
  }, [query, pokemonList]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (pokemonItem) => {
    if (isTeamFull) return;
    
    setAddingPokemon(pokemonItem.name);
    setShowDropdown(false);
    
    // Fetch full details
    const details = await fetchPokemonDetails(pokemonItem.name);
    if (details) {
      onAdd(details);
    }
    
    setAddingPokemon(null);
    setQuery('');
  };

  return (
    <div ref={searchContainerRef} style={{ position: 'relative', width: '75%', margin: '0 auto' }}>
      
      {/* Keypad Label / Design */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ background: 'var(--dex-grey)', color: '#111', padding: '0.2rem 1rem', border: '3px solid var(--dex-border)', fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '2px 2px 0 #000' }}>
          SEARCH
        </div>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--led-yellow)', border: '2px solid var(--dex-border)', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.4)' }} />
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={20} style={{ position: 'absolute', left: '1rem', color: '#FFF', zIndex: 2 }} />
        <input 
          className="search-input"
          ref={inputRef}
          type="text" 
          placeholder={loading ? "Loading..." : isTeamFull ? "Team Full" : "Add Pokemon"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={loading || isTeamFull}
          style={{ 
            width: '100%', 
            paddingLeft: '3rem', 
            fontSize: '1.2rem',
            background: 'var(--blue-key)',
            color: '#FFF',
            border: '4px solid var(--dex-border)',
            boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.4), inset 0 -4px 10px rgba(0,0,0,0.2), 0 4px 0 #000',
            textShadow: '1px 1px 0 #000',
            textAlign: 'center'
          }}
        />
        {addingPokemon && (
          <Loader2 size={20} style={{ position: 'absolute', right: '1rem', color: '#FFF', animation: 'spin 1s linear infinite' }} />
        )}
      </div>

      {showDropdown && filteredList.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          bottom: '100%', 
          left: 0, 
          right: 0, 
          marginBottom: '0.5rem', 
          maxHeight: '300px', 
          overflowY: 'auto', 
          zIndex: 10,
          background: 'var(--blue-key)',
          border: '4px solid var(--dex-border)',
          boxShadow: '0 -4px 0 #000',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {filteredList.map((p) => (
            <div 
              key={p.name}
              onClick={() => handleSelect(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.2)',
                color: '#FFF',
                textShadow: '1px 1px 0 #000'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)'}
            >
              <img src={p.sprite} alt={p.name} style={{ width: '40px', height: '40px', marginRight: '1rem', filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.5))' }} />
              <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{p.name}</span>
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
});

export default PokemonSearch;
