export type GameMode = 'classic' | 'time';

export interface Block {
  id: string;
  value: number;
  row: number;
  col: number;
}

export interface GameState {
  blocks: Block[];
  selectedIds: string[];
  targetSum: number;
  score: number;
  level: number;
  gameOver: boolean;
  mode: GameMode;
  timeLeft: number;
  isPaused: boolean;
}

export const GRID_ROWS = 10;
export const GRID_COLS = 6;
export const INITIAL_ROWS = 4;
export const MAX_VALUE = 9;
export const TIME_LIMIT = 10; // seconds for time mode
