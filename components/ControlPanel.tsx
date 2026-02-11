import React, { useState } from 'react';
import { GameState, Team } from '../types';
import { Eye, EyeOff, XCircle, Play, Trophy, Settings, ChevronUp, ChevronDown, Flag } from 'lucide-react';

interface ControlPanelProps {
  gameState: GameState;
  onRevealAnswer: (answerId: string) => void;
  onStrike: () => void;
  onNextRound: () => void;
  onAwardPoints: (teamId: string) => void;
  onResetGame: () => void;
  loading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
  onRevealAnswer,
  onStrike,
  onNextRound,
  onAwardPoints,
  onResetGame,
  loading
}) => {
  const { currentQuestion, phase, teams, currentStrikes, roundNumber } = gameState;
  const [isExpanded, setIsExpanded] = useState(true);

  if (!currentQuestion) return null;

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-40
      bg-slate-900/95 backdrop-blur border-t border-slate-700 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]
      transition-all duration-300 flex flex-col
      ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'}
    `}>
      {/* Toggle Handle */}
      <div 
        className="h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 cursor-pointer border-b border-slate-700 shrink-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          Juontajan Paneeli
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto max-h-[40vh] md:max-h-none">
        <div className="max-w-7xl mx-auto p-2 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6">
            
            {/* LEFT: Answers Management */}
            <div className="md:col-span-7 lg:col-span-8 bg-slate-950/50 rounded-lg p-3 border border-slate-800">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-gray-400 text-xs font-bold uppercase">Vastaukset</h3>
                 <span className="text-slate-600 text-xs font-mono">Kierros {roundNumber}</span>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {currentQuestion.answers.map((ans) => (
                   <button
                     key={ans.id}
                     onClick={() => !ans.revealed && onRevealAnswer(ans.id)}
                     disabled={ans.revealed || phase === 'GAME_OVER'}
                     className={`
                       flex justify-between items-center px-3 py-3 rounded-lg text-left transition-all group text-sm
                       ${ans.revealed 
                         ? 'bg-green-900/20 text-green-600 border border-green-900/30' 
                         : 'bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 hover:border-slate-600'
                       }
                     `}
                   >
                     <span className="font-medium truncate mr-2 flex-1">{ans.text}</span>
                     <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-xs font-bold ${ans.revealed ? 'bg-green-900/40 text-green-400' : 'bg-black/30 text-gray-400'}`}>
                         {ans.points}
                       </span>
                       {ans.revealed 
                         ? <Eye size={16} className="text-green-600" /> 
                         : <EyeOff size={16} className="text-gray-500 group-hover:text-white" />
                     }
                     </div>
                   </button>
                 ))}
               </div>
            </div>

            {/* RIGHT: Game Actions */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-2">
              
              <div className="grid grid-cols-2 gap-2 h-full">
                {/* Strike Button */}
                <button
                  onClick={onStrike}
                  disabled={phase === 'ROUND_OVER' || phase === 'GAME_OVER'}
                  className="col-span-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold p-2 rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm active:translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-1">
                    <XCircle size={24} /> <span className="text-base">HUTI</span>
                  </div>
                  <div className="flex gap-1 bg-red-800/50 px-1.5 py-0.5 rounded">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < currentStrikes ? 'bg-white' : 'bg-red-900'}`} />
                    ))}
                  </div>
                </button>

                {/* Next Round / Reset Buttons */}
                <div className="col-span-1 flex flex-col gap-2">
                   <button 
                    onClick={onNextRound}
                    disabled={loading}
                    className={`
                      flex-1 flex items-center justify-center gap-1 font-bold p-2 rounded-lg text-sm transition-all shadow-sm
                      ${loading ? 'bg-slate-700 text-gray-500' : 'bg-biiffi-yellow hover:bg-yellow-300 text-black'}
                    `}
                  >
                    {loading ? '...' : (phase === 'GAME_OVER' ? 'Tulokset' : 'Seuraava')} <Play size={18} fill="currentColor" />
                  </button>
                   <button 
                     onClick={onResetGame}
                     className="flex items-center justify-center gap-1 text-slate-400 hover:text-white text-xs font-semibold py-2 hover:bg-slate-800 rounded transition-colors"
                   >
                     <Flag size={12} /> Lopeta Peli
                   </button>
                </div>

                {/* Award Points Section */}
                <div className="col-span-2 bg-slate-950/50 rounded-lg p-2 border border-slate-800">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1 text-center">Jaa pisteet:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => onAwardPoints(team.id)}
                        disabled={(phase !== 'FACE_OFF' && phase !== 'ROUND_OVER') || phase === 'GAME_OVER'}
                        className={`
                          py-2 px-2 rounded-lg text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1 transition-transform active:scale-95 truncate
                          ${team.color.replace('bg-', 'bg-').replace('border-', 'hover:brightness-110 ')}
                        `}
                      >
                        <Trophy size={14} />
                        <span className="truncate">{team.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;