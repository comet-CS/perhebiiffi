export interface Answer {
  id: string;
  text: string;
  points: number;
  revealed: boolean;
}

export interface Question {
  text: string;
  answers: Answer[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
}

export enum GamePhase {
  SETUP = 'SETUP', // Choosing teams
  LOADING = 'LOADING', // Fetching first question
  FACE_OFF = 'FACE_OFF', // Playing the round
  ROUND_OVER = 'ROUND_OVER', // Round finished, points awarded
  GAME_OVER = 'GAME_OVER' // Game finished
}

export interface GameState {
  phase: GamePhase;
  currentQuestion: Question | null;
  teams: Team[];
  currentStrikes: number;
  roundScore: number;
  history: string[]; 
  roundNumber: number;
}