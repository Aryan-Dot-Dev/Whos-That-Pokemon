
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Pokemon } from '../../types';

interface StatRadarProps {
  pokemon: Pokemon;
  revealed: boolean;
}

const StatRadar: React.FC<StatRadarProps> = ({ pokemon, revealed }) => {
  const data = [
    { subject: 'HP', A: pokemon.stats.hp, fullMark: 255 },
    { subject: 'ATK', A: pokemon.stats.attack, fullMark: 255 },
    { subject: 'DEF', A: pokemon.stats.defense, fullMark: 255 },
    { subject: 'S.ATK', A: pokemon.stats.specialAttack, fullMark: 255 },
    { subject: 'S.DEF', A: pokemon.stats.specialDefense, fullMark: 255 },
    { subject: 'SPD', A: pokemon.stats.speed, fullMark: 255 },
  ];

  return (
    <div className="w-full h-full min-h-[180px] flex flex-col items-center">
      <div className="w-full h-full relative overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#cbd5e1" strokeWidth={2} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#000000', fontSize: 10, fontWeight: 900, fontFamily: 'Orbitron' }} 
            />
            <Radar
              name="Stats"
              dataKey="A"
              stroke="#3b4cca"
              fill="#3b4cca"
              fillOpacity={0.6}
              strokeWidth={3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatRadar;
