import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Users, Trophy, Play, Settings, Crown, RotateCcw } from 'lucide-react';
import Board from './components/Board';
import ControlPanel from './components/ControlPanel';
import StrikeOverlay from './components/StrikeOverlay';
import Logo from './components/Logo';
import { generateQuestion } from './services/geminiService';
import { GameState, GamePhase, Team } from './types';

// Predefined colors for teams
const TEAM_COLORS = [
  'bg-blue-600 border-blue-400',
  'bg-red-600 border-red-400',
  'bg-green-600 border-green-400',
  'bg-purple-600 border-purple-400',
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showStrike, setShowStrike] = useState(false);
  
  // Setup state
  const [teamCount, setTeamCount] = useState(2);
  const [customTeamNames, setCustomTeamNames] = useState<string[]>(['', '', '', '']);

  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.SETUP,
    currentQuestion: null,
    teams: [],
    currentStrikes: 0,
    roundScore: 0,
    history: [],
    roundNumber: 1
  });

  const initializeGame = async () => {
    setLoading(true);
    setGameState(prev => ({ ...prev, phase: GamePhase.LOADING }));

    const initialTeams: Team[] = Array.from({ length: teamCount }).map((_, i) => ({
      id: `team-${i}`,
      name: customTeamNames[i].trim() || `Tiimi ${i + 1}`,
      score: 0,
      color: TEAM_COLORS[i % TEAM_COLORS.length]
    }));

    try {
      const question = await generateQuestion([]);

      setGameState({
        phase: GamePhase.FACE_OFF,
        currentQuestion: question,
        teams: initialTeams,
        currentStrikes: 0,
        roundScore: 0,
        history: [question.text],
        roundNumber: 1
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const advanceRound = async () => {
    setLoading(true);
    try {
      // Pass history to avoid duplicates
      const question = await generateQuestion(gameState.history);
      
      setGameState(prev => ({
        ...prev,
        phase: GamePhase.FACE_OFF,
        currentQuestion: question,
        currentStrikes: 0,
        roundScore: 0,
        roundNumber: prev.roundNumber + 1,
        history: [...prev.history, question.text]
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealAnswer = (answerId: string) => {
    if (!gameState.currentQuestion) return;

    const answerIndex = gameState.currentQuestion.answers.findIndex(a => a.id === answerId);
    if (answerIndex === -1) return;

    const answer = gameState.currentQuestion.answers[answerIndex];
    if (answer.revealed) return;

    const points = answer.points;

    setGameState(prev => {
      if (!prev.currentQuestion) return prev;

      const newAnswers = [...prev.currentQuestion.answers];
      newAnswers[answerIndex] = { ...answer, revealed: true };
      const allRevealed = newAnswers.every(a => a.revealed);

      // Always add points, even if round is "over", to allow for flexible scoring (steals, etc.)
      return {
        ...prev,
        roundScore: prev.roundScore + points,
        currentQuestion: {
          ...prev.currentQuestion,
          answers: newAnswers
        },
        phase: allRevealed ? GamePhase.ROUND_OVER : prev.phase
      };
    });
  };

  const handleStrike = () => {
    setShowStrike(true);
    setGameState(prev => ({
      ...prev,
      currentStrikes: prev.currentStrikes + 1
    }));
  };

  const handleAwardPoints = (teamId: string) => {
    setGameState(prev => ({
      ...prev,
      teams: prev.teams.map(t => 
        t.id === teamId 
          ? { ...t, score: t.score + prev.roundScore }
          : t
      ),
      phase: GamePhase.ROUND_OVER,
      roundScore: 0 
    }));
  };

  const handleResetGame = () => {
    if (window.confirm("Haluatko varmasti lopettaa pelin ja nähdä tulokset?")) {
      setGameState(prev => ({ ...prev, phase: GamePhase.GAME_OVER }));
    }
  };

  const handleFullReset = () => {
      setGameState(prev => ({ ...prev, phase: GamePhase.SETUP, history: [] }));
  };

  const getWinner = () => {
    return [...gameState.teams].sort((a, b) => b.score - a.score)[0];
  };

  // --- RENDER HELPERS ---

  if (gameState.phase === GamePhase.SETUP) {
    return (
      <div className="min-h-screen bg-biiffi-dark flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl my-auto animate-flip-in">
          <div className="flex justify-center mb-6">
            <Logo className="w-64 h-auto drop-shadow-xl" />
          </div>
          <div className="text-center mb-8">
            <p className="text-gray-400 font-medium tracking-wide">PELIN ASETUKSET</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Joukkueiden määrä</label>
              <div className="flex gap-2">
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setTeamCount(num)}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                      teamCount === num 
                        ? 'bg-biiffi-yellow text-black ring-2 ring-yellow-200 shadow-lg scale-105' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-300">Joukkueiden nimet (valinnainen)</label>
              {Array.from({ length: teamCount }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-4 h-4 rounded-full ${TEAM_COLORS[i % TEAM_COLORS.length].split(' ')[0]} shadow-[0_0_10px_currentColor]`}></div>
                  <input
                    type="text"
                    placeholder={`Tiimi ${i + 1}`}
                    value={customTeamNames[i]}
                    onChange={(e) => {
                      const newNames = [...customTeamNames];
                      newNames[i] = e.target.value;
                      setCustomTeamNames(newNames);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-biiffi-yellow focus:ring-1 focus:ring-biiffi-yellow transition-all"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={initializeGame}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ladataan...' : <><Play size={24} fill="currentColor" /> ALOITA PELI</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === GamePhase.GAME_OVER) {
    const winner = getWinner();
    return (
      <div className="min-h-screen bg-biiffi-dark flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-[0_0_50px_rgba(250,204,21,0.2)] text-center relative overflow-hidden animate-flip-in">
          <div className="absolute inset-0 bg-gradient-to-br from-biiffi-yellow/10 to-transparent pointer-events-none"></div>
          
          <Crown className="w-24 h-24 text-biiffi-yellow mx-auto mb-6 animate-bounce" />
          
          <h2 className="text-4xl md:text-6xl font-display text-white mb-2">PELI PÄÄTTYNYT!</h2>
          <p className="text-gray-400 text-xl mb-8">Ja voittaja on...</p>
          
          <div className="mb-12">
            <div className={`inline-block px-12 py-6 rounded-2xl ${winner.color.replace('bg-', 'bg-').replace('border-', 'border-2 border-white/50 ')} shadow-2xl transform scale-110`}>
              <h3 className="text-3xl font-bold text-white mb-2">{winner.name}</h3>
              <p className="text-6xl font-display text-white">{winner.score} <span className="text-2xl font-sans font-normal opacity-75">pistettä</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
             {gameState.teams.filter(t => t.id !== winner.id).map(team => (
               <div key={team.id} className="bg-slate-900/50 p-4 rounded-xl flex justify-between items-center border border-slate-700">
                  <span className="font-bold text-gray-300">{team.name}</span>
                  <span className="font-display text-2xl text-white">{team.score}</span>
               </div>
             ))}
          </div>

          <button
            onClick={handleFullReset}
            className="mt-12 bg-biiffi-yellow hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-full text-lg shadow-lg flex items-center gap-2 mx-auto transition-transform hover:scale-105"
          >
            <RotateCcw size={20} /> ALOITA UUSI PELI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-biiffi-dark flex flex-col pb-32 overflow-hidden">
      <StrikeOverlay isVisible={showStrike} onComplete={() => setShowStrike(false)} />
      
      {/* HEADER AREA */}
      <header className="pt-4 pb-2 px-4 text-center relative z-10 bg-gradient-to-b from-biiffi-dark via-biiffi-dark to-transparent">
        <div className="flex justify-between items-start max-w-7xl mx-auto">
          <div className="hidden md:block w-32"></div> {/* Spacer */}
          
          <div className="flex-1 flex flex-col items-center">
            <div className="cursor-pointer transform hover:scale-105 transition-transform" onClick={handleResetGame}>
              <Logo className="w-48 md:w-64 h-auto drop-shadow-2xl" />
            </div>
            
            <div className="text-blue-300/80 text-sm font-bold uppercase tracking-widest mt-2 mb-2">
              Kierros {gameState.roundNumber}
            </div>
            
            {gameState.currentQuestion ? (
              <div className="mt-2 min-h-[5rem] flex items-center justify-center w-full">
                 <div className="relative group w-full max-w-4xl">
                   <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                   <p className="relative text-lg md:text-2xl text-white font-semibold leading-tight bg-slate-900/80 backdrop-blur-xl px-8 py-4 rounded-lg border border-slate-700 shadow-2xl">
                    "{gameState.currentQuestion.text}"
                  </p>
                 </div>
              </div>
            ) : (
              <div className="mt-4 h-16 flex items-center justify-center">
                <span className="animate-pulse text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-biiffi-yellow rounded-full animate-bounce"></span>
                  Ladataan kysymystä...
                </span>
              </div>
            )}
          </div>

          <div className="hidden md:block w-32"></div> {/* Spacer */}
        </div>
      </header>

      {/* SCOREBOARD AREA */}
      <div className="w-full max-w-7xl mx-auto px-2 md:px-4 py-4">
        <div className="flex flex-wrap justify-center gap-2 md:gap-8">
          {gameState.teams.map((team) => (
            <div 
              key={team.id}
              className={`
                flex flex-col items-center justify-center
                min-w-[6rem] md:min-w-[10rem] 
                bg-slate-800/90 backdrop-blur border-b-4 rounded-xl p-3 shadow-xl transition-all
                ${team.color.replace('bg-', 'border-b-')}
              `}
            >
              <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wide truncate max-w-[8rem] mb-1">
                {team.name}
              </span>
              <div className="bg-black/40 rounded px-4 py-1 w-full text-center border border-white/5">
                <span className="text-3xl md:text-5xl font-display text-white">
                  {team.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GAME BOARD */}
      <main className="flex-grow flex flex-col items-center justify-start px-2 relative z-0 mt-4">
        {gameState.currentQuestion && (
          <Board 
            answers={gameState.currentQuestion.answers} 
            currentRoundScore={gameState.roundScore}
          />
        )}

        {/* Round Over Indicator */}
        {gameState.phase === GamePhase.ROUND_OVER && (
           <div className="mt-8 bg-biiffi-yellow text-black px-8 py-4 rounded-full font-bold text-xl animate-bounce shadow-[0_0_30px_rgba(250,204,21,0.6)] flex items-center gap-3 z-20 border-4 border-white/20">
             <Trophy className="w-8 h-8" />
             Kierros Päättynyt! Jaa pisteet.
           </div>
        )}
      </main>

      {/* CONTROL PANEL */}
      <ControlPanel 
        gameState={gameState}
        onRevealAnswer={handleRevealAnswer}
        onStrike={handleStrike}
        onNextRound={advanceRound}
        onAwardPoints={handleAwardPoints}
        onResetGame={handleResetGame}
        loading={loading}
      />
    </div>
  );
};

export default App;