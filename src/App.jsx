import React, { useState, useRef } from 'react';
import TeamGrid from './components/TeamGrid';
import TeamRadar from './components/TeamRadar';
import TypeMatrix from './components/TypeMatrix';
import PokemonSearch from './components/PokemonSearch';
import AIChat from './components/AIChat';
import { fetchPokemonDetails } from './services/pokeApi';

function App() {
  // Initialize team with 6 null slots
  const [team, setTeam] = useState(Array(6).fill(null));
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredPokemon, setHoveredPokemon] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const searchRef = useRef(null);

  const handleAddPokemon = (pokemon) => {
    if (pokemon.cry && !isMuted) {
      const cryAudio = new Audio(pokemon.cry);
      cryAudio.volume = 0.3;
      
      const bgMusic = document.getElementById('bg-music');
      if (bgMusic) {
        // Fade out
        bgMusic.volume = 0.1;
      }

      cryAudio.onended = () => {
        if (bgMusic) {
          // Fade back in
          bgMusic.volume = 0.5;
        }
      };

      cryAudio.play().catch(e => console.log("Audio play failed:", e));
    }

    setTeam(prevTeam => {
      const newTeam = [...prevTeam];
      const emptySlotIndex = newTeam.findIndex(slot => slot === null);
      if (emptySlotIndex !== -1) {
        newTeam[emptySlotIndex] = pokemon;
      }
      return newTeam;
    });
  };

  const handleRemovePokemon = (index) => {
    setTeam(prevTeam => {
      const removed = prevTeam[index];
      if (selectedPokemon === removed) setSelectedPokemon(null);
      if (hoveredPokemon === removed) setHoveredPokemon(null);
      const filtered = prevTeam.filter((p, i) => p !== null && i !== index);
      while (filtered.length < 6) {
        filtered.push(null);
      }
      return filtered;
    });
  };

  const handleEmptyClick = () => {
    if (searchRef.current) {
      searchRef.current.focusSearch();
    }
  };

  const isTeamFull = team.every(slot => slot !== null);

  const handleRandomPokemon = async () => {
    if (isTeamFull) return;
    const randomId = Math.floor(Math.random() * 898) + 1; 
    const details = await fetchPokemonDetails(randomId.toString());
    if (details) {
      handleAddPokemon(details);
    }
  };

  return (
    <div className="dex-wrapper">
      
      {/* LEFT PANEL */}
      <div className="dex-left">
        
        {/* Top Header with Lenses */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', 
            background: 'var(--dex-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid var(--dex-border)'
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #fff, var(--led-blue) 40%, #01579b 90%)',
              border: '2px solid var(--dex-border)'
            }} />
          </div>
          
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--led-red)', border: '2px solid var(--dex-border)' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--led-yellow)', border: '2px solid var(--dex-border)' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--led-green)', border: '2px solid var(--dex-border)' }} />
          </div>
        </div>

        {/* Left Screen Bezel */}
        <div className="dex-left-bezel">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dex-red)', border: '2px solid var(--dex-border)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dex-red)', border: '2px solid var(--dex-border)' }} />
          </div>
          
          {/* Main Left Screen (Team Grid) */}
          <div className="dex-left-screen">
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#FFF', textShadow: '2px 2px 0 var(--dex-red)', textTransform: 'uppercase' }}>
              My Team
            </h2>
            <TeamGrid 
              team={team} 
              onRemove={handleRemovePokemon} 
              onEmptyClick={handleEmptyClick}
              onHover={setHoveredPokemon}
              onClick={(p) => setSelectedPokemon(prev => prev === p ? null : p)}
              selectedPokemon={selectedPokemon}
            />
          </div>
          
          {/* Analytics Modules in Separate Screens */}
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem', flex: 1, minHeight: 0 }}>
            <div className="dex-analytics-screen">
              <TeamRadar team={selectedPokemon || hoveredPokemon ? [selectedPokemon || hoveredPokemon] : team} />
            </div>
            <div className="dex-analytics-screen">
              <TypeMatrix team={selectedPokemon || hoveredPokemon ? [selectedPokemon || hoveredPokemon] : team} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--dex-red)', border: '2px solid var(--dex-border)' }} />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <div style={{ width: '30px', height: '4px', background: 'var(--dex-border)', borderRadius: '4px' }} />
              <div style={{ width: '30px', height: '4px', background: 'var(--dex-border)', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* D-Pad and Bottom Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', padding: '0 0.5rem' }}>
          <div 
            onClick={handleRandomPokemon}
            title={isTeamFull ? "Team is full!" : "Surprise Me!"}
            style={{ 
              background: 'var(--led-green)', 
              border: '2px solid var(--dex-border)', 
              padding: '0.4rem 2rem', 
              color: '#FFF', 
              fontWeight: 'bold', 
              fontSize: '1rem', 
              textShadow: '1px 1px 0 #000',
              cursor: isTeamFull ? 'not-allowed' : 'pointer',
              opacity: isTeamFull ? 0.7 : 1,
              boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.4), 2px 2px 0 rgba(0,0,0,0.3)',
              userSelect: 'none'
            }}
            onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,0.6), 0 0 0 rgba(0,0,0,0)'}
            onMouseUp={(e) => e.currentTarget.style.boxShadow = 'inset -2px -2px 4px rgba(0,0,0,0.4), 2px 2px 0 rgba(0,0,0,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'inset -2px -2px 4px rgba(0,0,0,0.4), 2px 2px 0 rgba(0,0,0,0.3)'}
          >
            RANDOM
          </div>
          
          {/* Speaker Grill (Mute Toggle) */}
          <div 
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute Cries" : "Mute Cries"}
            style={{ 
              width: '60px', height: '60px', 
              background: 'var(--dex-red)', 
              border: '2px solid var(--dex-dark-red)', 
              borderRadius: '50%', 
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', opacity: isMuted ? 0.3 : 1, transition: 'opacity 0.2s' }}>
              {Array(25).fill(0).map((_, i) => {
                const isCorner = [0, 4, 20, 24].includes(i);
                return (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--dex-dark-grey)', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8)', visibility: isCorner ? 'hidden' : 'visible' }} />
                );
              })}
            </div>
            {isMuted && (
              <div style={{ position: 'absolute', width: '70%', height: '4px', background: '#d32f2f', transform: 'rotate(45deg)', border: '1px solid #b71c1c' }} />
            )}
          </div>
        </div>
      </div>

      {/* CENTRAL HINGE */}
      <div className="dex-hinge">
        <div className="dex-hinge-line" />
        <div className="dex-hinge-line" />
        <div className="dex-hinge-line" />
      </div>

      {/* RIGHT PANEL */}
      <div className="dex-right">
        <div className="dex-right-bezel">
          {/* Right Screen (AI Chat) */}
          <div className="dex-right-screen">
            <AIChat team={team} />
          </div>
        </div>

        {/* Keypad Area (Search) */}
        <div style={{ 
          marginTop: '1.5rem', 
          marginBottom: '1rem'
        }}>
          <PokemonSearch ref={searchRef} onAdd={handleAddPokemon} isTeamFull={isTeamFull} />
        </div>
      </div>
      
    </div>
  );
}

export default App;
