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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', width: '100%', marginBottom: '2rem' }}>
      {team.map((pokemon, index) => (
        <div 
          key={index} 
          className="animate-fade-in" 
          style={{ 
            position: 'relative', 
            height: '140px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '0.5rem',
            background: 'var(--dex-grey)',
            border: '3px solid var(--dex-dark-grey)',
            borderRadius: '8px',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
            animationDelay: `${index * 0.1}s`
          }}
        >
          {pokemon ? (
            <>
              <button 
                onClick={() => onRemove(index)}
                style={{ 
                  position: 'absolute', 
                  top: '0.25rem', 
                  right: '0.25rem', 
                  background: 'var(--dex-red)', 
                  padding: '0.2rem', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--dex-dark-grey)',
                  boxShadow: 'none'
                }}
              >
                <X size={14} color="#FFF" />
              </button>
              <img src={pokemon.sprite} alt={pokemon.name} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
              <h3 style={{ textTransform: 'uppercase', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#111' }}>{pokemon.name}</h3>
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {pokemon.types.map(type => (
                  <span 
                    key={type} 
                    style={{ 
                      backgroundColor: typeColors[type] || '#777', 
                      color: '#FFF',
                      fontSize: '0.6rem', 
                      padding: '0.1rem 0.3rem', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                      border: '1px solid var(--dex-dark-grey)'
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
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px dashed var(--dex-dark-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--dex-dark-grey)' }}>
                +
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dex-dark-grey)', textTransform: 'uppercase' }}>Empty Slot</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeamGrid;
