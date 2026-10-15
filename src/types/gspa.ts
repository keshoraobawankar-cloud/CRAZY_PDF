export type ThemeColor = 'obsidian' | 'editorial' | 'titanium' | 'emerald' | 'navy';

export type PaperSize = 'letter' | 'a4';
export type PageOrientation = 'portrait' | 'landscape';

export interface TargetMetric {
  id: string;
  name: string;
  start: string;
  target: string;
  current: string;
}

export interface SkillItem {
  id: string;
  category: 'Nutrition' | 'Training' | 'Recovery' | 'Mindset';
  title: string;
  description: string;
  keyPractice: string;
}

export interface PerformanceBenchmark {
  id: string;
  metric: string;
  weeklyTarget: string;
  unit: string;
  currentScore?: string;
}

export interface HabitAction {
  id: string;
  category: 'Nutrition' | 'Training' | 'Recovery' | 'Rhythm';
  title: string;
  timeOfDay: 'Morning' | 'Day' | 'Evening' | 'Anytime';
  frequency: string; // e.g. "7/7", "4/7"
  targetMetric: string; // e.g. "180g", "45 min", "3L"
  daysCompleted: boolean[]; // 7 days: M, T, W, T, F, S, S
}

export interface GSPAData {
  id: string;
  // Branding & Coach Info
  businessName: string;
  brandTagline: string;
  trainerName: string;
  trainerCredentials: string;
  clientName: string;
  cyclePeriod: string; // e.g. "Week 1 of 4 · Hypertrophy Phase"
  contactInfo: string;
  logoUrl: string | null;
  logoWidth: number; // in pixels for rendering
  monogramInitials: string;

  // Aesthetic settings
  theme: ThemeColor;
  paperSize: PaperSize;
  orientation: PageOrientation;
  sheetMode: 'blank-for-print' | 'digital-tracking';

  // G - Goals
  primaryGoal: string;
  whyStatement: string;
  targetDate: string;
  targetMetrics: TargetMetric[];

  // S - Skills
  skills: SkillItem[];

  // P - Performance
  benchmarks: PerformanceBenchmark[];
  passingScorePercent: number; // e.g. 85

  // A - Actions (Daily Habit Log)
  habits: HabitAction[];
  
  // Weekly Review & Accountability
  coachNotes: string;
  weeklyWins: string;
  weeklyChallenges: string;
  clientCommitmentStatement: string;
  dateSigned: string;
}
