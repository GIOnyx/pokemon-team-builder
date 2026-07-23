import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const TeamRadar = ({ team }) => {
  const data = useMemo(() => {
    const activePokemon = team.filter(p => p !== null);
    if (activePokemon.length === 0) {
      return [
        { subject: 'HP 0', A: 0, fullMark: 150 },
        { subject: 'Atk 0', A: 0, fullMark: 150 },
        { subject: 'Def 0', A: 0, fullMark: 150 },
        { subject: 'SpA 0', A: 0, fullMark: 150 },
        { subject: 'SpD 0', A: 0, fullMark: 150 },
        { subject: 'Spe 0', A: 0, fullMark: 150 },
      ];
    }

    const totals = { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
    activePokemon.forEach(p => {
      if (p.stats) {
        totals.hp += p.stats.hp || 0;
        totals.attack += p.stats.attack || 0;
        totals.defense += p.stats.defense || 0;
        totals['special-attack'] += p.stats['special-attack'] || 0;
        totals['special-defense'] += p.stats['special-defense'] || 0;
        totals.speed += p.stats.speed || 0;
      }
    });

    const count = activePokemon.length;
    return [
      { subject: `HP ${Math.round(totals.hp / count)}`, A: Math.round(totals.hp / count), fullMark: 150 },
      { subject: `Atk ${Math.round(totals.attack / count)}`, A: Math.round(totals.attack / count), fullMark: 150 },
      { subject: `Def ${Math.round(totals.defense / count)}`, A: Math.round(totals.defense / count), fullMark: 150 },
      { subject: `SpA ${Math.round(totals['special-attack'] / count)}`, A: Math.round(totals['special-attack'] / count), fullMark: 150 },
      { subject: `SpD ${Math.round(totals['special-defense'] / count)}`, A: Math.round(totals['special-defense'] / count), fullMark: 150 },
      { subject: `Spe ${Math.round(totals.speed / count)}`, A: Math.round(totals.speed / count), fullMark: 150 },
    ];
  }, [team]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: '0.7rem', color: '#FFF', textTransform: 'uppercase', margin: '0 0 0.25rem 0', textAlign: 'center' }}>Avg Base Stats</h3>
      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.3)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#FFF', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar name="Team Avg" dataKey="A" stroke="var(--led-blue)" fill="var(--led-blue)" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TeamRadar;
