import React, { useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { RotateCw, Sparkles, Trophy, Frown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { UserProgress } from '../types';

interface Reward {
  points: number;
  probability: number;
  color: string;
}

const REWARDS: Reward[] = [
  { points: 20, probability: 0.25, color: '#22C55E' },
  { points: 50, probability: 0.14, color: '#A855F7' },
  { points: 100, probability: 0.07, color: '#3B82F6' },
  { points: 300, probability: 0.04, color: '#F97316' },
  { points: 1000, probability: 0.012, color: '#6366F1' },
  { points: 500, probability: 0.025, color: '#EF4444' },
  { points: 2000, probability: 0.003, color: '#F59E0B' },
  { points: 0, probability: 0.45, color: '#111827' },
];

interface SpinWheelProps {
  user: UserProgress;
  onSpin: (reward: number) => Promise<void>;
  onBack: () => void;
}

export function SpinWheel({ user, onSpin, onBack }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const controls = useAnimation();
  const pointerControls = useAnimation();
  const lightControls = useAnimation();

  const today = new Date().toISOString().split('T')[0];
  const dailyCount = user.lastSpinDate === today ? (user.dailySpinCount || 0) : 0;
  const isLimitReached = dailyCount >= 10;
  const isFreeSpin = dailyCount < 5;
  const hasEnoughPoints = isFreeSpin || user.points >= 50;

  const triggerConfetti = (points: number) => {
    if (points === 0) return;

    const duration = points >= 1000 ? 5 * 1000 : 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    if (points >= 500) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FDE68A', '#F59E0B', '#B45309']
      });
    }
  };

  const handleSpinClick = async () => {
    if (isSpinning || cooldown || !hasEnoughPoints || isLimitReached) return;

    setIsSpinning(true);
    setResult(null);
    setShowCelebration(false);

    // Determine reward based on probabilities
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedReward = REWARDS[0];
    let selectedIndex = 0;

    for (let i = 0; i < REWARDS.length; i++) {
      cumulativeProbability += REWARDS[i].probability;
      if (random <= cumulativeProbability) {
        selectedReward = REWARDS[i];
        selectedIndex = i;
        break;
      }
    }

    // Calculate rotation
    const sectionAngle = 360 / REWARDS.length;
    const extraSpins = 15 + Math.floor(Math.random() * 5);
    
    // The center of segment selectedIndex is at (selectedIndex * sectionAngle + sectionAngle / 2) degrees clockwise from the top.
    // To bring this point to the top (0 degrees), we need to rotate the wheel by -(selectedIndex * sectionAngle + sectionAngle / 2).
    const targetOffset = (selectedIndex * sectionAngle + sectionAngle / 2);
    
    // Calculate the new rotation value. 
    // We take the current rotation, add full spins, and then adjust to land on the target offset.
    const currentRotationMod = currentRotation % 360;
    const rotationToTarget = (360 - currentRotationMod - targetOffset + 360) % 360;
    const newRotation = currentRotation + extraSpins * 360 + rotationToTarget;
    
    setCurrentRotation(newRotation);

    // Start light flashing animation
    lightControls.start({
      opacity: [0.4, 1, 0.4],
      transition: { duration: 0.2, repeat: Infinity }
    });

    // Pointer "tick" animation during spin
    const tickInterval = setInterval(() => {
      pointerControls.start({
        rotate: [-15, 0],
        transition: { duration: 0.1 }
      });
    }, 150);

    await controls.start({
      rotate: newRotation,
      transition: { 
        duration: 8,
        ease: [0.12, 0, 0.05, 1]
      }
    });

    clearInterval(tickInterval);
    lightControls.stop();
    pointerControls.set({ rotate: 0 });

    setResult(selectedReward.points);
    if (selectedReward.points > 0) {
      setShowCelebration(true);
      triggerConfetti(selectedReward.points);
    }
    
    await onSpin(selectedReward.points);
    
    setIsSpinning(false);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 500); // 0.5s cooldown
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-8 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8 z-10">
        <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#FDE68A] via-[#F59E0B] to-[#B45309] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          SPIN & WIN!
        </h1>
        <div className="inline-block px-6 py-1 bg-black/40 border border-white/10 rounded-full">
          <p className="text-xs font-bold tracking-[0.2em] text-white/80 uppercase">
            {isFreeSpin ? "FREE SPIN!" : "Cost to spin: 50 points"}
          </p>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative z-10 mb-12">
        {/* Golden Outer Ring with Lights */}
        <div className="relative w-[340px] h-[340px] rounded-full p-4 bg-gradient-to-b from-[#FDE68A] via-[#F59E0B] to-[#78350F] shadow-[0_0_50px_rgba(245,158,11,0.3)]">
          
          {/* Lights */}
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              animate={isSpinning ? lightControls : { opacity: [0.4, 1, 0.4] }}
              transition={isSpinning ? undefined : { duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * (360 / 24)}deg) translate(158px) translateY(-50%)`,
              }}
            />
          ))}

          {/* Pointer */}
          <motion.div 
            animate={pointerControls}
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-lg origin-top"
          >
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-[#FDE68A]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-[#F59E0B]" />
          </motion.div>

          {/* Actual Wheel */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-black/20 bg-[#111]">
            <motion.div
              animate={controls}
              className="w-full h-full relative"
              style={{ transformOrigin: 'center' }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {REWARDS.map((reward, i) => {
                  const angle = 360 / REWARDS.length;
                  // Start from -90 degrees to make index 0 start at the top
                  const startAngle = i * angle - 90;
                  const endAngle = (i + 1) * angle - 90;
                  
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                  
                  const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                  
                  return (
                    <path
                      key={i}
                      d={d}
                      fill={reward.color}
                      stroke="#000"
                      strokeWidth="0.5"
                    />
                  );
                })}
              </svg>
              
              {/* Labels */}
              {REWARDS.map((reward, i) => {
                const angle = 360 / REWARDS.length;
                const rotation = i * angle + angle / 2;
                return (
                  <div
                    key={`label-${i}`}
                    className="absolute top-0 left-1/2 w-[60px] h-1/2 origin-bottom -translate-x-1/2 flex flex-col items-center justify-start pt-8"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                    }}
                  >
                    <div className="flex flex-col items-center select-none">
                      <span className="text-lg font-black text-white leading-none drop-shadow-md">
                        {reward.points}
                      </span>
                      <span className="text-[8px] font-bold text-white/80 uppercase tracking-tighter">
                        Points
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
            
            {/* Center Hub */}
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full z-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#FDE68A] to-[#78350F] p-1">
                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#333] to-[#000]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spin Button & Result */}
      <div className="w-full max-w-[280px] z-10 space-y-6">
        <button
          onClick={handleSpinClick}
          disabled={isSpinning || cooldown || !hasEnoughPoints || isLimitReached}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-3xl italic tracking-tighter transition-all relative group overflow-hidden",
            (hasEnoughPoints && !isLimitReached)
              ? "bg-gradient-to-b from-[#F59E0B] to-[#B45309] text-white shadow-[0_8px_0_#78350F,0_15px_30px_rgba(180,83,9,0.4)] active:translate-y-1 active:shadow-[0_4px_0_#78350F]" 
              : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
          )}
        >
          <span className="relative z-10 drop-shadow-md">
            {isSpinning ? "SPINNING..." : isLimitReached ? "LIMIT REACHED" : isFreeSpin ? "FREE SPIN" : "SPIN"}
          </span>
          {hasEnoughPoints && !isLimitReached && (
            <motion.div
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          )}
        </button>

        {/* Result Message */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isLimitReached ? (
              <motion.p
                key="limit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-error font-bold italic flex items-center gap-2"
              >
                Come back tomorrow
              </motion.p>
            ) : !hasEnoughPoints ? (
              <motion.p
                key="points"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-error font-bold italic"
              >
                Not enough points
              </motion.p>
            ) : result !== null ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotate: 0,
                  transition: { type: "spring", stiffness: 300, damping: 15 }
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-center relative"
              >
                {result > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400"
                  >
                    <Sparkles size={24} />
                  </motion.div>
                )}
                <h2 className={cn(
                  "text-3xl font-black italic tracking-tight drop-shadow-lg",
                  result > 0 ? "text-[#FDE68A] animate-pulse" : "text-white/40"
                )}>
                  {result > 0 ? (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="relative w-20 h-20">
                        {/* Puppy Head */}
                        <div className="absolute inset-0 bg-[#8B4513] rounded-full border-2 border-black/20 shadow-inner" />
                        
                        {/* Puppy Ears (Happy - Wiggling) */}
                        <motion.div 
                          animate={{ rotate: [0, -25, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -left-3 top-1 w-6 h-10 bg-[#5D2E0C] rounded-full origin-top-right"
                        />
                        <motion.div 
                          animate={{ rotate: [0, 25, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -right-3 top-1 w-6 h-10 bg-[#5D2E0C] rounded-full origin-top-left"
                        />
                        
                        {/* Puppy Eyes (Happy - Arched) */}
                        <svg className="absolute top-6 left-4 w-4 h-4" viewBox="0 0 20 20">
                          <path d="M 4 12 Q 10 4 16 12" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        <svg className="absolute top-6 right-4 w-4 h-4" viewBox="0 0 20 20">
                          <path d="M 4 12 Q 10 4 16 12" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        
                        {/* Puppy Nose */}
                        <div className="absolute top-11 left-1/2 -translate-x-1/2 w-3.5 h-2.5 bg-black rounded-full" />
                        
                        {/* Puppy Mouth (Happy Smile) */}
                        <svg className="absolute top-13 left-1/2 -translate-x-1/2 w-8 h-4" viewBox="0 0 40 20">
                          <path d="M 5 5 Q 20 20 35 5" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        
                        {/* Tongue */}
                        <motion.div 
                          animate={{ scaleY: [1, 1.2, 1] }}
                          transition={{ duration: 0.3, repeat: Infinity }}
                          className="absolute top-[16px] left-1/2 -translate-x-1/2 w-3 h-4 bg-[#FF6B6B] rounded-b-full z-[-1]"
                          style={{ top: '65%' }}
                        />
                      </div>
                      <div className="text-center">
                        <span className="flex items-center justify-center gap-2 text-[#FDE68A]">
                          <Trophy className="text-yellow-400" size={24} />
                          <span className="text-3xl font-black">+{result} POINTS!</span>
                        </span>
                        <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mt-1">Amazing Win! 🎉</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="relative w-20 h-20">
                        {/* Puppy Head */}
                        <div className="absolute inset-0 bg-[#8B4513] rounded-full border-2 border-black/20 shadow-inner" />
                        
                        {/* Puppy Ears */}
                        <motion.div 
                          animate={{ rotate: [0, 15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -left-3 top-1 w-6 h-10 bg-[#5D2E0C] rounded-full origin-top-right"
                        />
                        <motion.div 
                          animate={{ rotate: [0, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -right-3 top-1 w-6 h-10 bg-[#5D2E0C] rounded-full origin-top-left"
                        />
                        
                        {/* Puppy Eyes */}
                        <div className="absolute top-7 left-5 w-2.5 h-2.5 bg-black rounded-full" />
                        <div className="absolute top-7 right-5 w-2.5 h-2.5 bg-black rounded-full" />
                        
                        {/* Puppy Nose */}
                        <div className="absolute top-11 left-1/2 -translate-x-1/2 w-3.5 h-2.5 bg-black rounded-full" />
                        
                        {/* Puppy Mouth (Sad) */}
                        <svg className="absolute top-14 left-1/2 -translate-x-1/2 w-6 h-3" viewBox="0 0 40 20">
                          <path d="M 5 15 Q 20 5 35 15" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-[#FDE68A] font-black italic text-xl tracking-tighter">OOPS! 😔</p>
                        <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest">Better luck next time</p>
                      </div>
                    </motion.div>
                  )}
                </h2>
                {result >= 500 && (
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-xs font-bold text-yellow-400 mt-1 tracking-widest uppercase"
                  >
                    Incredible Win!
                  </motion.p>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="mt-auto w-full max-w-md bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-white/10 py-3 px-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-[#FDE68A] text-xs font-black italic tracking-widest uppercase">Points:</span>
          <span className="text-xl font-black tracking-tighter">{user.points}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#FDE68A] text-xs font-black italic tracking-widest uppercase">Daily:</span>
          <span className="text-xl font-black tracking-tighter">{dailyCount}/10</span>
        </div>
      </div>
    </div>
  );
}
