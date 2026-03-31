/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  Trophy, 
  User, 
  Bell, 
  ChevronRight, 
  ArrowLeft, 
  Award, 
  AlertTriangle,
  AlertCircle,
  LogOut,
  Share2,
  BarChart2,
  Camera,
  RefreshCw,
  RotateCw,
  Zap,
  Users,
  Laptop,
  Layout,
  Sun,
  Moon,
  Send,
  Twitter,
  Bot,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format, subDays } from 'date-fns';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { UserProgress, Question, Lesson, getRank, RANK_LIST, getRankInfo } from './types';
import { LESSONS, QUIZ_POOL } from './data';
import { SpinWheel } from './components/SpinWheel';
import { MemoryGame } from './components/MemoryGame';
import { Jtbot } from './components/Jtbot';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  signInAsGuest,
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit,
  increment,
  updateDoc,
  where,
  getDocs,
  getCountFromServer,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

type Screen = 'home' | 'learn' | 'tasks' | 'leaderboard' | 'lesson-detail' | 'quiz' | 'reward' | 'spin' | 'memory-game' | 'jtbot';

const INITIAL_PROGRESS: UserProgress = {
  userId: Math.random().toString(36).substring(2, 11),
  username: '',
  profilePicture: '',
  points: 0,
  rank: RANK_LIST[0].name,
  progress: 0,
  completedLessons: [],
  streak: 1,
  badges: ['Crypto Beginner'],
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  lastCheckinDate: '',
  lastVisitDate: '',
  lastQuizDate: '',
  lastLessonRewardDate: '',
  totalSpins: 0,
  pointsSpentOnSpins: 0,
  jackpotRewards: 0,
  dailySpinCount: 0,
  lastSpinDate: '',
  dailyMemoryGameCount: 0,
  lastMemoryGameDate: '',
};

// Mock global users removed to show only real users
const MOCK_USERS: UserProgress[] = [];

const VerseLogo = ({ size = 32, showText = true }: { size?: number, showText?: boolean }) => (
  <div className="flex items-center gap-2">
    <div 
      className="rounded-full flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="verseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#D500F9" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#verseGradient)" />
        {/* Right Pill (behind) */}
        <rect 
          x="50" y="22" width="24" height="62" rx="12" 
          fill="white" 
          fillOpacity="0.7"
          transform="rotate(32 62 53)"
        />
        {/* Left Pill (front) */}
        <rect 
          x="26" y="22" width="24" height="62" rx="12" 
          fill="white" 
          transform="rotate(-32 38 53)"
        />
      </svg>
    </div>
    {showText && <span className="text-2xl font-bold tracking-tight">verse</span>}
  </div>
);

const BitcoinLogo = ({ size = 32, showText = true }: { size?: number, showText?: boolean }) => (
  <div className="flex items-center gap-2">
    <div 
      className="rounded-full flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="#F7931A" />
        <text 
          x="50" 
          y="68" 
          textAnchor="middle" 
          fill="white" 
          fontSize="60" 
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >₿</text>
      </svg>
    </div>
    {showText && <span className="text-2xl font-bold tracking-tight">Bitcoin.com</span>}
  </div>
);

const BackButton = ({ onClick, className }: { onClick: () => void, className?: string }) => (
  <button 
    onClick={onClick} 
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full glass-card text-cyan-500 hover:text-white transition-all group mb-6",
      className
    )}
  >
    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
  </button>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-background-deep p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center">
            <AlertCircle className="text-error" size={32} />
          </div>
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-text-secondary text-sm">The Verse encountered a glitch. Please try refreshing the app.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [user, setUser] = useState<UserProgress>(INITIAL_PROGRESS);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string | 'All'>('All');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ points: number; rank: string } | null>(null);
  const [globalUsers, setGlobalUsers] = useState<UserProgress[]>([]);
  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProgress;
            setUser(userData);
            setActiveScreen('home');
          } else {
            // New user - Auto-create profile
            const randomId = Math.floor(1000 + Math.random() * 9000);
            const defaultUsername = `Explorer_${randomId}`;
            const newUser: UserProgress = {
              ...INITIAL_PROGRESS,
              userId: fUser.uid,
              username: defaultUsername,
              profilePicture: '',
            };
            setUser(newUser);
            await setDoc(doc(db, 'users', fUser.uid), {
              ...newUser,
              lastActive: new Date().toISOString()
            }, { merge: true });
            
            // Increment total users
            try {
              await setDoc(doc(db, 'stats', 'global'), {
                totalUsers: increment(1),
                activeNodes: increment(1),
                [`rankDistribution.${newUser.rank}`]: increment(1)
              }, { merge: true });
            } catch (e) {
              console.error('Error updating global stats:', e);
            }
            
            setActiveScreen('home');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
        }
      } else {
        // Automatically sign in as guest if not authenticated
        try {
          await signInAsGuest();
        } catch (error) {
          console.error('Auto guest sign-in failed:', error);
        }
      }
      setIsAuthReady(true);
      setIsInitialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error('Error reading theme from localStorage:', e);
    }
    return 'dark';
  });

  // Apply theme class to html element
  useEffect(() => {
    const applyTheme = () => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {
        console.error('Error saving theme to localStorage:', e);
      }
    };

    // Apply immediately but also with a tiny delay to ensure consistency
    applyTheme();
    const timer = setTimeout(applyTheme, 0);
    return () => clearTimeout(timer);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Leaderboard Listener
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) return;

    const q = query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserProgress);
      setGlobalUsers(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthReady, refreshKey, firebaseUser]);

  // User Visit & Streak Tracking
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) return;

    const trackVisit = async () => {
      if (!firebaseUser || !db) return;
      
      const today = new Date().toISOString().split('T')[0];
      const visitKey = `visit_${today}`;
      const hasVisited = localStorage.getItem(visitKey);

      if (!hasVisited) {
        try {
          // Streak Logic
          const lastVisit = user.lastVisitDate || '';
          const yesterday = subDays(new Date(), 1).toISOString().split('T')[0];
          
          let newStreak = user.streak || 1;
          if (lastVisit === yesterday) {
            newStreak += 1;
          } else if (lastVisit !== today && lastVisit !== '') {
            newStreak = 1;
          }

          const updatedUser = {
            ...user,
            streak: newStreak,
            lastVisitDate: today,
            lastActive: new Date().toISOString()
          };

          setUser(updatedUser);
          await syncUserToFirestore(updatedUser);

          localStorage.setItem(visitKey, 'true');
        } catch (error) {
          console.error('Streak Update Error:', error);
        }
      }
    };

    trackVisit();
  }, [isAuthReady, firebaseUser]);

  // Sync User Progress to Firestore
  const syncUserToFirestore = async (updatedUser: UserProgress) => {
    if (!firebaseUser) return;
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...updatedUser,
        lastActive: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
  };

  const updatePoints = async (amount: number) => {
    const oldRank = user.rank;
    const newPoints = user.points + amount;
    const newRank = getRank(newPoints);
    const updatedUser = {
      ...user,
      points: newPoints,
      rank: newRank,
      progress: Math.min(100, (newPoints / 1000) * 100),
      lastActive: new Date().toISOString()
    };
    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);

    if (oldRank !== newRank) {
      try {
        await setDoc(doc(db, 'stats', 'global'), {
          [`rankDistribution.${oldRank}`]: increment(-1),
          [`rankDistribution.${newRank}`]: increment(1)
        }, { merge: true });
      } catch (error) {
        console.error('Error updating rank distribution:', error);
      }
    }
  };

  const startQuiz = (category?: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastQuizDate === today) {
      return;
    }

    const activeCategory = category || selectedQuizCategory;

    // Filter by category if needed
    let pool = [...QUIZ_POOL];
    if (activeCategory !== 'All') {
      pool = pool.filter(q => q.category === activeCategory);
    }

    // Shuffle the pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    const count = Math.min(20, pool.length);
    console.log(`Starting quiz with ${count} random questions from a pool of ${pool.length} (Category: ${activeCategory})`);
    
    // Select questions and shuffle their options individually
    const selectedQuestions = pool.slice(0, count).map(q => {
      const values = [q.A, q.B, q.C];
      const correctValue = q[q.correct as keyof Question] as string;
      
      // Fisher-Yates shuffle for options
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }
      
      // Find new correct key ('A', 'B', or 'C')
      const newCorrect = (['A', 'B', 'C'][values.indexOf(correctValue)] || 'A') as "A" | "B" | "C";
      
      return {
        ...q,
        A: values[0],
        B: values[1],
        C: values[2],
        correct: newCorrect
      };
    });
    
    setQuizQuestions(selectedQuestions);
    setCurrentQuizIndex(0);
    setQuizAnswers({});
    setQuizResult(null);
    setActiveScreen('quiz');
  };

  const handleLessonComplete = async (lesson: Lesson) => {
    const today = new Date().toISOString().split('T')[0];
    const isNewLesson = !user.completedLessons.includes(lesson.id);
    const hasBeenRewardedToday = user.lastLessonRewardDate === today;
    
    const oldRank = user.rank;
    let newPoints = user.points;
    let pointsEarned = 0;

    // Only reward points if not already rewarded today
    if (!hasBeenRewardedToday) {
      pointsEarned = lesson.points;
      newPoints += pointsEarned;
    }

    const newRank = getRank(newPoints);
    const updatedUser: UserProgress = {
      ...user,
      completedLessons: isNewLesson ? [...user.completedLessons, lesson.id] : user.completedLessons,
      lastLessonId: lesson.id,
      lastActive: new Date().toISOString(),
      points: newPoints,
      rank: newRank,
      progress: Math.min(100, (newPoints / 1000) * 100),
      lastLessonRewardDate: pointsEarned > 0 ? today : user.lastLessonRewardDate
    };

    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);

    if (pointsEarned > 0 && oldRank !== newRank) {
      try {
        await setDoc(doc(db, 'stats', 'global'), {
          [`rankDistribution.${oldRank}`]: increment(-1),
          [`rankDistribution.${newRank}`]: increment(1)
        }, { merge: true });
      } catch (error) {
        console.error('Error updating rank distribution:', error);
      }
    }
    
    setActiveScreen('home');
  };

  const handleQuizComplete = async (finalScore: number) => {
    const oldRank = user.rank;
    const newPoints = user.points + finalScore;
    const newRank = getRank(newPoints);
    const updatedUser = {
      ...user,
      points: newPoints,
      rank: newRank,
      progress: Math.min(100, (newPoints / 1000) * 100),
      lastQuizDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString()
    };
    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);

    if (oldRank !== newRank) {
      try {
        await setDoc(doc(db, 'stats', 'global'), {
          [`rankDistribution.${oldRank}`]: increment(-1),
          [`rankDistribution.${newRank}`]: increment(1)
        }, { merge: true });
      } catch (error) {
        console.error('Error updating rank distribution:', error);
      }
    }
    
    setQuizResult({ points: finalScore, rank: getRank(updatedUser.points) });
    setActiveScreen('reward');
  };

  const handleSpin = async (reward: number) => {
    const oldRank = user.rank;
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = user.lastSpinDate !== today;
    const currentDailyCount = isNewDay ? 0 : (user.dailySpinCount || 0);
    const isFreeSpin = currentDailyCount < 5;
    const spinCost = isFreeSpin ? 0 : 50;
    const isJackpot = reward >= 1000;
    
    const newDailyCount = currentDailyCount + 1;
    const newPoints = user.points - spinCost + reward;
    const newRank = getRank(newPoints);
    
    const updatedUser: UserProgress = {
      ...user,
      points: newPoints,
      rank: newRank,
      progress: Math.min(100, (newPoints / 1000) * 100),
      lastActive: new Date().toISOString(),
      totalSpins: (user.totalSpins || 0) + 1,
      pointsSpentOnSpins: (user.pointsSpentOnSpins || 0) + spinCost,
      jackpotRewards: (user.jackpotRewards || 0) + (isJackpot ? 1 : 0),
      dailySpinCount: newDailyCount,
      lastSpinDate: today
    };

    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);

    // Update global stats
    try {
      const globalUpdate: any = {
        totalSpins: increment(1),
        pointsSpentOnSpins: increment(spinCost),
        jackpotRewards: increment(isJackpot ? 1 : 0)
      };

      if (oldRank !== newRank) {
        globalUpdate[`rankDistribution.${oldRank}`] = increment(-1);
        globalUpdate[`rankDistribution.${newRank}`] = increment(1);
      }

      await setDoc(doc(db, 'stats', 'global'), globalUpdate, { merge: true });
    } catch (error) {
      console.error('Error updating global stats for spin:', error);
    }
  };

  const handleMemoryGameComplete = async (reward: number) => {
    const oldRank = user.rank;
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = user.lastMemoryGameDate !== today;
    const currentDailyCount = isNewDay ? 0 : (user.dailyMemoryGameCount || 0);
    
    const newDailyCount = currentDailyCount + 1;
    const newPoints = user.points + reward;
    const newRank = getRank(newPoints);
    
    const updatedUser: UserProgress = {
      ...user,
      points: newPoints,
      rank: newRank,
      progress: Math.min(100, (newPoints / 1000) * 100),
      lastActive: new Date().toISOString(),
      dailyMemoryGameCount: newDailyCount,
      lastMemoryGameDate: today
    };

    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);

    if (oldRank !== newRank) {
      try {
        await setDoc(doc(db, 'stats', 'global'), {
          [`rankDistribution.${oldRank}`]: increment(-1),
          [`rankDistribution.${newRank}`]: increment(1)
        }, { merge: true });
      } catch (error) {
        console.error('Error updating rank distribution:', error);
      }
    }
  };

  const handleReset = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const handleCheckin = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastCheckinDate === today) {
      return false;
    }

    const oldRank = user.rank;
    const newPoints = user.points + 5;
    const newRank = getRank(newPoints);
    const updatedUser = {
      ...user,
      points: newPoints,
      rank: newRank,
      progress: Math.min(100, (newPoints / 1000) * 100),
      lastCheckinDate: today,
      lastActive: new Date().toISOString()
    };
    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);

    if (oldRank !== newRank) {
      try {
        await setDoc(doc(db, 'stats', 'global'), {
          [`rankDistribution.${oldRank}`]: increment(-1),
          [`rankDistribution.${newRank}`]: increment(1)
        }, { merge: true });
      } catch (error) {
        console.error('Error updating rank distribution:', error);
      }
    }
    return true;
  };

  const handleRefreshLeaderboard = () => {
    setRefreshKey(prev => prev + 1);
  };

  const goBack = () => {
    if (activeScreen === 'lesson-detail') {
      setActiveScreen('learn');
    } else if (activeScreen === 'quiz') {
      setActiveScreen('tasks');
    } else if (activeScreen === 'reward') {
      setActiveScreen('home');
    } else {
      setActiveScreen('home');
    }
  };

  const renderScreen = () => {
    if (isInitialLoading) return null;
    
    switch (activeScreen) {
      case 'home': return <HomeScreen user={user} onNavigate={setActiveScreen} onStartLesson={(l) => { setSelectedLesson(l); setActiveScreen('lesson-detail'); }} onStartQuiz={startQuiz} onCheckin={handleCheckin} />;
      case 'learn': return <LearnScreen user={user} onSelectLesson={(l) => { setSelectedLesson(l); setActiveScreen('lesson-detail'); }} />;
      case 'tasks': return <TasksScreen user={user} onNavigate={setActiveScreen} onStartQuiz={startQuiz} onStartLesson={(l) => { setSelectedLesson(l); setActiveScreen('lesson-detail'); }} onCheckin={handleCheckin} selectedCategory={selectedQuizCategory} onSelectCategory={setSelectedQuizCategory} />;
      case 'leaderboard': return <LeaderboardScreen user={user} globalUsers={globalUsers} onRefresh={handleRefreshLeaderboard} />;
      case 'spin': return <SpinWheel user={user} onSpin={handleSpin} onBack={() => setActiveScreen('home')} />;
      case 'memory-game': return <MemoryGame user={user} onGameComplete={handleMemoryGameComplete} onBack={() => setActiveScreen('home')} />;
      case 'lesson-detail': return selectedLesson ? <LessonDetail lesson={selectedLesson} user={user} onBack={() => setActiveScreen('learn')} onComplete={() => handleLessonComplete(selectedLesson)} /> : null;
      case 'quiz': return <QuizScreen questions={quizQuestions} currentIndex={currentQuizIndex} onComplete={handleQuizComplete} onNext={() => setCurrentQuizIndex(prev => prev + 1)} />;
      case 'reward': return quizResult ? <RewardScreen result={quizResult} onHome={() => setActiveScreen('home')} onLearn={() => setActiveScreen('learn')} /> : null;
      case 'jtbot': return <Jtbot onClose={() => setActiveScreen('home')} />;
      default: return <HomeScreen user={user} onNavigate={setActiveScreen} onStartLesson={(l) => { setSelectedLesson(l); setActiveScreen('lesson-detail'); }} onStartQuiz={startQuiz} onCheckin={handleCheckin} />;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background-deep space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-button/20 border-t-primary-button rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <VerseLogo size={24} showText={false} />
          </div>
        </div>
        <p className="text-text-secondary text-xs uppercase tracking-[0.2em] font-bold animate-pulse">Initializing Verse</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto h-screen flex flex-col overflow-hidden relative">
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-6">
        {activeScreen !== 'home' && (
          <BackButton onClick={goBack} />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {['home', 'learn', 'tasks', 'leaderboard'].includes(activeScreen) && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-nav-bg border-t border-white/10 flex justify-around py-3 px-2 z-50">
          <NavItem icon={<Home size={24} />} label="Home" active={activeScreen === 'home'} onClick={() => setActiveScreen('home')} />
          <NavItem icon={<BookOpen size={24} />} label="Learn" active={activeScreen === 'learn'} onClick={() => setActiveScreen('learn')} />
          <NavItem icon={<CheckSquare size={24} />} label="Tasks" active={activeScreen === 'tasks'} onClick={() => setActiveScreen('tasks')} />
          <NavItem icon={<Trophy size={24} />} label="Leaderboard" active={activeScreen === 'leaderboard'} onClick={() => setActiveScreen('leaderboard')} />
        </nav>
      )}
      </div>
    </ErrorBoundary>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("nav-item", active ? "active" : "inactive")}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// --- Screens ---

function HomeScreen({ user, onNavigate, onStartLesson, onStartQuiz, onCheckin }: { user: UserProgress, onNavigate: (s: Screen) => void, onStartLesson: (l: Lesson) => void, onStartQuiz: () => void, onCheckin: () => Promise<boolean> }) {
  const lastLesson = LESSONS.find(l => l.id === user.lastLessonId) || LESSONS[0];
  const today = new Date().toISOString().split('T')[0];
  const hasCheckedIn = user.lastCheckinDate === today;
  const hasTakenQuiz = user.lastQuizDate === today;

  // Daily Lesson Logic: Changes every day based on the day of the year
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyLessonIndex = dayOfYear % LESSONS.length;
  const dailyLesson = LESSONS[dailyLessonIndex];
  const isDailyLessonCompleted = user.completedLessons.includes(dailyLesson.id);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <VerseLogo size={40} showText={false} />
          <div className="h-8 w-[1px] bg-border-subtle" />
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight leading-none">Verse Hub</h1>
            <p className="text-text-secondary text-[10px] uppercase tracking-widest font-medium">By Bitcoin.com</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a 
            href="https://analytics.vgdh.io/itskosi2.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-verse-start/30 border text-primary-button hover:bg-primary-button/10 transition-colors shadow-lg"
          >
            <BarChart2 size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Analytics</span>
          </a>
        </div>
      </header>

      {/* Stats Card */}
      <div className="glass-card p-5 glow-border space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wider">Total Points</p>
            <p className="text-3xl font-bold text-primary-button">{user.points}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-text-secondary text-xs uppercase tracking-wider">Rank</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getRankInfo(user.points).badge}</span>
              <p className="text-xl font-bold" style={{ color: getRankInfo(user.points).color }}>{user.rank}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{Math.round(user.progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-secondary-end" 
              initial={{ width: 0 }}
              animate={{ width: `${user.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Daily Tasks</h2>
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-start/20 rounded-lg text-secondary-end">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="font-medium">Daily Check-in</p>
              <p className="text-xs text-success">+5 pts</p>
            </div>
          </div>
          <button 
            disabled={hasCheckedIn}
            onClick={async () => {
              const success = await onCheckin();
              if (success) {
                // Optional: show toast or feedback
              }
            }} 
            className={cn("text-xs font-bold uppercase", hasCheckedIn ? "text-text-secondary" : "text-primary-button")}
          >
            {hasCheckedIn ? 'Completed' : 'Check-in'}
          </button>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-button/20 rounded-lg text-primary-button">
              <Award size={20} />
            </div>
            <div>
              <p className="font-medium">Pass 1 Quiz</p>
              <p className="text-xs text-success">+20 pts</p>
            </div>
          </div>
          <button 
            disabled={hasTakenQuiz}
            onClick={() => onStartQuiz()} 
            className={cn("text-xs font-bold uppercase", hasTakenQuiz ? "text-text-secondary" : "text-primary-button")}
          >
            {hasTakenQuiz ? 'Completed' : 'Start Task'}
          </button>
        </div>

        {/* Spin Wheel Promo */}
        <div className="glass-card p-4 flex items-center justify-between border-primary-button/20 bg-primary-button/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-button/20 rounded-lg text-primary-button">
              <RotateCw size={20} />
            </div>
            <div>
              <p className="font-medium">Spin & Win</p>
              <p className="text-xs text-text-secondary">Try your luck for 10 pts</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('spin')}
            className="text-xs font-bold uppercase text-primary-button"
          >
            Play Now
          </button>
        </div>

        {/* Memory Game Promo */}
        <div className="glass-card p-4 flex items-center justify-between border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
              <Zap size={20} />
            </div>
            <div>
              <p className="font-medium">Verse Flip</p>
              <p className="text-xs text-text-secondary">Match pairs & earn points</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('memory-game')}
            className="text-xs font-bold uppercase text-cyan-400"
          >
            Play Now
          </button>
        </div>
      </section>

      {/* Daily Lesson */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Daily Lesson</h2>
          <span className="text-[10px] text-accent-glow font-bold uppercase tracking-widest bg-accent-glow/10 px-2 py-0.5 rounded">New Every Day</span>
        </div>
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onStartLesson(dailyLesson)}
          className="glass-card p-5 glow-border cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={80} />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-verse-start/20 flex items-center justify-center text-verse-start">
                <BookOpen size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Today's Topic</span>
            </div>
            <div>
              <h3 className="text-xl font-bold group-hover:text-primary-button transition-colors">{dailyLesson.title}</h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">Master this essential crypto concept and earn points toward your next rank.</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-success">+{dailyLesson.points} Points</span>
                {isDailyLessonCompleted && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-success uppercase">
                    <CheckSquare size={10} /> Completed
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-primary-button flex items-center gap-1">
                {isDailyLessonCompleted ? 'Review' : 'Start Lesson'} <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Continue Learning */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Continue Learning</h2>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{lastLesson.title}</p>
            <p className="text-xs text-text-secondary">Lesson Progress: {user.completedLessons.includes(lastLesson.id) ? '100%' : '0%'}</p>
          </div>
          <button onClick={() => onStartLesson(lastLesson)} className="btn-secondary py-2 px-4 text-xs">Resume</button>
        </div>
      </section>

      {/* Community Links */}
      <section className="space-y-4">
        <div className="glass-card p-6 glow-border text-center space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-verse-start to-verse-end p-0.5 shadow-lg">
              <div className="w-full h-full rounded-2xl bg-nav-bg flex items-center justify-center">
                <VerseLogo size={32} showText={false} />
              </div>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Join the Verse Community!</h2>
            <p className="text-text-secondary text-xs">Build, Connect & Earn in the Verse Ecosystem</p>
          </div>

          <div className="space-y-3">
            <a 
              href="https://t.me/GetVerse/177601" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#15803d] text-white shadow-lg hover:scale-[1.02] transition-transform group"
            >
              <div className="flex items-center gap-3">
                <Users size={24} />
                <span className="font-bold">Join the Verse Community</span>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <a 
              href="https://t.me/GetVerse/486213" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-verse-start to-verse-end text-white shadow-lg hover:scale-[1.02] transition-transform group"
            >
              <div className="flex items-center gap-3">
                <Laptop size={24} />
                <span className="font-bold">Vibe Coding with Verse</span>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <a 
              href="https://t.me/GetVerse/476423" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-verse-end to-verse-start text-white shadow-lg hover:scale-[1.02] transition-transform group"
            >
              <div className="flex items-center gap-3">
                <BarChart2 size={24} />
                <span className="font-bold">Verse Research</span>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="flex items-center justify-center gap-2 text-text-secondary text-xs">
              <LinkIcon size={14} className="rotate-45" />
              <span>Connect, Build & Earn Rewards! 🔨💰</span>
            </div>
            
            <div className="flex items-center justify-center gap-6 opacity-60">
              <VerseLogo size={24} />
              <div className="h-4 w-[1px] bg-white/20" />
              <BitcoinLogo size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Jtbot FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('jtbot')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-button rounded-full shadow-2xl flex items-center justify-center text-white z-40 glow-border"
      >
        <Bot size={28} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background-deep animate-pulse" />
      </motion.button>
    </div>
  );
}

function LearnScreen({ user, onSelectLesson }: { user: UserProgress, onSelectLesson: (l: Lesson) => void }) {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <VerseLogo size={40} showText={false} />
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight leading-none">Verse Hub</h1>
            <p className="text-text-secondary text-[10px] uppercase tracking-widest font-medium">Learning Path</p>
          </div>
        </div>
        <a 
          href="https://analytics.vgdh.io/itskosi2.vercel.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-verse-start/30 border text-primary-button hover:bg-primary-button/10 transition-colors shadow-lg"
        >
          <BarChart2 size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Analytics</span>
        </a>
      </header>

      <div className="space-y-4">
        {LESSONS.map((lesson, i) => (
          <button 
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            className="w-full text-left glass-card p-5 flex items-center justify-between group hover:glow-border transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold", 
                user.completedLessons.includes(lesson.id) ? "bg-success/20 text-success" : "bg-secondary-start/20 text-secondary-end")}>
                {user.completedLessons.includes(lesson.id) ? <CheckSquare size={20} /> : i + 1}
              </div>
              <div>
                <h3 className="font-bold">{lesson.title}</h3>
                <p className="text-xs text-text-secondary">Earn {lesson.points} Points</p>
              </div>
            </div>
            <ChevronRight className="text-text-secondary group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      <section className="glass-card p-5 border-error/30 bg-error/5">
        <div className="flex items-center gap-2 text-error mb-2">
          <AlertTriangle size={20} />
          <h3 className="font-bold">Crypto Safety</h3>
        </div>
        <ul className="text-sm space-y-2 text-text-secondary">
          <li>• Never share your private keys</li>
          <li>• Avoid fake giveaways</li>
          <li>• Verify links before clicking</li>
          <li>• If it sounds too good, it's a scam</li>
        </ul>
      </section>
    </div>
  );
}

function LessonDetail({ lesson, user, onBack, onComplete }: { lesson: Lesson, user: UserProgress, onBack: () => void, onComplete: () => void }) {
  const isCompleted = user.completedLessons.includes(lesson.id);
  const today = new Date().toISOString().split('T')[0];
  const hasLessonReward = user.lastLessonRewardDate === today;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <h1 className="text-xl font-bold truncate">{lesson.title}</h1>
      </header>

      <div className="glass-card p-6 prose prose-invert max-w-none">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </div>

      <button 
        onClick={onComplete} 
        className={cn(
          "w-full py-4 rounded-xl font-bold transition-all",
          isCompleted 
            ? "bg-white/5 border border-white/10 text-text-secondary cursor-default" 
            : "btn-primary"
        )}
      >
        {isCompleted 
          ? 'Lesson Completed' 
          : hasLessonReward 
            ? 'Complete Lesson' 
            : `Complete Lesson & Earn ${lesson.points} Pts`
        }
      </button>
      
      {isCompleted ? (
        <p className="text-center text-xs text-text-secondary italic">
          You've already completed this lesson.
        </p>
      ) : hasLessonReward && (
        <p className="text-center text-xs text-text-secondary italic">
          Daily reward already claimed. You can still complete this for progress!
        </p>
      )}
    </div>
  );
}

function TasksScreen({ user, onNavigate, onStartQuiz, onStartLesson, onCheckin, selectedCategory, onSelectCategory }: { user: UserProgress, onNavigate: (s: Screen) => void, onStartQuiz: (cat?: string) => void, onStartLesson: (l: Lesson) => void, onCheckin: () => Promise<boolean>, selectedCategory: string, onSelectCategory: (cat: string) => void }) {
  const incompleteLesson = LESSONS.find(l => !user.completedLessons.includes(l.id));
  const today = new Date().toISOString().split('T')[0];
  const hasCheckedIn = user.lastCheckinDate === today;
  const hasTakenQuiz = user.lastQuizDate === today;
  const hasLessonReward = user.lastLessonRewardDate === today;

  const categories = ['All', ...Array.from(new Set(QUIZ_POOL.map(q => q.category))).filter(Boolean) as string[]];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <VerseLogo size={40} showText={false} />
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight leading-none">Verse Hub</h1>
            <p className="text-text-secondary text-[10px] uppercase tracking-widest font-medium">Tasks</p>
          </div>
        </div>
        <a 
          href="https://analytics.vgdh.io/itskosi2.vercel.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-verse-start/30 border text-primary-button hover:bg-primary-button/10 transition-colors shadow-lg"
        >
          <BarChart2 size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Analytics</span>
        </a>
      </header>

      <div className="space-y-4">
        {/* Category Selection */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-text-secondary">
            <Layout size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Quiz Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                  selectedCategory === cat 
                    ? "bg-primary-button border-primary-button text-white shadow-[0_0_10px_rgba(247,147,26,0.3)]" 
                    : "bg-white/5 border-white/10 text-text-secondary hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="p-2 bg-secondary-start/20 rounded-lg text-secondary-end">
                <CheckSquare size={24} />
              </div>
              <div>
                <h3 className="font-bold">Daily Check-in</h3>
                <p className="text-xs text-text-secondary">Claim your daily reward</p>
              </div>
            </div>
            <span className={cn("font-bold", hasCheckedIn ? "text-text-secondary" : "text-success")}>
              {hasCheckedIn ? 'Claimed' : '+5 Pts'}
            </span>
          </div>
          <button 
            disabled={hasCheckedIn}
            onClick={onCheckin} 
            className="w-full btn-secondary py-2 disabled:opacity-50"
          >
            {hasCheckedIn ? 'Already Checked In' : 'Check-in Now'}
          </button>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="p-2 bg-secondary-start/20 rounded-lg text-secondary-end">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-bold">Daily Lesson</h3>
                <p className="text-xs text-text-secondary">
                  {hasLessonReward ? 'Daily reward claimed' : 'Complete any lesson to earn points'}
                </p>
              </div>
            </div>
            <span className={cn("font-bold", hasLessonReward ? "text-text-secondary" : "text-success")}>
              {hasLessonReward ? 'Claimed' : '+5 Pts'}
            </span>
          </div>
          <button 
            onClick={() => {
              const lessonToStart = incompleteLesson || LESSONS[0];
              onStartLesson(lessonToStart);
            }} 
            className="w-full btn-secondary py-2"
          >
            {incompleteLesson ? 'Start New Lesson' : 'Review Lessons'}
          </button>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="p-2 bg-primary-button/20 rounded-lg text-primary-button">
                <Award size={24} />
              </div>
              <div>
                <h3 className="font-bold">Daily Quiz</h3>
                <p className="text-xs text-text-secondary">Test your knowledge</p>
              </div>
            </div>
            <span className={cn("font-bold", hasTakenQuiz ? "text-text-secondary" : "text-success")}>
              {hasTakenQuiz ? 'Claimed' : '+20 Pts'}
            </span>
          </div>
          <button 
            disabled={hasTakenQuiz}
            onClick={() => onStartQuiz()} 
            className="w-full btn-primary py-2 disabled:opacity-50"
          >
            {hasTakenQuiz ? 'Quiz Completed Today' : 'Start Quiz'}
          </button>
        </div>

        <div className="glass-card p-5 space-y-4 border-primary-button/20 bg-primary-button/5">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="p-2 bg-primary-button/20 rounded-lg text-primary-button">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold">Ask Jtbot</h3>
                <p className="text-xs text-text-secondary">Get help from our AI assistant</p>
              </div>
            </div>
            <Sparkles size={16} className="text-primary-button animate-pulse" />
          </div>
          <button 
            onClick={() => onNavigate('jtbot')} 
            className="w-full btn-primary py-2"
          >
            Chat with Jtbot
          </button>
        </div>
      </div>

      {/* Jtbot FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('jtbot')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-button rounded-full shadow-2xl flex items-center justify-center text-white z-40 glow-border"
      >
        <Bot size={28} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background-deep animate-pulse" />
      </motion.button>
    </div>
  );
}

function QuizScreen({ questions, currentIndex, onComplete, onNext }: { questions: Question[], currentIndex: number, onComplete: (score: number) => void, onNext: () => void }) {
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  
  const [timer, setTimer] = useState(5);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Timer logic
  useEffect(() => {
    if (showFeedback || isTimeUp) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, showFeedback, isTimeUp]);

  // Reset for new question
  useEffect(() => {
    setTimer(5);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsTimeUp(false);
  }, [currentIndex]);

  const handleTimeout = () => {
    setIsTimeUp(true);
    setShowFeedback(true);
    setTimeout(() => {
      handleNext();
    }, 500); // 0.5s wait on timeout
  };

  const handleAnswer = (ans: string) => {
    if (showFeedback || isTimeUp) return;
    
    setSelectedAnswer(ans);
    setShowFeedback(true);
    
    if (ans === currentQuestion.correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      handleNext();
    }, 1000); // 1s feedback delay
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      onNext();
    } else {
      onComplete(score);
    }
  };

  const getTimerColor = () => {
    if (timer >= 3) return "#FFFFFF";
    if (timer === 2) return "#F7931A";
    return "#EF4444";
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-text-primary">Question {currentIndex + 1} of {questions.length}</h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{currentQuestion.category || 'General'}</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-sm font-bold" style={{ color: getTimerColor() }}>{timer}s</span>
             <span className="text-text-secondary text-sm">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-secondary-end" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      <div className="space-y-6">
        <div className="glass-card p-6 min-h-[120px] flex items-center justify-center text-center">
          <h2 className="text-xl font-medium leading-relaxed">
            {isTimeUp ? <span className="text-error font-bold">Time Up!</span> : currentQuestion.question}
          </h2>
        </div>
        
        <div className="space-y-3">
          {['A', 'B', 'C'].map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = currentQuestion.correct === opt;
            
            let stateClasses = "bg-[#1A2A5A] border-white/10 hover:bg-white/10";
            if (showFeedback) {
              if (isCorrect) stateClasses = "bg-success/20 border-success text-success glow-border";
              else if (isSelected) stateClasses = "bg-error/20 border-error text-error glow-border";
            } else if (isSelected) {
              stateClasses = "bg-secondary-start/20 border-secondary-end glow-border";
            }

            return (
              <button
                key={opt}
                disabled={showFeedback}
                onClick={() => handleAnswer(opt)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all",
                  stateClasses
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold", 
                    isSelected ? "bg-secondary-end text-white" : "bg-white/10 text-text-secondary",
                    showFeedback && isCorrect && "bg-success text-white",
                    showFeedback && isSelected && !isCorrect && "bg-error text-white"
                  )}>
                    {opt}
                  </span>
                  <span>{currentQuestion[opt as keyof Question]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-text-secondary text-sm">
        Score: {score}
      </div>
    </div>
  );
}

function RewardScreen({ result, onHome, onLearn }: { result: { points: number, rank: string }, onHome: () => void, onLearn: () => void }) {
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
        className="w-32 h-32 bg-primary-button rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(247,147,26,0.6)] relative"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
        >
          <Trophy size={64} className="text-white" />
        </motion.div>
        
        {/* Animated rings */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.5, 2] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          className="absolute inset-0 border-2 border-primary-button rounded-full"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-success drop-shadow-lg">+{result.points} Points Earned</h1>
        <p className="text-text-secondary text-lg">Incredible achievement! You're mastering the Verse.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 w-full glow-border flex flex-col items-center"
      >
        <p className="text-text-secondary text-xs uppercase tracking-[0.2em] mb-2">New Milestone Reached</p>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getRankInfo(result.points).badge}</span>
          <p className="text-3xl font-bold" style={{ color: getRankInfo(result.points).color }}>
            {result.rank}
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full space-y-3"
      >
        <button onClick={onLearn} className="w-full btn-secondary py-4 text-lg font-bold shadow-lg hover:scale-[1.02] transition-transform">
          Continue Your Journey
        </button>
        <button 
          onClick={onHome} 
          className="w-full py-4 text-sm font-bold uppercase tracking-widest text-primary-button hover:text-white transition-colors"
        >
          Return to Hub
        </button>
      </motion.div>
    </div>
  );
}

function LeaderboardScreen({ user, globalUsers, onRefresh }: { user: UserProgress, globalUsers: UserProgress[], onRefresh: () => void }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const activeUsers = globalUsers.filter(u => {
    const lastActive = new Date(u.lastActive).getTime();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return lastActive >= oneDayAgo;
  }).length;

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <VerseLogo size={40} showText={false} />
          <div className="h-8 w-[1px] bg-border-subtle" />
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight leading-none">Verse Hub</h1>
            <p className="text-text-secondary text-[10px] uppercase tracking-widest font-medium">Leaderboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="https://analytics.vgdh.io/itskosi2.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-verse-start/30 border text-primary-button hover:bg-primary-button/10 transition-colors shadow-lg"
          >
            <BarChart2 size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Analytics</span>
          </a>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.15em] text-primary-button hover:text-white transition-colors flex items-center gap-2",
              isRefreshing && "opacity-50"
            )}
          >
            {isRefreshing && <RefreshCw size={10} className="animate-spin" />}
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </header>

      <div className="space-y-1">
        <div className="flex gap-4">
          <div className="flex-1 glass-card p-3 flex flex-col items-center">
            <span className="text-xs text-text-secondary uppercase tracking-wider">Total Users</span>
            <span className="text-lg font-bold text-primary-button">{globalUsers.length}</span>
          </div>
          <div className="flex-1 glass-card p-3 flex flex-col items-center">
            <span className="text-xs text-text-secondary uppercase tracking-wider">Active Users</span>
            <span className="text-lg font-bold text-accent-glow">{activeUsers}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Global Rankings</h2>
          <span className="text-[10px] text-text-secondary uppercase font-medium">Updated Live</span>
        </div>
        
        {/* Your Position Card (if not in top 50) */}
        {!globalUsers.some(u => u.userId === user.userId) && (
          <div className="glass-card p-4 flex items-center gap-4 border-primary-button/30 bg-primary-button/5 mb-6">
            <div className="w-8 text-center font-bold text-lg text-text-secondary">
              ?
            </div>
            <div className="w-10 h-10 rounded-full glass-card p-0.5 overflow-hidden border-white/10 border shrink-0">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-white/5">
                  <User size={20} className="text-text-secondary" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary-button">{user.username}</span>
                <span className="text-sm">{getRankInfo(user.points).badge}</span>
                <span className="text-[10px] bg-primary-button/20 text-primary-button px-1.5 py-0.5 rounded uppercase font-bold">You</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-[10px]" style={{ color: getRankInfo(user.points).color }}>{user.rank}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary-button">{user.points.toLocaleString()}</div>
              <div className="text-[10px] text-text-secondary uppercase tracking-tighter">Points</div>
            </div>
          </div>
        )}

        {globalUsers.length === 0 ? (
          <div className="glass-card p-8 text-center space-y-2">
            <Trophy size={48} className="mx-auto text-white/20" />
            <p className="text-text-secondary">No users yet. Start learning to be #1!</p>
          </div>
        ) : (
          globalUsers.map((entry, index) => {
            const isMe = entry.userId === user.userId;
            const rank = index + 1;
            
            let rankColor = "text-text-secondary";
            if (rank === 1) rankColor = "text-[#FFD700]"; // Gold
            if (rank === 2) rankColor = "text-[#C0C0C0]"; // Silver
            if (rank === 3) rankColor = "text-[#CD7F32]"; // Bronze

            return (
              <motion.div
                key={entry.userId || `user-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "glass-card p-4 flex items-center gap-4 transition-all duration-300",
                  isMe && "border-primary-button/50 shadow-[0_0_15px_rgba(247,147,26,0.3)] bg-primary-button/5"
                )}
              >
                <div className={cn("w-8 text-center font-bold text-lg", rankColor)}>
                  {rank}
                </div>
                <div className="w-10 h-10 rounded-full glass-card p-0.5 overflow-hidden border-white/10 border shrink-0">
                  {entry.profilePicture ? (
                    <img src={entry.profilePicture} alt={entry.username} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-white/5">
                      <User size={20} className="text-text-secondary" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-bold", isMe && "text-primary-button")}>
                      {entry.username}
                    </span>
                    <span className="text-sm" title={entry.rank}>{getRankInfo(entry.points).badge}</span>
                    {isMe && <span className="text-[10px] bg-primary-button/20 text-primary-button px-1.5 py-0.5 rounded uppercase font-bold">You</span>}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[10px]" style={{ color: getRankInfo(entry.points).color }}>{entry.rank}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-button">{entry.points.toLocaleString()}</div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-tighter">Points</div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}


