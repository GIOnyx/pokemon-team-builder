import React from 'react';
import { X } from 'lucide-react';

const typeColors = {
  normal: 'var(--type-normal)',
  fire: 'var(--type-fire)',
  water: 'var(--type-water)',
  electric: 'var(--type-electric)',
  grass: 'var(--type-grass)',
  ice: 'var(--type-ice)',
  fighting: 'var(--type-fighting)',
  poison: 'var(--type-poison)',
  ground: 'var(--type-ground)',
  flying: 'var(--type-flying)',
  psychic: 'var(--type-psychic)',
  bug: 'var(--type-bug)',
  rock: 'var(--type-rock)',
  ghost: 'var(--type-ghost)',
  dragon: 'var(--type-dragon)',
  dark: 'var(--type-dark)',
  steel: 'var(--type-steel)',
  fairy: 'var(--type-fairy)',
};

const TeamGrid = ({ team, onRemove, onEmptyClick }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', width: '100%', marginBottom: '1rem' }}>
      {team.map((pokemon, index) => (
        <div 
          key={index} 
          className="animate-fade-in team-slot" 
          style={{ 
            position: 'relative', 
            height: '100px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '0.25rem',
            background: 'var(--dex-grey)',
            border: '2px solid var(--dex-dark-grey)',
            borderRadius: '6px',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
            animationDelay: `${index * 0.1}s`
          }}
        >
          {pokemon ? (
            <>
              <button 
                onClick={() => onRemove(index)}
                style={{ 
                  position: 'absolute', 
                  top: '0.15rem', 
                  right: '0.15rem', 
                  background: 'var(--dex-red)', 
                  padding: '0.15rem', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--dex-dark-grey)',
                  boxShadow: 'none'
                }}
              >
                <X size={12} color="#FFF" />
              </button>
              <img className="team-slot-sprite" src={pokemon.sprite} alt={pokemon.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              <h3 style={{ textTransform: 'uppercase', marginTop: '0.15rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{pokemon.name}</h3>
              <div style={{ display: 'flex', gap: '0.15rem', marginTop: '0.15rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {pokemon.types.map(type => (
                  <span 
                    key={type} 
                    style={{ 
                      backgroundColor: typeColors[type] || '#777', 
                      color: '#FFF',
                      fontSize: '0.55rem', 
                      padding: '0.1rem 0.2rem', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 'bold',
                      border: '1px solid var(--dex-dark-grey)',
                      textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div 
              onClick={onEmptyClick}
              style={{ opacity: 0.6, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%', height: '100%', justifyContent: 'center' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px dashed var(--dex-dark-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--dex-dark-grey)' }}>
                +
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeamGrid;
