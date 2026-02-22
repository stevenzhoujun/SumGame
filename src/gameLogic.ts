import { useState, useEffect, useCallback, useRef } from 'react';
import { Block, GameMode, GameState, GRID_ROWS, GRID_COLS, INITIAL_ROWS, MAX_VALUE, TIME_LIMIT } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useGameLogic(mode: GameMode | null) {
  const [state, setState] = useState<GameState>({
    blocks: [],
    selectedIds: [],
    targetSum: 0,
    score: 0,
    level: 1,
    gameOver: false,
    mode: mode || 'classic',
    timeLeft: TIME_LIMIT,
    isPaused: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateTargetSum = useCallback(() => {
    return Math.floor(Math.random() * 15) + 5; // Target between 5 and 20
  }, []);

  const addNewRow = useCallback(() => {
    setState(prev => {
      // Check if any block is at the top row (row 0)
      const isFull = prev.blocks.some(b => b.row === 0);
      if (isFull) {
        return { ...prev, gameOver: true };
      }

      // Move existing blocks up
      const movedBlocks = prev.blocks.map(b => ({ ...b, row: b.row - 1 }));
      
      // Add new row at the bottom (row GRID_ROWS - 1)
      const newRow: Block[] = Array.from({ length: GRID_COLS }).map((_, col) => ({
        id: generateId(),
        value: Math.floor(Math.random() * MAX_VALUE) + 1,
        row: GRID_ROWS - 1,
        col,
      }));

      return {
        ...prev,
        blocks: [...movedBlocks, ...newRow],
        timeLeft: TIME_LIMIT, // Reset timer on new row
      };
    });
  }, []);

  const initGame = useCallback((selectedMode: GameMode) => {
    const initialBlocks: Block[] = [];
    for (let r = GRID_ROWS - INITIAL_ROWS; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        initialBlocks.push({
          id: generateId(),
          value: Math.floor(Math.random() * MAX_VALUE) + 1,
          row: r,
          col: c,
        });
      }
    }

    setState({
      blocks: initialBlocks,
      selectedIds: [],
      targetSum: Math.floor(Math.random() * 15) + 5,
      score: 0,
      level: 1,
      gameOver: false,
      mode: selectedMode,
      timeLeft: TIME_LIMIT,
      isPaused: false,
    });
  }, []);

  const toggleBlock = (id: string) => {
    if (state.gameOver || state.isPaused) return;

    setState(prev => {
      const isSelected = prev.selectedIds.includes(id);
      const newSelectedIds = isSelected
        ? prev.selectedIds.filter(sid => sid !== id)
        : [...prev.selectedIds, id];

      const currentSum = newSelectedIds.reduce((sum, sid) => {
        const block = prev.blocks.find(b => b.id === sid);
        return sum + (block?.value || 0);
      }, 0);

      if (currentSum === prev.targetSum) {
        // Success!
        const remainingBlocks = prev.blocks.filter(b => !newSelectedIds.includes(id) && !prev.selectedIds.includes(b.id) || (b.id !== id && !prev.selectedIds.includes(b.id)));
        // Actually, filter out all selected blocks
        const finalRemainingBlocks = prev.blocks.filter(b => !newSelectedIds.includes(b.id));
        
        // In classic mode, add a row after success
        // In time mode, just clear and reset timer
        
        const newState = {
          ...prev,
          blocks: finalRemainingBlocks,
          selectedIds: [],
          targetSum: generateTargetSum(),
          score: prev.score + (newSelectedIds.length * 10),
          timeLeft: TIME_LIMIT,
        };

        if (prev.mode === 'classic') {
          // We'll trigger addNewRow via a separate effect or just do it here
          // But wait, if we clear blocks, we might want to drop them?
          // The reference game "Blokmatik" usually adds a row from the bottom.
          // Let's stick to adding a row from bottom.
        }

        return newState;
      }

      if (currentSum > prev.targetSum) {
        // Over sum - clear selection with a penalty or just clear?
        // Let's just clear selection
        return { ...prev, selectedIds: [] };
      }

      return { ...prev, selectedIds: newSelectedIds };
    });
  };

  // Effect for Classic Mode: Add row after successful sum
  // Actually, it's better to handle it in the toggleBlock logic or a dedicated function
  
  // Effect for Time Mode
  useEffect(() => {
    if (state.mode === 'time' && !state.gameOver && !state.isPaused && mode) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 0) {
            // Time out! Add a row and reset
            return { ...prev, timeLeft: TIME_LIMIT }; 
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.mode, state.gameOver, state.isPaused, mode]);

  // Handle time out row addition
  useEffect(() => {
    if (state.mode === 'time' && state.timeLeft === TIME_LIMIT && state.score > 0) {
       // This is a bit tricky to detect "just reset". 
       // Let's use a ref or a more robust state for "needsNewRow"
    }
  }, [state.timeLeft]);

  return {
    state,
    toggleBlock,
    initGame,
    addNewRow,
    setState
  };
}
