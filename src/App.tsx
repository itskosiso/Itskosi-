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
  TrendingUp,
  Activity,
  Layout,
  Camera,
  Upload,
  Globe,
  RefreshCw,
  RotateCw,
  Zap,
  Users,
  Laptop,
  Sun,
  Moon,
  Send,
  Twitter,
  Link as LinkIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format, isSameDay, subDays, startOfWeek, addDays, isAfter } from 'date-fns';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { UserProgress, Question, Lesson, getRank, RANK_LIST, getRankInfo, GlobalStats, DailyStats } from './types';
import { LESSONS, QUIZ_POOL } from './data';
import { SpinWheel } from './components/SpinWheel';
import { MemoryGame } from './components/MemoryGame';
import { 
  auth, 
  db, 
  signInWithGoogle, 
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

type Screen = 'home' | 'learn' | 'tasks' | 'leaderboard' | 'profile' | 'lesson-detail' | 'quiz' | 'reward' | 'analytics' | 'signup' | 'spin' | 'memory-game';

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
  const [activeScreen, setActiveScreen] = useState<Screen>('signup');
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
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [activeNodesCount, setActiveNodesCount] = useState(0);

  // Presence and Real-time Analytics Logic
  useEffect(() => {
    if (!isAuthReady || !firebaseUser || !db) return;

    // Use a unique session ID for each tab/device
    const sessionId = Math.random().toString(36).substring(2, 15);
    const presenceRef = doc(db, 'presence', sessionId);

    const updatePresence = async () => {
      try {
        await setDoc(presenceRef, {
          userId: firebaseUser.uid,
          lastSeen: serverTimestamp(),
          sessionId: sessionId
        }, { merge: true });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // Initial presence
    updatePresence();

    // Heartbeat every 1 minute
    const interval = setInterval(updatePresence, 60000);

    // Cleanup on disconnect/unmount
    const cleanup = async () => {
      try {
        await deleteDoc(presenceRef);
      } catch (error) {
        console.error('Error deleting presence:', error);
      }
    };

    window.addEventListener('beforeunload', cleanup);

    // Real-time listener for Active Users and Active Nodes
    const q = query(collection(db, 'presence'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const fiveMinsAgo = now - 5 * 60000;

      const activeSessions = snapshot.docs.map(doc => {
        const data = doc.data() as { userId: string; lastSeen: any };
        // Handle serverTimestamp being null initially
        const lastSeen = data.lastSeen?.toMillis?.() || now;
        return { userId: data.userId, lastSeen };
      });
      
      // Active Nodes = total currently connected sessions
      setActiveNodesCount(activeSessions.length);

      // Active Users = unique users active in last 5 mins
      const recentUsers = new Set(
        activeSessions
          .filter(s => s.lastSeen > fiveMinsAgo)
          .map(s => s.userId)
      );
      setActiveUsersCount(recentUsers.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'presence');
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', cleanup);
      unsubscribe();
      cleanup();
    };
  }, [isAuthReady, firebaseUser, db]);

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
            if (userData.username) {
              setActiveScreen('home');
            } else {
              setActiveScreen('signup');
            }
          } else {
            // New user from Google
            const newUser: UserProgress = {
              ...INITIAL_PROGRESS,
              userId: fUser.uid,
              username: fUser.displayName || '',
              profilePicture: fUser.photoURL || '',
            };
            setUser(newUser);
            setActiveScreen('signup');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
        }
      } else {
        setUser(INITIAL_PROGRESS);
        setActiveScreen('signup');
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

    // Global Stats Listener
    const statsUnsubscribe = onSnapshot(doc(db, 'stats', 'global'), (doc) => {
      if (doc.exists()) {
        setGlobalStats(doc.data() as GlobalStats);
      }
    });

    // Daily Stats Listener (Last 14 days to ensure full week coverage)
    const dailyQ = query(
      collection(db, 'dailyStats'),
      orderBy('date', 'desc'),
      limit(14)
    );
    const dailyUnsubscribe = onSnapshot(dailyQ, (snapshot) => {
      const stats = snapshot.docs.map(doc => doc.data() as DailyStats).reverse();
      setDailyStats(stats);
    });

    return () => {
      unsubscribe();
      statsUnsubscribe();
      dailyUnsubscribe();
    };
  }, [isAuthReady, refreshKey, firebaseUser]);

  const syncGlobalStats = useCallback(async () => {
    if (!db) return;
    try {
      const usersCollection = collection(db, 'users');
      const totalSnapshot = await getCountFromServer(usersCollection);
      const totalCount = totalSnapshot.data().count;

      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const activeTodayQuery = query(usersCollection, where('lastActive', '>=', todayStart.toISOString()));
      const activeTodaySnapshot = await getCountFromServer(activeTodayQuery);
      const activeTodayCount = activeTodaySnapshot.data().count;

      const distribution: Record<string, number> = {};
      await Promise.all(RANK_LIST.map(async (rank) => {
        const rankQuery = query(usersCollection, where('rank', '==', rank.name));
        const rankSnapshot = await getCountFromServer(rankQuery);
        distribution[rank.name] = rankSnapshot.data().count;
      }));

      await setDoc(doc(db, 'stats', 'global'), {
        totalUsers: totalCount,
        rankDistribution: distribution
      }, { merge: true });
    } catch (error) {
      console.error('Sync Global Stats Error:', error);
    }
  }, [db]);

  // Analytics Tracking
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) return;

    const trackVisit = async () => {
      if (!firebaseUser || !db) return;
      
      const today = new Date().toISOString().split('T')[0];
      const visitKey = `visit_${today}`;
      const hasVisited = localStorage.getItem(visitKey);

      // Force sync if global stats are missing or empty
      const statsMissing = !globalStats || !globalStats.rankDistribution || Object.values(globalStats.rankDistribution).reduce((a, b) => a + b, 0) === 0;

      if (!hasVisited || statsMissing) {
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

          await syncGlobalStats();

          // Increment daily stats
          await setDoc(doc(db, 'dailyStats', today), {
            date: today,
            visits: increment(1)
          }, { merge: true });

          localStorage.setItem(visitKey, 'true');
        } catch (error) {
          console.error('Analytics Error:', error);
        }
      }
    };

    trackVisit();
  }, [isAuthReady, firebaseUser, globalStats, syncGlobalStats]); // Added globalStats and syncGlobalStats to dependencies

  const trackEvent = async () => {
    try {
      await setDoc(doc(db, 'stats', 'global'), {
        totalEvents: increment(1)
      }, { merge: true });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

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

  const handleSignup = async (username: string, profilePicture?: string) => {
    if (!firebaseUser) {
      try {
        await signInWithGoogle();
        return true; // Will be handled by onAuthStateChanged
      } catch (error) {
        console.error('Google Sign-In Error:', error);
        return false;
      }
    }

    const trimmed = username.trim();
    if (trimmed.length < 3) {
      return false;
    }

    // Robust uniqueness check using Firestore query
    try {
      const q = query(collection(db, 'users'), where('username', '==', trimmed));
      const querySnapshot = await getDocs(q);
      const isTaken = !querySnapshot.empty && querySnapshot.docs.some(d => d.id !== firebaseUser.uid);
      
      if (isTaken) {
        return false;
      }
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      // Fallback to local check if query fails
      const isTakenLocal = globalUsers.some(u => u.username.toLowerCase() === trimmed.toLowerCase() && u.userId !== firebaseUser.uid);
      if (isTakenLocal) return false;
    }

    const updatedUser = { ...user, username: trimmed, profilePicture: profilePicture || user.profilePicture || '', userId: firebaseUser.uid };
    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);
    
    // Increment total users and update rank distribution
    try {
      await setDoc(doc(db, 'stats', 'global'), {
        totalUsers: increment(1),
        activeNodes: increment(1),
        [`rankDistribution.${updatedUser.rank}`]: increment(1)
      }, { merge: true });
    } catch (error) {
      console.error('Error updating global stats on signup:', error);
    }

    setActiveScreen('home');
    return true;
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
    await trackEvent();

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
    await trackEvent();

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
    await trackEvent();

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
    await trackEvent();

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

  const handleUpdateProfile = async (newUsername: string, profilePicture?: string) => {
    const isTaken = globalUsers.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.userId !== user.userId);
    if (isTaken) {
      return false;
    }
    const updatedUser = { ...user, username: newUsername, profilePicture };
    setUser(updatedUser);
    await syncUserToFirestore(updatedUser);
    return true;
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
    await trackEvent();

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
      case 'signup': return <SignupScreen onSignup={handleSignup} firebaseUser={firebaseUser} />;
      case 'home': return <HomeScreen user={user} onNavigate={setActiveScreen} onStartLesson={(l) => { setSelectedLesson(l); setActiveScreen('lesson-detail'); }} onStartQuiz={startQuiz} onShowAnalytics={() => setActiveScreen('analytics')} onCheckin={handleCheckin} />;
      case 'learn': return <LearnScreen user={user} onSelectLesson={(l) => { setSelectedLesson(l); setActiveScreen('lesson-detail'); }} />;
      case 'tasks': return <TasksScreen user={user} onStartQuiz={startQuiz} onStartLesson={(l) => { setSelectedLesson(l); setActiveScreen('lesson-detail'); }} onCheckin={handleCheckin} selectedCategory={selectedQuizCategory} onSelectCategory={setSelectedQuizCategory} />;
      case 'leaderboard': return <LeaderboardScreen user={user} globalUsers={globalUsers} onRefresh={handleRefreshLeaderboard} />;
      case 'profile': return <ProfileScreen user={user} theme={theme} onToggleTheme={toggleTheme} onUpdateProfile={handleUpdateProfile} onReset={handleReset} />;
      case 'spin': return <SpinWheel user={user} onSpin={handleSpin} onBack={() => setActiveScreen('home')} />;
      case 'memory-game': return <MemoryGame user={user} onGameComplete={handleMemoryGameComplete} onBack={() => setActiveScreen('home')} />;
      case 'lesson-detail': return selectedLesson ? <LessonDetail lesson={selectedLesson} user={user} onBack={() => setActiveScreen('learn')} onComplete={() => handleLessonComplete(selectedLesson)} /> : null;
      case 'quiz': return <QuizScreen questions={quizQuestions} currentIndex={currentQuizIndex} onComplete={handleQuizComplete} onNext={() => setCurrentQuizIndex(prev => prev + 1)} />;
      case 'reward': return quizResult ? <RewardScreen result={quizResult} onHome={() => setActiveScreen('home')} onLearn={() => setActiveScreen('learn')} /> : null;
      case 'analytics': return <AnalyticsScreen globalStats={globalStats} dailyStats={dailyStats} activeUsersCount={activeUsersCount} activeNodesCount={activeNodesCount} onBack={() => setActiveScreen('home')} onRefresh={syncGlobalStats} />;
      default: return <HomeScreen user={user} onNavigate={setActiveScreen} onStartLesson={(l) => { setSelectedLesson(l); setActiveScreen('lesson-detail'); }} onStartQuiz={startQuiz} onShowAnalytics={() => setActiveScreen('analytics')} onCheckin={handleCheckin} />;
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
        {activeScreen !== 'home' && activeScreen !== 'signup' && (
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
      {['home', 'learn', 'tasks', 'leaderboard', 'profile'].includes(activeScreen) && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-nav-bg border-t border-white/10 flex justify-around py-3 px-2 z-50">
          <NavItem icon={<Home size={24} />} label="Home" active={activeScreen === 'home'} onClick={() => setActiveScreen('home')} />
          <NavItem icon={<BookOpen size={24} />} label="Learn" active={activeScreen === 'learn'} onClick={() => setActiveScreen('learn')} />
          <NavItem icon={<CheckSquare size={24} />} label="Tasks" active={activeScreen === 'tasks'} onClick={() => setActiveScreen('tasks')} />
          <NavItem icon={<Trophy size={24} />} label="Leaderboard" active={activeScreen === 'leaderboard'} onClick={() => setActiveScreen('leaderboard')} />
          <NavItem icon={<User size={24} />} label="Profile" active={activeScreen === 'profile'} onClick={() => setActiveScreen('profile')} />
        </nav>
      )}
      </div>
    </ErrorBoundary>
  );
}

function SignupScreen({ onSignup, firebaseUser }: { onSignup: (username: string, pic?: string) => Promise<boolean>, firebaseUser: FirebaseUser | null }) {
  const [username, setUsername] = useState(firebaseUser?.displayName || '');
  const [profilePic, setProfilePic] = useState<string | undefined>(firebaseUser?.photoURL || undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError('Image must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!firebaseUser) {
      setLoading(true);
      try {
        await onSignup(''); // Triggers Google Sign-In
      } catch (e) {
        console.error('Login failed:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    const success = await onSignup(trimmed, profilePic);
    setLoading(false);
    
    if (!success) {
      setError('Username already taken');
    } else {
      setError('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 space-y-12 text-center">
      <div className="flex flex-col items-center gap-8 w-full max-w-xs">
        <div className="flex items-center gap-4">
          <VerseLogo size={64} showText={false} />
          <div className="h-12 w-[1px] bg-border-subtle" />
          <BitcoinLogo size={64} showText={false} />
        </div>
        
        {!firebaseUser ? (
          <div className="space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Welcome to the Verse</h2>
              <p className="text-text-secondary text-sm">Sign in to start your journey and earn rewards.</p>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors shadow-xl"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
        ) : (
          <div className="w-full space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Setup Profile</h1>
              <p className="text-text-secondary text-sm">
                Choose a unique username to represent you in the Verse.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-verse-start to-verse-end p-1 shadow-[0_0_30px_rgba(0,229,255,0.2)] overflow-hidden">
                  <div className="w-full h-full rounded-full bg-nav-bg flex items-center justify-center overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={48} className="text-text-secondary" />
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary-button rounded-full shadow-lg text-white hover:scale-110 transition-transform"
                >
                  <Camera size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Upload Profile Picture</p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="relative">
                  <input 
                    type="text" 
                    value={username}
                    maxLength={15}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Choose your username"
                    className={cn(
                      "w-full bg-surface-subtle border border-border-subtle rounded-2xl p-5 text-center focus:outline-none transition-all focus:ring-4 pr-12",
                      error 
                        ? "border-error focus:border-error focus:ring-error/10" 
                        : "border-verse-start/20 focus:border-verse-start focus:ring-verse-start/10"
                    )}
                  />
                  <span className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold",
                    username.length < 3 ? "text-error" : "text-text-secondary"
                  )}>
                    {username.length}/15
                  </span>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-error text-[10px] font-bold uppercase tracking-wider mt-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <button 
                disabled={loading || !username.trim()}
                onClick={handleSubmit}
                className="w-full btn-secondary py-4 text-lg flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" /> : 'Enter the Verse'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
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

function HomeScreen({ user, onNavigate, onStartLesson, onStartQuiz, onShowAnalytics, onCheckin }: { user: UserProgress, onNavigate: (s: Screen) => void, onStartLesson: (l: Lesson) => void, onStartQuiz: () => void, onShowAnalytics: () => void, onCheckin: () => Promise<boolean> }) {
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
          <button onClick={onShowAnalytics} className="p-2 glass-card rounded-full text-accent-glow">
            <BarChart2 size={20} />
          </button>
          <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full glass-card p-0.5 overflow-hidden border-verse-start/30 border">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center bg-white/5">
                <User size={20} className="text-text-secondary" />
              </div>
            )}
          </button>
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
            <button 
              onClick={() => onNavigate('profile')}
              className="text-[10px] text-accent-glow font-bold uppercase tracking-widest mt-1 hover:underline"
            >
              Edit Profile
            </button>
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

function TasksScreen({ user, onStartQuiz, onStartLesson, onCheckin, selectedCategory, onSelectCategory }: { user: UserProgress, onStartQuiz: (cat?: string) => void, onStartLesson: (l: Lesson) => void, onCheckin: () => Promise<boolean>, selectedCategory: string, onSelectCategory: (cat: string) => void }) {
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
      </div>
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

function AnalyticsScreen({ globalStats, dailyStats, activeUsersCount, activeNodesCount, onBack, onRefresh }: { globalStats: GlobalStats | null, dailyStats: DailyStats[], activeUsersCount: number, activeNodesCount: number, onBack: () => void, onRefresh: () => Promise<void> }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'count' | 'percent'>('count');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const engagementData = useMemo(() => {
    // Generate the current week (Monday to Sunday)
    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
    
    const data = dates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const stat = dailyStats.find(s => s.date === dateStr);
      
      return {
        day: format(date, 'EEE'),
        visits: stat?.visits || 0,
        activeUsers: stat?.activeUsers || 0,
        date: dateStr,
        isToday: isSameDay(date, now),
        isFuture: isAfter(date, now) && !isSameDay(date, now)
      };
    });
    
    const maxVisits = Math.max(...data.map(s => s.visits), 1);
    
    return data.map(item => ({
      ...item,
      // Scale bars relative to max visits, with a minimum height for visibility
      // Future dates have 0 value, past/today have at least 8% height
      value: item.isFuture ? 0 : (item.visits / maxVisits) * 100,
    }));
  }, [dailyStats]);

  const todayStats = dailyStats.find(s => s.date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="space-y-6 pb-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-secondary-end">
          <BarChart2 size={24} />
          <h1 className="text-xl font-bold uppercase tracking-tight">Verse Analytics</h1>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            "p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white transition-all",
            isRefreshing && "animate-spin"
          )}
          title="Refresh Global Stats"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 relative overflow-hidden col-span-2">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-secondary-start/20 rounded-lg text-secondary-end">
              <Users size={20} />
            </div>
          </div>
          <p className="text-4xl font-bold mb-1">{globalStats?.totalUsers || 0}</p>
          <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold">Total Registered Users</p>
        </div>

        <div className="glass-card p-4 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-success/20 rounded-lg text-success">
              <Activity size={20} />
            </div>
            <div className="flex items-center gap-1 text-success text-[8px] font-bold uppercase">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Live
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">{activeUsersCount}</p>
          <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold">Active Users (5m)</p>
        </div>

        <div className="glass-card p-4 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Globe size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">{activeNodesCount}</p>
          <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold">Active Nodes</p>
        </div>

        <div className="glass-card p-4 relative overflow-hidden col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary-button">
              <RotateCw size={20} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Spin Wheel Analytics</h3>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[8px] text-text-secondary uppercase font-bold">Total Spins</p>
              <p className="text-lg font-bold">{globalStats?.totalSpins || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-text-secondary uppercase font-bold">Points Spent</p>
              <p className="text-lg font-bold">{globalStats?.pointsSpentOnSpins || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-text-secondary uppercase font-bold">Jackpots</p>
              <p className="text-lg font-bold">{globalStats?.jackpotRewards || 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 relative overflow-hidden col-span-2">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
              <Trophy size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">{globalStats?.totalEvents || 0}</p>
          <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold">Total Events Participated</p>
        </div>
      </div>

      {/* Weekly Engagement Chart */}
      <div className="glass-card p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-text-secondary text-xs uppercase tracking-widest font-bold">Weekly Engagement</p>
            <p className="text-2xl font-bold">Activity Feed</p>
          </div>
          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <p className="text-text-secondary text-[10px] uppercase font-bold tracking-wider">Mon - Sun</p>
          </div>
        </div>

        {engagementData.length > 0 ? (
          <div className="relative h-64 flex flex-col justify-end">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-10 opacity-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-full border-t border-white" />
              ))}
            </div>

            <div className="flex items-end justify-between h-40 gap-3 relative px-2">
              {engagementData.map((item, i) => (
                <div 
                  key={i} 
                  className="flex-1 flex flex-col items-center h-full group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setHoveredIndex(hoveredIndex === i ? null : i)}
                >
                  <AnimatePresence>
                    {hoveredIndex === i && !item.isFuture && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#1a1a1a] p-3 rounded-2xl shadow-2xl z-20 whitespace-nowrap min-w-[100px] text-center border border-white/10"
                      >
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">{item.day}</p>
                        <p className="text-xs text-white/80 font-mono">visits : {item.visits}</p>
                        {/* Tooltip Arrow */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] rotate-45 border-r border-b border-white/10" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="w-full flex-1 flex items-end justify-center px-0.5 sm:px-1">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${item.isFuture ? 5 : Math.max(12, item.value)}%` }}
                      transition={{ type: "spring", damping: 20, stiffness: 100 }}
                      className={cn(
                        "w-full max-w-[32px] rounded-t-xl transition-all duration-500",
                        item.isToday 
                          ? "bg-cyan-500 shadow-[0_0_20px_rgba(0,229,255,0.4)]" 
                          : item.isFuture
                            ? "bg-zinc-800 opacity-30"
                            : "bg-zinc-400 group-hover:bg-zinc-300"
                      )}
                    />
                  </div>
                  
                  <span className={cn(
                    "mt-4 text-[10px] font-bold uppercase tracking-tighter transition-colors",
                    item.isToday ? "text-cyan-400" : "text-text-secondary"
                  )}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-text-secondary text-sm">
            Insufficient data for weekly chart
          </div>
        )}
      </div>

      {/* Rank Distribution */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-text-secondary text-xs uppercase tracking-widest font-bold">Rank Distribution</p>
            <p className="text-lg font-bold">User Progression</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('count')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                viewMode === 'count' ? "bg-cyan-500 text-white shadow-lg" : "text-text-secondary hover:text-white"
              )}
            >
              Count
            </button>
            <button 
              onClick={() => setViewMode('percent')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                viewMode === 'percent' ? "bg-cyan-500 text-white shadow-lg" : "text-text-secondary hover:text-white"
              )}
            >
              Percent
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {RANK_LIST.map((rank) => {
            const count = globalStats?.rankDistribution?.[rank.name] || 0;
            const total = globalStats?.totalUsers || 1;
            const percentage = (count / total) * 100;
            
            return (
              <div key={rank.name} className="space-y-2 group cursor-default">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{rank.badge}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: rank.color }}>{rank.name}</span>
                      <span className="text-[8px] text-text-secondary uppercase tracking-tighter font-medium">Min. {rank.minPoints} Points</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">
                      {viewMode === 'count' ? `${count} Users` : `${Math.round(percentage)}%`}
                    </p>
                    {viewMode === 'percent' && (
                      <p className="text-[8px] text-text-secondary font-bold uppercase tracking-tighter">{count} Total</p>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", damping: 25, stiffness: 120 }}
                    className="h-full relative"
                    style={{ backgroundColor: rank.color }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ user, theme, onToggleTheme, onUpdateProfile, onReset }: { user: UserProgress, theme: 'light' | 'dark', onToggleTheme: () => void, onUpdateProfile: (name: string, pic?: string) => Promise<boolean>, onReset: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [profilePic, setProfilePic] = useState(user.profilePicture);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setNewUsername(user.username);
      setProfilePic(user.profilePicture);
    }
  }, [user, isEditing]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError('Image must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const trimmed = newUsername.trim();
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (trimmed === user.username && profilePic === user.profilePicture) {
      setIsEditing(false);
      return;
    }
    
    setLoading(true);
    const success = await onUpdateProfile(trimmed, profilePic);
    setLoading(false);
    
    if (success) {
      setIsEditing(false);
      setError('');
      setSuccessMsg('Profile updated successfully!');
    } else {
      setError('Username already taken');
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-center space-y-6">
        <div className="flex items-center gap-4 py-4">
          <VerseLogo size={48} showText={false} />
          <div className="h-10 w-[1px] bg-white/20" />
          <BitcoinLogo size={48} showText={false} />
        </div>
        
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-verse-start to-verse-end p-1 shadow-[0_0_30px_rgba(0,229,255,0.2)] overflow-hidden">
            <div className="w-full h-full rounded-full bg-nav-bg flex items-center justify-center overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={48} className="text-text-secondary" />
              )}
            </div>
          </div>
          {isEditing && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={24} className="text-white" />
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="text-center w-full px-4">
          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-success/20 text-success text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full inline-block mb-4"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Theme Toggle */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Display Theme</p>
            <div className="flex bg-surface-subtle border border-border-subtle p-1 rounded-2xl w-full max-w-[200px] mx-auto">
              <button 
                onClick={() => theme !== 'light' && onToggleTheme()}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all",
                  theme === 'light' ? "bg-card-bg text-text-primary shadow-lg" : "text-text-secondary"
                )}
              >
                <Sun size={14} />
                <span className="text-[10px] font-bold uppercase">Light</span>
              </button>
              <button 
                onClick={() => theme !== 'dark' && onToggleTheme()}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all",
                  theme === 'dark' ? "bg-primary-button text-white shadow-lg" : "text-text-secondary"
                )}
              >
                <Moon size={14} />
                <span className="text-[10px] font-bold uppercase">Dark</span>
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 max-w-[240px] mx-auto">
              <div className="relative">
                <input 
                  type="text" 
                  value={newUsername}
                  maxLength={15}
                  onChange={(e) => {
                    setNewUsername(e.target.value);
                    if (error) setError('');
                  }}
                  className={cn(
                    "w-full bg-surface-subtle border rounded-xl p-3 text-center focus:outline-none transition-all pr-12",
                    error ? "border-error" : "border-border-subtle focus:border-verse-start"
                  )}
                  autoFocus
                />
                <span className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold",
                  newUsername.length < 3 ? "text-error" : "text-text-secondary"
                )}>
                  {newUsername.length}/15
                </span>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-error text-[10px] font-bold uppercase tracking-wider"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl">{getRankInfo(user.points).badge}</span>
                <p className="text-text-secondary text-sm uppercase tracking-widest font-bold" style={{ color: getRankInfo(user.points).color }}>{user.rank} Learner</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-text-secondary text-xs uppercase">Points</p>
          <p className="text-xl font-bold">{user.points}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-text-secondary text-xs uppercase">Streak</p>
          <p className="text-xl font-bold">{user.streak} Days</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Rank Progression</h2>
          <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">
            {RANK_LIST.findIndex(r => r.name === user.rank) + 1} / {RANK_LIST.length}
          </div>
        </div>
        <div className="glass-card p-5 space-y-6">
          <div className="flex justify-between items-center overflow-x-auto pb-4 gap-4 no-scrollbar">
            {RANK_LIST.map((rank, i) => {
              const isUnlocked = user.points >= rank.minPoints;
              const isCurrent = user.rank === rank.name;
              return (
                <div key={rank.name} className="flex flex-col items-center gap-2 min-w-[60px]">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500",
                    isUnlocked ? "bg-surface-subtle border-2" : "bg-black/20 opacity-30 grayscale",
                    isCurrent && "border-primary-button scale-110 shadow-[0_0_15px_rgba(247,147,26,0.4)]"
                  )} style={{ borderColor: isUnlocked ? rank.color : 'transparent' }}>
                    {rank.badge}
                  </div>
                  <p className={cn(
                    "text-[8px] uppercase font-bold tracking-tighter text-center",
                    isUnlocked ? "text-text-primary" : "text-text-secondary"
                  )}>{rank.name}</p>
                </div>
              );
            })}
          </div>
          
          {/* Next Rank Progress */}
          {RANK_LIST.findIndex(r => r.name === user.rank) < RANK_LIST.length - 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                <span className="text-text-secondary">Next Rank: {RANK_LIST[RANK_LIST.findIndex(r => r.name === user.rank) + 1].name}</span>
                <span className="text-primary-button">
                  {user.points} / {RANK_LIST[RANK_LIST.findIndex(r => r.name === user.rank) + 1].minPoints}
                </span>
              </div>
              <div className="h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary-button"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (user.points / RANK_LIST[RANK_LIST.findIndex(r => r.name === user.rank) + 1].minPoints) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-3">
          {user.badges.map((badge, i) => (
            <div key={i} className="glass-card px-4 py-2 flex items-center gap-2 border-accent-glow/20">
              <Award size={16} className="text-primary-button" />
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
          {user.points >= 100 && (
            <div className="glass-card px-4 py-2 flex items-center gap-2 border-accent-glow/20">
              <Award size={16} className="text-primary-button" />
              <span className="text-sm font-medium">Quiz Master</span>
            </div>
          )}
          {user.streak >= 5 && (
            <div className="glass-card px-4 py-2 flex items-center gap-2 border-accent-glow/20">
              <Award size={16} className="text-primary-button" />
              <span className="text-sm font-medium">Daily Streak</span>
            </div>
          )}
        </div>
      </section>

      <div className="space-y-3 pt-4">
        {isEditing ? (
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setIsEditing(false);
                setNewUsername(user.username);
                setError('');
              }}
              className="flex-1 bg-surface-subtle hover:bg-surface-hover text-text-primary font-bold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading || !newUsername.trim() || (newUsername === user.username && profilePic === user.profilePicture)}
              className="flex-1 btn-secondary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full btn-primary"
          >
            Edit Profile
          </button>
        )}
        
        {/* Contact Us Section */}
        <div className="mt-8 pt-6 border-t border-border-subtle space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black">Support & Community</h3>
            <p className="text-[10px] text-text-secondary/60 uppercase tracking-widest font-bold">Connect with the Verse Ecosystem</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="https://t.me/Getverse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-surface-subtle border border-border-subtle hover:border-cyan-500/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-lg">
                <Send size={20} />
              </div>
              <div className="text-center">
                <p className="text-[9px] text-text-secondary uppercase font-black tracking-widest mb-0.5">Telegram</p>
                <p className="text-xs font-black tracking-tight">@Getverse</p>
              </div>
            </a>
            
            <a 
              href="https://twitter.com/VerseEcosystem" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-surface-subtle border border-border-subtle hover:border-purple-400/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-purple-400/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-400 group-hover:text-white transition-all shadow-lg">
                <Twitter size={20} />
              </div>
              <div className="text-center">
                <p className="text-[9px] text-text-secondary uppercase font-black tracking-widest mb-0.5">Twitter</p>
                <p className="text-xs font-black tracking-tight">@VerseEcosystem</p>
              </div>
            </a>
          </div>
        </div>

        {showResetConfirm ? (
          <div className="glass-card p-4 space-y-4 border-error/20">
            <p className="text-sm text-center font-medium">Are you sure you want to reset all data? This will clear your progress and log you out.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-surface-subtle hover:bg-surface-hover py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button 
                onClick={onReset}
                className="flex-1 bg-error/20 hover:bg-error/30 text-error py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Reset Now
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 text-error/60 hover:text-error text-[10px] uppercase tracking-widest font-bold py-4 transition-colors"
          >
            <AlertTriangle size={14} />
            Reset App & Logout
          </button>
        )}
      </div>
    </div>
  );
}
