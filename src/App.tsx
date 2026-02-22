/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Pause, 
  Timer, 
  Zap, 
  ChevronLeft,
  AlertCircle,
  Hash
} from 'lucide-react';
import { GameMode, GRID_ROWS, GRID_COLS, TIME_LIMIT } from './types';
import { useGameLogic } from './gameLogic';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const { state, toggleBlock, initGame, addNewRow, setState } = useGameLogic(gameMode);

  // Handle mode selection
  const handleStart = (mode: GameMode) => {
    setGameMode(mode);
    initGame(mode);
  };

  const handleRestart = () => {
    if (gameMode) initGame(gameMode);
  };

  const handleBack = () => {
    setGameMode(null);
  };

  // Auto-add row in classic mode after success
  // We need to track when score changes to add a row
  const prevScore = React.useRef(state.score);
  useEffect(() => {
    if (gameMode === 'classic' && state.score > prevScore.current) {
      addNewRow();
    }
    prevScore.current = state.score;
  }, [state.score, gameMode, addNewRow]);

  // Auto-add row in time mode when timer hits 0
  useEffect(() => {
    if (gameMode === 'time' && state.timeLeft === 0 && !state.gameOver) {
      addNewRow();
    }
  }, [state.timeLeft, gameMode, state.gameOver, addNewRow]);

  if (!gameMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Hash className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-2">数字消除</h1>
          <p className="text-slate-400 text-lg">掌握加法的艺术</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <MenuCard 
            title="经典模式" 
            description="每次成功求和后新增一行。挑战你的生存极限。"
            icon={<Trophy className="w-6 h-6" />}
            onClick={() => handleStart('classic')}
            color="emerald"
          />
          <MenuCard 
            title="计时模式" 
            description="与时间赛跑。时间耗尽时会强制新增一行。"
            icon={<Timer className="w-6 h-6" />}
            onClick={() => handleStart('time')}
            color="amber"
          />
        </div>

        <footer className="mt-12 text-slate-500 text-sm">
          点击方块使数字相加等于目标值。不要让方块堆积到顶部！
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="p-4 flex items-center justify-between glass z-10">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">目标和</span>
          <motion.div 
            key={state.targetSum}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-emerald-400"
          >
            {state.targetSum}
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-slate-400 block">得分</span>
            <span className="text-xl font-mono font-bold">{state.score}</span>
          </div>
          <button 
            onClick={() => setState(s => ({ ...s, isPaused: !s.isPaused }))}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {state.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Timer Bar (Time Mode) */}
      {gameMode === 'time' && (
        <div className="h-1.5 w-full bg-slate-800">
          <motion.div 
            className="h-full bg-amber-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(state.timeLeft / TIME_LIMIT) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      )}

      {/* Game Board */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        <div 
          className="grid gap-2 w-full max-w-md aspect-[6/10] relative"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
          }}
        >
          {/* Background Grid */}
          {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (
            <div key={i} className="bg-slate-800/30 rounded-lg border border-white/5" />
          ))}

          {/* Active Blocks */}
          <AnimatePresence mode="popLayout">
            {state.blocks.map((block) => (
              <motion.div
                key={block.id}
                layoutId={block.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  gridRowStart: block.row + 1,
                  gridColumnStart: block.col + 1
                }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => toggleBlock(block.id)}
                className={`number-block ${state.selectedIds.includes(block.id) ? 'selected' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                style={{
                  gridRow: block.row + 1,
                  gridColumn: block.col + 1,
                }}
              >
                {block.value}
                {block.row === 0 && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Current Selection Sum Indicator */}
        <AnimatePresence>
          {state.selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl"
            >
              <span className="text-slate-400 font-medium">当前总和:</span>
              <span className={`text-2xl font-bold ${
                state.selectedIds.reduce((sum, id) => sum + (state.blocks.find(b => b.id === id)?.value || 0), 0) > state.targetSum 
                ? 'text-red-400' 
                : 'text-emerald-400'
              }`}>
                {state.selectedIds.reduce((sum, id) => sum + (state.blocks.find(b => b.id === id)?.value || 0), 0)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {state.gameOver && (
          <Modal>
            <div className="text-center">
              <div className="bg-red-500/20 p-4 rounded-full w-fit mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">游戏结束!</h2>
              <p className="text-slate-400 mb-6">方块已经触顶。</p>
              
              <div className="bg-slate-800 rounded-2xl p-6 mb-8">
                <div className="text-sm text-slate-500 uppercase tracking-widest mb-1">最终得分</div>
                <div className="text-5xl font-bold text-white">{state.score}</div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleRestart}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> 重新开始
                </button>
                <button 
                  onClick={handleBack}
                  className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-lg transition-colors"
                >
                  返回主菜单
                </button>
              </div>
            </div>
          </Modal>
        )}

        {state.isPaused && !state.gameOver && (
          <Modal>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-8">已暂停</h2>
              <button 
                onClick={() => setState(s => ({ ...s, isPaused: false }))}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> 继续游戏
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuCard({ title, description, icon, onClick, color }: { 
  title: string, 
  description: string, 
  icon: React.ReactNode, 
  onClick: () => void,
  color: 'emerald' | 'amber'
}) {
  const colorClasses = {
    emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    amber: 'hover:border-amber-500/50 hover:bg-amber-500/5'
  };

  const iconClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-500',
    amber: 'bg-amber-500/20 text-amber-500'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-8 rounded-3xl border border-white/10 bg-white/5 text-left transition-all duration-300 ${colorClasses[color]}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${iconClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.button>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
