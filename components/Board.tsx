import React from 'react';
import { Answer } from '../types';

interface BoardProps {
  answers: Answer[];
  currentRoundScore: number;
}

const Board: React.FC<BoardProps> = ({ answers, currentRoundScore }) => {
  // Always render 4 slots
  const slots = Array(4).fill(null).map((_, i) => answers[i] || null);

  return (
    <div className="w-full max-w-4xl mx-auto p-2 md:p-4">
      {/* Main Score Display for Current Round */}
      <div className="flex justify-center mb-8 md:mb-12">
        <div className="bg-black border-4 border-biiffi-yellow text-biiffi-yellow font-display text-5xl md:text-7xl px-10 py-4 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.4)] transform hover:scale-105 transition-transform">
          {currentRoundScore}
        </div>
      </div>

      {/* The Grid - 4 items: 1 column on mobile, 2 columns on desktop (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {slots.map((answer, index) => (
          <div key={index} className="relative h-20 md:h-24 perspective-1000 group">
            {answer ? (
              <div 
                className={`
                  w-full h-full relative transition-all duration-700 transform-style-3d 
                  ${answer.revealed ? 'rotate-x-180' : ''}
                `}
                style={{ transformStyle: 'preserve-3d', transform: answer.revealed ? 'rotateX(180deg)' : 'rotateX(0deg)' }}
              >
                {/* Front (Hidden) */}
                <div 
                  className="absolute inset-0 backface-hidden bg-gradient-to-b from-blue-700 to-blue-900 border-2 border-white rounded-lg flex items-center justify-center shadow-lg"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-950 flex items-center justify-center border border-blue-400 shadow-inner">
                    <span className="text-2xl md:text-3xl font-bold text-white font-display">{index + 1}</span>
                  </div>
                </div>

                {/* Back (Revealed) */}
                <div 
                  className="absolute inset-0 backface-hidden bg-white border-4 border-biiffi-yellow rounded-lg flex items-center justify-between px-6 md:px-8 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
                >
                  <span className="text-xl md:text-3xl font-bold text-black uppercase tracking-tight truncate mr-4">
                    {answer.text}
                  </span>
                  <div className="bg-black text-white w-12 md:w-16 py-1 text-center font-display text-xl md:text-2xl border border-gray-600">
                    {answer.points}
                  </div>
                </div>
              </div>
            ) : (
              // Empty Slot (shouldn't happen with fixed 4, but good fallback)
              <div className="w-full h-full bg-blue-950/20 border-2 border-blue-900/30 rounded-lg flex items-center justify-center">
                <div className="flex gap-2 opacity-30">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;