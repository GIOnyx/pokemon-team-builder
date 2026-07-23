import React, { useState, useRef } from 'react';
import TeamGrid from './components/TeamGrid';
import PokemonSearch from './components/PokemonSearch';
import AIChat from './components/AIChat';

function App() {
  // Initialize team with 6 null slots
  const [team, setTeam] = useState(Array(6).fill(null));
  const [isMuted, setIsMuted] = useState(false);
  const searchRef = useRef(null);

  const handleAddPokemon = (pokemon) => {
    if (pokemon.cry && !isMuted) {
      const audio = new Audio(pokemon.cry);
      audio.volume = 0.3;
      audio.play().catch(e => console.log("Audio play failed:", e));
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
      const newTeam = [...prevTeam];
      newTeam[index] = null;
      return newTeam;
    });
  };

  const handleEmptyClick = () => {
    if (searchRef.current) {
      searchRef.current.focusSearch();
    }
  };

  const isTeamFull = team.every(slot => slot !== null);

  return (
    <div className="dex-wrapper">
      
      {/* LEFT PANEL */}
      <div className="dex-left">
        
        {/* Top Header with Lenses */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'var(--dex-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '4px solid var(--dex-border)'
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #fff, var(--led-blue) 40%, #01579b 90%)',
              border: '2px solid var(--dex-border)'
            }} />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--led-red)', border: '2px solid var(--dex-border)' }} />
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--led-yellow)', border: '2px solid var(--dex-border)' }} />
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--led-green)', border: '2px solid var(--dex-border)' }} />
          </div>
        </div>

        {/* Left Screen Bezel */}
        <div className="dex-left-bezel">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--dex-red)', border: '2px solid var(--dex-border)' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--dex-red)', border: '2px solid var(--dex-border)' }} />
          </div>
          
          {/* Main Left Screen (Team Grid) */}
          <div className="dex-left-screen">
            <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#FFF', textShadow: '2px 2px 0 var(--dex-red)', textTransform: 'uppercase' }}>
              My Team
            </h2>
            <TeamGrid team={team} onRemove={handleRemovePokemon} onEmptyClick={handleEmptyClick} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--dex-red)', border: '2px solid var(--dex-border)' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '40px', height: '6px', background: 'var(--dex-border)', borderRadius: '4px' }} />
              <div style={{ width: '40px', height: '6px', background: 'var(--dex-border)', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* D-Pad and Bottom Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 1rem' }}>
          <div style={{ background: 'var(--led-green)', border: '3px solid var(--dex-border)', padding: '0.5rem 2rem', color: '#FFF', fontWeight: 'bold', textShadow: '1px 1px 0 #000' }}>
            POKÉMON
          </div>
          
          {/* Speaker Grill (Mute Toggle) */}
          <div 
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute Cries" : "Mute Cries"}
            style={{ 
              width: '90px', height: '90px', 
              background: 'var(--dex-red)', 
              border: '2px solid var(--dex-dark-red)', 
              borderRadius: '50%', 
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', opacity: isMuted ? 0.3 : 1, transition: 'opacity 0.2s' }}>
              {Array(25).fill(0).map((_, i) => {
                // Create a circular pattern by hiding corner dots
                const isCorner = [0, 4, 20, 24].includes(i);
                return (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dex-dark-grey)', boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.8)', visibility: isCorner ? 'hidden' : 'visible' }} />
                );
              })}
            </div>
            {isMuted && (
              <div style={{ position: 'absolute', width: '70%', height: '6px', background: '#d32f2f', transform: 'rotate(45deg)', border: '1px solid #b71c1c' }} />
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
        {/* Right Screen (AI Chat) */}
        <div className="dex-right-screen">
          <AIChat team={team} />
        </div>

        {/* Keypad Area (Search) */}
        <div style={{ marginTop: 'auto' }}>
          <PokemonSearch ref={searchRef} onAdd={handleAddPokemon} isTeamFull={isTeamFull} />
        </div>
      </div>
      
    </div>
  );
}

export default App;
