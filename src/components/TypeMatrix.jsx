import React, { useMemo, useState } from 'react';
import { TYPES, getDefensiveMultiplier, TYPE_MATCHUPS } from '../utils/typeMatchups';

const typeColors = {
  normal: 'var(--type-normal)', fire: 'var(--type-fire)', water: 'var(--type-water)',
  electric: 'var(--type-electric)', grass: 'var(--type-grass)', ice: 'var(--type-ice)',
  fighting: 'var(--type-fighting)', poison: 'var(--type-poison)', ground: 'var(--type-ground)',
  flying: 'var(--type-flying)', psychic: 'var(--type-psychic)', bug: 'var(--type-bug)',
  rock: 'var(--type-rock)', ghost: 'var(--type-ghost)', dragon: 'var(--type-dragon)',
  dark: 'var(--type-dark)', steel: 'var(--type-steel)', fairy: 'var(--type-fairy)',
};

const TypeMatrix = ({ team }) => {
  const [mode, setMode] = useState('defensive');

  const defensiveData = useMemo(() => {
    const activePokemon = team.filter(p => p !== null);
    
    return TYPES.map(attackType => {
      let weaknesses = 0;
      let resistances = 0;
      let immunities = 0;

      activePokemon.forEach(p => {
        const mult = getDefensiveMultiplier(attackType, p.types);
        if (mult > 1) weaknesses++;
        else if (mult === 0) immunities++;
        else if (mult < 1) resistances++;
      });

      return { type: attackType, weaknesses, resistances, immunities };
    });
  }, [team]);

  const offensiveData = useMemo(() => {
    const activePokemon = team.filter(p => p !== null);
    
    return TYPES.map(targetType => {
      let superEffective = 0;
      let resisted = 0;

      activePokemon.forEach(p => {
        let bestMult = 0;
        p.types.forEach(stab => {
          const matchup = TYPE_MATCHUPS[targetType.toLowerCase()];
          if (!matchup) return;
          let mult = 1;
          if (matchup.immune.includes(stab)) mult = 0;
          else if (matchup.weak.includes(stab)) mult = 2;
          else if (matchup.resist.includes(stab)) mult = 0.5;
          if (mult > bestMult) bestMult = mult;
        });

        if (bestMult > 1) superEffective++;
        else if (bestMult < 1) resisted++;
      });

      return { type: targetType, superEffective, resisted };
    });
  }, [team]);

  // Sort to show highest weaknesses first
  const sortedDefensive = [...defensiveData].sort((a, b) => {
    const scoreA = (a.weaknesses * 2) - a.resistances - (a.immunities * 2);
    const scoreB = (b.weaknesses * 2) - b.resistances - (b.immunities * 2);
    return scoreB - scoreA;
  });

  const sortedOffensive = [...offensiveData].sort((a, b) => {
    return b.superEffective - a.superEffective; // Highest coverage first
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '0 0 0.4rem 0', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '0.2rem' }}>
        <h3 
          onClick={() => setMode('defensive')}
          style={{ 
            fontSize: '0.7rem', textTransform: 'uppercase', margin: 0, cursor: 'pointer',
            color: mode === 'defensive' ? '#FFF' : '#777',
            textShadow: mode === 'defensive' ? '0 0 5px rgba(255,255,255,0.5)' : 'none'
          }}>
          Defensive
        </h3>
        <h3 
          onClick={() => setMode('offensive')}
          style={{ 
            fontSize: '0.7rem', textTransform: 'uppercase', margin: 0, cursor: 'pointer',
            color: mode === 'offensive' ? '#FFF' : '#777',
            textShadow: mode === 'offensive' ? '0 0 5px rgba(255,255,255,0.5)' : 'none'
          }}>
          Offensive
        </h3>
      </div>
      
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem', minHeight: 0 }} className="custom-scrollbar">
        {mode === 'defensive' && sortedDefensive.map(data => {
          if (data.weaknesses === 0 && data.resistances === 0 && data.immunities === 0) return null; // Skip neutral
          
          let alertColor = '#FFF';
          if (data.weaknesses >= 3) alertColor = 'var(--led-red)';
          else if (data.weaknesses > data.resistances + data.immunities) alertColor = 'var(--led-yellow)';
          else if (data.immunities > 0 || data.resistances > data.weaknesses) alertColor = 'var(--led-green)';

          return (
            <div key={data.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ 
                  backgroundColor: typeColors[data.type], 
                  color: '#FFF', padding: '0.1rem 0.3rem', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1px', minWidth: '45px', textAlign: 'center', fontWeight: 'bold',
                  textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000'
                }}>
                  {data.type}
                </span>
                <span style={{ color: alertColor, fontWeight: 'bold' }}>
                  {data.weaknesses >= 3 ? 'CRITICAL' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', color: '#CCC' }}>
                {data.weaknesses > 0 && <span style={{ color: '#ff5252' }}>{data.weaknesses} Weak</span>}
                {data.resistances > 0 && <span style={{ color: '#4caf50' }}>{data.resistances} Resist</span>}
                {data.immunities > 0 && <span style={{ color: '#03a9f4' }}>{data.immunities} Immune</span>}
              </div>
            </div>
          );
        })}

        {mode === 'offensive' && sortedOffensive.map(data => {
          if (data.superEffective === 0 && data.resisted === 0) return null;
          
          let alertColor = '#FFF';
          if (data.superEffective >= 3) alertColor = 'var(--led-green)';
          else if (data.superEffective === 0) alertColor = 'var(--led-red)';
          else alertColor = '#FFF';

          return (
            <div key={data.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ 
                  backgroundColor: typeColors[data.type], 
                  color: '#FFF', padding: '0.1rem 0.3rem', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1px', minWidth: '45px', textAlign: 'center', fontWeight: 'bold',
                  textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000'
                }}>
                  {data.type}
                </span>
                <span style={{ color: alertColor, fontWeight: 'bold' }}>
                  {data.superEffective === 0 ? 'POOR' : data.superEffective >= 3 ? 'GREAT' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', color: '#CCC' }}>
                {data.superEffective > 0 && <span style={{ color: '#4caf50' }}>{data.superEffective} Super Effective</span>}
                {data.resisted > 0 && <span style={{ color: '#ff5252' }}>{data.resisted} Resist</span>}
              </div>
            </div>
          );
        })}

        {((mode === 'defensive' && sortedDefensive.filter(d => d.weaknesses > 0 || d.resistances > 0 || d.immunities > 0).length === 0) || 
          (mode === 'offensive' && sortedOffensive.filter(d => d.superEffective > 0 || d.resisted > 0).length === 0)) && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem' }}>No Data</div>
        )}
      </div>
    </div>
  );
};

export default TypeMatrix;
