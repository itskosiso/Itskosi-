export interface Question {
  id: string;
  category: string;
  question: string;
  A: string;
  B: string;
  C: string;
  correct: 'A' | 'B' | 'C';
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  points: number;
}

export interface UserProgress {
  userId: string;
  username: string;
  profilePicture?: string;
  points: number;
  rank: string;
  progress: number;
  lastLessonId?: string;
  completedLessons: string[];
  lastQuizDate?: string;
  lastCheckinDate?: string;
  lastVisitDate?: string;
  lastLessonRewardDate?: string;
  streak: number;
  badges: string[];
  createdAt: string;
  lastActive: string;
  totalSpins?: number;
  pointsSpentOnSpins?: number;
  jackpotRewards?: number;
  dailySpinCount?: number;
  lastSpinDate?: string;
  dailyMemoryGameCount?: number;
  lastMemoryGameDate?: string;
}

export interface LeaderboardEntry {
  username: string;
  points: number;
  rank: number;
}

export interface RankInfo {
  name: string;
  minPoints: number;
  badge: string;
  color: string;
}

export const RANK_LIST: RankInfo[] = [
  { name: 'Novice', minPoints: 0, badge: '🌱', color: '#94A3B8' },
  { name: 'Beginner', minPoints: 100, badge: '🔰', color: '#22C55E' },
  { name: 'Amateur', minPoints: 500, badge: '🥉', color: '#F59E0B' },
  { name: 'Pro', minPoints: 2500, badge: '🥈', color: '#3B82F6' },
  { name: 'Elite', minPoints: 12500, badge: '🥇', color: '#A855F7' },
  { name: 'Legend', minPoints: 62500, badge: '💎', color: '#F43F5E' },
  { name: 'Titan', minPoints: 312500, badge: '👑', color: '#F7931A' },
];

export const getRankInfo = (points: number): RankInfo => {
  for (let i = RANK_LIST.length - 1; i >= 0; i--) {
    if (points >= RANK_LIST[i].minPoints) {
      return RANK_LIST[i];
    }
  }
  return RANK_LIST[0];
};

export const getRank = (points: number) => getRankInfo(points).name;
