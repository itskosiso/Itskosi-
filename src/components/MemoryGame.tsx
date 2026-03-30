import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  RotateCcw, 
  Play, 
  ChevronRight, 
  X, 
  Sparkles,
  Zap,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { UserProgress } from '../types';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CRYPTO_LOGOS = [
  { symbol: '₿', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'Ξ', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'S', name: 'Solana', color: '#14F195' },
  { symbol: 'D', name: 'Dogecoin', color: '#C2A633' },
  { symbol: 'Ł', name: 'Litecoin', color: '#345D9D' },
  { symbol: 'A', name: 'Cardano', color: '#0033AD' },
  { symbol: 'P', name: 'Polkadot', color: '#E6007A' },
  { symbol: 'X', name: 'Ripple', color: '#23292F' },
  { symbol: 'T', name: 'Tether', color: '#26A17B' },
  { symbol: 'B', name: 'BNB', color: '#F3BA2F' },
  { symbol: 'M', name: 'Monero', color: '#FF6600' },
  { symbol: 'U', name: 'Uniswap', color: '#FF007A' },
  { symbol: 'C', name: 'Chainlink', color: '#2A5ADA' },
  { symbol: 'V', name: 'Verse', color: '#FF0080' },
];

interface MemoryGameProps {
  user: UserProgress;
  onGameComplete: (points: number) => Promise<void>;
  onBack: () => void;
}

export function MemoryGame({ user, onGameComplete, onBack }: MemoryGameProps) {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'won' | 'lost'>('idle');
  const [score, setScore] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const dailyCount = user.lastMemoryGameDate === today ? (user.dailyMemoryGameCount || 0) : 0;
  const isLimitReached = dailyCount >= 10;

  const initGame = useCallback((lvl: number) => {
    const pairsCount = 6 + (lvl - 1) * 2;
    const selectedLogos = [...CRYPTO_LOGOS].sort(() => Math.random() - 0.5).slice(0, pairsCount);
    const gameCards = [...selectedLogos, ...selectedLogos]
      .sort(() => Math.random() - 0.5)
      .map((logo, index) => ({
        id: index,
        value: logo.symbol,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(gameCards);
    setFlippedIndices([]);
    setMatches(0);
    setTimer(60 + (lvl - 1) * 10);
    setGameState('playing');
    setScore(0);
    setBonusPoints(0);
  }, []);

  useEffect(() => {
    let interval: any;
    if (gameState === 'playing' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setGameState('lost');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timer]);

  const handleCardClick = (index: number) => {
    if (
      gameState !== 'playing' ||
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].value === cards[second].value) {
        // Match
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          const currentMatches = matches + 1;
          setMatches(currentMatches);
          const currentScore = score + 10;
          setScore(currentScore);
          
          // Match celebration
          if (matchedCards.every(c => c.isMatched)) {
            const timeBonus = Math.floor(timer / 2);
            setBonusPoints(timeBonus);
            setGameState('won');
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            onGameComplete(currentScore + timeBonus);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleNextLevel = () => {
    setLevel((prev) => prev + 1);
    initGame(level + 1);
  };

  const handleRestart = () => {
    initGame(level);
  };

  if (isLimitReached && gameState === 'idle') {
    return (
      <div className="min-h-screen bg-background-deep flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-error/20 rounded-full flex items-center justify-center">
          <Timer className="text-error" size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter">LIMIT REACHED</h1>
          <p className="text-text-secondary">Come back tomorrow for more flips!</p>
        </div>
        <button onClick={onBack} className="btn-secondary w-full max-w-xs">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 z-10">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
            <Timer size={18} className={cn(timer < 10 ? "text-error animate-pulse" : "text-cyan-400")} />
            <span className={cn("font-mono font-bold text-lg", timer < 10 ? "text-error" : "text-white")}>
              {timer}s
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
            <Coins size={18} className="text-yellow-400" />
            <span className="font-mono font-bold text-lg">{score}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {gameState === 'idle' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 max-w-sm"
          >
            <div className="space-y-4">
              <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-purple-600">
                VERSE FLIP
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Match the crypto logos to earn points. Each level adds more cards and complexity.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Plays Today</p>
                <p className="text-2xl font-black">{dailyCount}/10</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Current Level</p>
                <p className="text-2xl font-black">{level}</p>
              </div>
            </div>

            <button 
              onClick={() => initGame(level)}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-xl italic tracking-tighter transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,184,212,0.3)]"
            >
              <Play size={20} fill="currentColor" />
              START GAME
            </button>
          </motion.div>
        ) : (
          <div className="w-full max-w-md mx-auto">
            <div className={cn(
              "grid gap-3 w-full",
              level === 1 ? "grid-cols-3" : "grid-cols-4"
            )}>
              {cards.map((card, index) => (
                <div 
                  key={card.id}
                  className="aspect-[3/4] relative perspective-1000 cursor-pointer"
                  onClick={() => handleCardClick(index)}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full h-full relative preserve-3d"
                  >
                    {/* Back Side */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                      <div className="w-8 h-8 rounded-full border-2 border-white/5 flex items-center justify-center">
                        <span className="text-white/20 font-black text-xl">V</span>
                      </div>
                    </div>
                    
                    {/* Front Side */}
                    <div 
                      className="absolute inset-0 backface-hidden bg-gradient-to-br from-white/10 to-white/5 border-2 rounded-xl flex flex-col items-center justify-center gap-2 shadow-xl"
                      style={{ 
                        transform: 'rotateY(180deg)',
                        borderColor: card.isMatched ? '#22C55E' : 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <span 
                        className="text-3xl font-black"
                        style={{ color: CRYPTO_LOGOS.find(l => l.symbol === card.value)?.color }}
                      >
                        {card.value}
                      </span>
                      {card.isMatched && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                        >
                          <Sparkles size={12} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Over Modals */}
      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            {/* Celebration Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    y: '-=100'
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute"
                >
                  <Sparkles className="text-yellow-400" size={Math.random() * 20 + 10} />
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ scale: 0.8, y: 40, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-yellow-500/30 rounded-[40px] p-8 w-full max-w-sm text-center space-y-6 shadow-[0_0_50px_rgba(234,179,8,0.2)] relative overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 blur-[60px] rounded-full" />
              
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                >
                  <Trophy className="text-white" size={48} />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-2 -right-2 bg-cyan-500 rounded-full p-2 shadow-lg"
                >
                  <Sparkles size={20} className="text-white" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
                  VICTORY!
                </h2>
                <p className="text-text-secondary text-sm uppercase tracking-widest font-bold">Level {level} Mastered</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 uppercase font-bold tracking-wider">Base Score</span>
                  <span className="font-mono font-black text-lg">+ {score}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 uppercase font-bold tracking-wider">Speed Bonus</span>
                  <span className="font-mono font-black text-lg text-yellow-400">+ {bonusPoints}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-black tracking-widest text-cyan-400">Total Verse Points</span>
                  <span className="text-3xl font-black italic tracking-tighter text-cyan-400">{score + bonusPoints}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  onClick={handleRestart}
                  className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  REPLAY
                </button>
                <button 
                  onClick={handleNextLevel}
                  className="py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,184,212,0.3)] flex items-center justify-center gap-2"
                >
                  NEXT LEVEL <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState === 'lost' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto">
                <Timer className="text-error" size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black italic tracking-tighter">TIME'S UP!</h2>
                <p className="text-text-secondary">Don't give up, try again!</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={onBack} className="btn-secondary py-3">
                  EXIT
                </button>
                <button onClick={handleRestart} className="btn-primary py-3 flex items-center justify-center gap-2">
                  TRY AGAIN <RotateCcw size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
