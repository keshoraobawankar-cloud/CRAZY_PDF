import React from 'react';
import { GSPAData, HabitAction } from '../types/gspa';
import { 
  Target, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Dumbbell, 
  Apple, 
  Moon, 
  Compass, 
  Activity,
  Award,
  UploadCloud
} from 'lucide-react';

interface GSPAPdfSheetProps {
  data: GSPAData;
  onUpdateHabit?: (habitId: string, dayIndex: number, completed: boolean) => void;
  onOpenLogoModal?: () => void;
}

export const GSPAPdfSheet: React.FC<GSPAPdfSheetProps> = ({
  data,
  onUpdateHabit,
  onOpenLogoModal,
}) => {
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Calculate compliance statistics
  const totalPossibleChecks = data.habits.length * 7;
  const totalCompletedChecks = data.habits.reduce(
    (sum, habit) => sum + habit.daysCompleted.filter(Boolean).length,
    0
  );
  const compliancePercentage = totalPossibleChecks > 0 
    ? Math.round((totalCompletedChecks / totalPossibleChecks) * 100) 
    : 0;

  // Day by day counts
  const dayCompletedCounts = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) =>
    data.habits.filter((h) => h.daysCompleted[dayIdx]).length
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Nutrition':
        return <Apple className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Training':
        return <Dumbbell className="w-3.5 h-3.5 text-sky-600" />;
      case 'Recovery':
        return <Moon className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Rhythm':
      case 'Mindset':
        return <Compass className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  // Color theme mapping
  const themeStyles = {
    obsidian: {
      primary: 'bg-slate-900 text-white',
      borderAccent: 'border-slate-900',
      headerBg: 'bg-slate-900 text-white',
      subHeaderBg: 'bg-slate-100 text-slate-800',
      badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
      tagline: 'text-slate-500',
      pill: 'bg-slate-900 text-white',
      accentText: 'text-slate-900',
      activeCheckbox: 'bg-slate-900 text-white border-slate-900',
      lightTint: 'bg-slate-50/70',
    },
    editorial: {
      primary: 'bg-neutral-900 text-white',
      borderAccent: 'border-neutral-900',
      headerBg: 'bg-neutral-900 text-white',
      subHeaderBg: 'bg-neutral-100 text-neutral-800',
      badgeBg: 'bg-neutral-100 text-neutral-900 border-neutral-300',
      tagline: 'text-neutral-500',
      pill: 'bg-neutral-900 text-white',
      accentText: 'text-neutral-900',
      activeCheckbox: 'bg-neutral-900 text-white border-neutral-900',
      lightTint: 'bg-neutral-50/80',
    },
    titanium: {
      primary: 'bg-zinc-800 text-white',
      borderAccent: 'border-zinc-800',
      headerBg: 'bg-zinc-900 text-white',
      subHeaderBg: 'bg-zinc-100 text-zinc-800',
      badgeBg: 'bg-zinc-100 text-zinc-900 border-zinc-300',
      tagline: 'text-zinc-500',
      pill: 'bg-zinc-800 text-white',
      accentText: 'text-zinc-800',
      activeCheckbox: 'bg-zinc-800 text-white border-zinc-800',
      lightTint: 'bg-zinc-50/70',
    },
    emerald: {
      primary: 'bg-emerald-800 text-white',
      borderAccent: 'border-emerald-800',
      headerBg: 'bg-emerald-950 text-white',
      subHeaderBg: 'bg-emerald-50 text-emerald-900',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      tagline: 'text-emerald-700',
      pill: 'bg-emerald-800 text-white',
      accentText: 'text-emerald-800',
      activeCheckbox: 'bg-emerald-700 text-white border-emerald-700',
      lightTint: 'bg-emerald-50/40',
    },
    navy: {
      primary: 'bg-blue-950 text-white',
      borderAccent: 'border-blue-950',
      headerBg: 'bg-blue-950 text-white',
      subHeaderBg: 'bg-blue-50 text-blue-900',
      badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
      tagline: 'text-blue-600',
      pill: 'bg-blue-950 text-white',
      accentText: 'text-blue-950',
      activeCheckbox: 'bg-blue-900 text-white border-blue-900',
      lightTint: 'bg-blue-50/30',
    },
  }[data.theme || 'obsidian'];

  const isBlankMode = data.sheetMode === 'blank-for-print';

  return (
    <div
      id="gspa-printable-document"
      className="pdf-page bg-white text-slate-900 text-[12px] leading-relaxed mx-auto w-full max-w-[850px] shadow-sm transition-all"
      style={{
        minHeight: '1100px',
        boxSizing: 'border-box',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* ========================================================= */}
      {/* TOP HEADER: BRANDING, LOGO SPACE, TRAINER & CLIENT META */}
      {/* ========================================================= */}
      <header className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Brand & Logo Zone */}
          <div className="flex items-start gap-4">
            {/* Custom Logo or Monogram slot */}
            <div
              onClick={onOpenLogoModal}
              title="Click to customize business logo"
              className="cursor-pointer group relative shrink-0 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-800 bg-slate-50 transition-colors overflow-hidden rounded"
              style={{
                width: `${Math.min(Math.max(data.logoWidth || 120, 80), 160)}px`,
                height: '64px',
              }}
            >
              {data.logoUrl ? (
                <img
                  src={data.logoUrl}
                  alt={data.businessName || 'Business Logo'}
                  className="w-full h-full object-contain p-1"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-display font-bold text-xs tracking-wider">
                    {data.monogramInitials || 'PT'}
                  </div>
                  <span className="text-[9px] font-medium tracking-tight text-slate-500 mt-1 flex items-center gap-1 group-hover:text-slate-900">
                    <UploadCloud className="w-2.5 h-2.5" /> Logo Slot
                  </span>
                </div>
              )}
            </div>

            {/* Business Wordmark & Tagline */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Client Performance Architecture
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  GSPA Framework
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-slate-950 uppercase mt-0.5">
                {data.businessName || 'PERSONAL TRAINING ENTERPRISE'}
              </h1>
              <p className="text-[11px] text-slate-600 font-medium">
                {data.brandTagline || 'Evidence-Based Habit & Strength Progression Protocol'}
              </p>
            </div>
          </div>

          {/* Right Meta Block (Trainer & Contact) */}
          <div className="text-left sm:text-right text-[11px] space-y-0.5 shrink-0 sm:border-l sm:border-slate-200 sm:pl-4">
            <div>
              <span className="text-slate-400 uppercase text-[9px] tracking-wider block">Head Coach</span>
              <span className="font-bold text-slate-900">{data.trainerName || 'Coach Name'}</span>
              {data.trainerCredentials && (
                <span className="text-slate-500 text-[10px] block">{data.trainerCredentials}</span>
              )}
            </div>
            {data.contactInfo && (
              <p className="text-slate-500 text-[10px] font-mono pt-1">
                {data.contactInfo}
              </p>
            )}
          </div>
        </div>

        {/* Client Protocol Banner Row */}
        <div className="mt-3.5 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50/80 p-2.5 rounded border border-slate-200/60">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">Client</span>
            <span className="font-bold text-slate-950 text-[12px]">{data.clientName || 'Client Name'}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">Cycle / Phase</span>
            <span className="font-semibold text-slate-900">{data.cyclePeriod || 'Week 1 · Foundation'}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">Target Horizon</span>
            <span className="font-semibold text-slate-900">{data.targetDate || '6-Week Horizon'}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">Protocol Target</span>
            <span className="font-bold font-mono text-slate-950">{data.passingScorePercent || 85}% Compliance</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* SECTION 1: GOALS (G in GSPA) */}
      {/* ========================================================= */}
      <section className="mb-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-slate-900 text-white font-display font-bold text-[11px] flex items-center justify-center">
              G
            </span>
            <h2 className="text-[13px] font-display font-bold tracking-tight uppercase text-slate-900">
              Goals Architecture · Primary Outcome & The "Why"
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Outcome Anchors & Identity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Primary Goal & The Deep Why (7 cols) */}
          <div className="md:col-span-7 space-y-2">
            <div className="border border-slate-200 rounded p-2.5 bg-white">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block mb-0.5">
                Primary Tangible Goal
              </span>
              <p className="font-semibold text-slate-950 text-[12px] leading-snug">
                {data.primaryGoal || 'Define client target milestone'}
              </p>
            </div>

            <div className="border border-slate-200 rounded p-2.5 bg-slate-50/60">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-700">
                  The Driving "Why" (Internal Catalyst)
                </span>
              </div>
              <p className="text-[11px] text-slate-700 italic leading-snug">
                "{data.whyStatement || 'The intrinsic reason achieving this goal matters deeply.'}"
              </p>
            </div>
          </div>

          {/* Metric Milestones Table (5 cols) */}
          <div className="md:col-span-5 border border-slate-200 rounded p-2 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-600">
                Key Progress Benchmarks
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Start → Target</span>
            </div>
            <div className="space-y-1.5">
              {data.targetMetrics.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-[10px] border-b border-slate-50 pb-1">
                  <span className="font-medium text-slate-800 truncate pr-2 max-w-[130px]">{m.name}</span>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-slate-400 line-through decoration-slate-300">{isBlankMode ? '___' : m.start}</span>
                    <span className="text-slate-300">→</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1 py-0.5 rounded">{isBlankMode ? '___' : m.target}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-slate-500 text-right pt-1 font-mono">
              Target Deadline: <strong className="text-slate-800">{data.targetDate}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: SKILLS (S in GSPA) */}
      {/* ========================================================= */}
      <section className="mb-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-slate-900 text-white font-display font-bold text-[11px] flex items-center justify-center">
              S
            </span>
            <h2 className="text-[13px] font-display font-bold tracking-tight uppercase text-slate-900">
              Skills Foundations · Core Competencies to Master
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Capacities that guarantee the goal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {data.skills.map((skill) => (
            <div
              key={skill.id}
              className="border border-slate-200 rounded p-2.5 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    {getCategoryIcon(skill.category)} {skill.category}
                  </span>
                </div>
                <h3 className="font-bold text-[11px] text-slate-950 leading-snug mb-1">
                  {skill.title}
                </h3>
                <p className="text-[10px] text-slate-600 leading-normal">
                  {skill.description}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-100">
                <span className="text-[8.5px] uppercase font-bold text-slate-400 block">Key Practice</span>
                <span className="text-[9.5px] font-medium text-slate-800 block leading-tight">
                  {skill.keyPractice}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: PERFORMANCE (P in GSPA) */}
      {/* ========================================================= */}
      <section className="mb-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-slate-900 text-white font-display font-bold text-[11px] flex items-center justify-center">
              P
            </span>
            <h2 className="text-[13px] font-display font-bold tracking-tight uppercase text-slate-900">
              Performance Standards · Weekly Benchmarks
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-slate-500 font-medium">Proof of skill execution</span>
            <span className="font-mono font-semibold text-slate-900">
              Target Standard: ≥{data.passingScorePercent}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {data.benchmarks.map((bench) => (
            <div
              key={bench.id}
              className="border border-slate-200 rounded p-2 bg-slate-50/50 flex flex-col justify-between"
            >
              <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider truncate">
                {bench.metric}
              </span>
              <div className="my-1 flex items-baseline justify-between">
                <span className="text-[13px] font-display font-extrabold text-slate-900 font-mono">
                  {isBlankMode ? '____' : (bench.currentScore || '---')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Goal: <strong className="text-slate-700">{bench.weeklyTarget}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded"
                  style={{
                    width: isBlankMode ? '0%' : '85%',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: ACTIONS - DAILY HABIT LOG (A in GSPA) */}
      {/* ========================================================= */}
      <section className="mb-4">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-slate-900 text-white font-display font-bold text-[11px] flex items-center justify-center">
              A
            </span>
            <h2 className="text-[13px] font-display font-bold tracking-tight uppercase text-slate-900">
              Actions Protocol · Daily Habit & Compliance Matrix
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            {!isBlankMode && (
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                Weekly Adherence: {compliancePercentage}% ({totalCompletedChecks}/{totalPossibleChecks})
              </span>
            )}
            <span className="text-slate-500 italic hidden sm:inline">
              Daily micro-behaviors that drive macro results
            </span>
          </div>
        </div>

        {/* Master Daily Habit Table */}
        <div className="border border-slate-300 rounded overflow-hidden">
          <table className="w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="bg-slate-900 text-white font-display text-[10px] tracking-wider uppercase">
                <th className="py-2 px-2.5 font-bold w-[42%]">Habit / Daily Action Protocol</th>
                <th className="py-2 px-1 text-center font-bold w-[12%]">Cue / Cadence</th>
                <th className="py-2 px-1 text-center font-bold w-[10%]">Target</th>
                {daysOfWeek.map((day) => (
                  <th key={day} className="py-2 px-1 text-center font-bold w-[5%] border-l border-slate-700">
                    {day}
                  </th>
                ))}
                <th className="py-2 px-1 text-center font-bold w-[6%] border-l border-slate-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {data.habits.map((habit, habitIdx) => {
                const habitTotal = habit.daysCompleted.filter(Boolean).length;
                return (
                  <tr
                    key={habit.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      habitIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {/* Habit Title + Category Icon */}
                    <td className="py-2 px-2.5">
                      <div className="flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">{getCategoryIcon(habit.category)}</span>
                        <div>
                          <span className="font-semibold text-slate-900 leading-snug block">
                            {habit.title}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Time / Cue */}
                    <td className="py-2 px-1 text-center text-[10px] text-slate-600 font-medium">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9.5px]">
                        {habit.timeOfDay}
                      </span>
                    </td>

                    {/* Target Metric / Frequency */}
                    <td className="py-2 px-1 text-center text-[10px] font-mono text-slate-700">
                      <span className="font-semibold">{habit.targetMetric}</span>
                      <span className="block text-[8.5px] text-slate-400">{habit.frequency}</span>
                    </td>

                    {/* Mon - Sun Checkboxes */}
                    {daysOfWeek.map((_, dayIdx) => {
                      const isChecked = !isBlankMode && habit.daysCompleted[dayIdx];
                      return (
                        <td
                          key={dayIdx}
                          className="py-1.5 px-0.5 text-center border-l border-slate-200"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (!isBlankMode && onUpdateHabit) {
                                onUpdateHabit(habit.id, dayIdx, !isChecked);
                              }
                            }}
                            disabled={isBlankMode}
                            className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition-all ${
                              isBlankMode
                                ? 'border border-slate-300 bg-white cursor-default'
                                : isChecked
                                ? `${themeStyles.activeCheckbox} shadow-xs scale-105`
                                : 'border border-slate-300 hover:border-slate-500 bg-white text-transparent'
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                            {isBlankMode && <Circle className="w-2.5 h-2.5 text-slate-300" />}
                          </button>
                        </td>
                      );
                    })}

                    {/* Total Checked */}
                    <td className="py-2 px-1 text-center border-l border-slate-200 font-mono font-bold text-[11px] text-slate-900">
                      {isBlankMode ? '___' : `${habitTotal}/7`}
                    </td>
                  </tr>
                );
              })}

              {/* Daily Completion Summary Row */}
              <tr className="bg-slate-100/90 font-mono text-[10px] font-bold border-t-2 border-slate-300">
                <td colSpan={3} className="py-1.5 px-2.5 text-slate-700 text-right uppercase tracking-wider text-[9px]">
                  Daily Completed Habit Score:
                </td>
                {dayCompletedCounts.map((count, idx) => (
                  <td key={idx} className="py-1.5 px-0.5 text-center border-l border-slate-200 text-slate-900 font-extrabold">
                    {isBlankMode ? '___' : `${count}`}
                  </td>
                ))}
                <td className="py-1.5 px-1 text-center border-l border-slate-200 text-slate-900 font-extrabold">
                  {isBlankMode ? '___' : `${totalCompletedChecks}`}
                </td>
              </tr>

              {/* Water / Hydration Tracking Row */}
              <tr className="bg-white text-[10px] border-t border-slate-200">
                <td colSpan={3} className="py-1.5 px-2.5 text-slate-600 font-medium flex items-center justify-between">
                  <span className="font-semibold text-slate-800">💧 Daily Hydration Floor (Target: 3.0L)</span>
                  <span className="text-[9px] text-slate-400 font-mono">1 glass = 500ml</span>
                </td>
                {daysOfWeek.map((day, idx) => (
                  <td key={idx} className="py-1.5 px-0.5 text-center border-l border-slate-200">
                    <div className="flex justify-center items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full border border-sky-400 inline-block bg-sky-50"></span>
                      <span className="w-2 h-2 rounded-full border border-sky-400 inline-block bg-sky-50"></span>
                      <span className="w-2 h-2 rounded-full border border-sky-400 inline-block bg-sky-50"></span>
                    </div>
                  </td>
                ))}
                <td className="py-1.5 px-1 text-center border-l border-slate-200 font-mono text-[9px] text-slate-400">
                  Daily
                </td>
              </tr>

              {/* Daily Step Count / NEAT Row */}
              <tr className="bg-slate-50/50 text-[10px] border-t border-slate-200">
                <td colSpan={3} className="py-1.5 px-2.5 text-slate-600 font-medium">
                  <span className="font-semibold text-slate-800">👟 Total Daily Step Count (NEAT)</span>
                </td>
                {daysOfWeek.map((day, idx) => (
                  <td key={idx} className="py-1 px-0.5 text-center border-l border-slate-200 font-mono text-[9px] text-slate-400">
                    _____
                  </td>
                ))}
                <td className="py-1 px-1 text-center border-l border-slate-200 font-mono text-[9px] text-slate-400">
                  Avg
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: ACCOUNTABILITY, COACH NOTES & SIGN-OFF */}
      {/* ========================================================= */}
      <section className="mb-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Client Reflection & Weekly Review (7 cols) */}
          <div className="md:col-span-7 space-y-2">
            <div className="border border-slate-200 rounded p-2.5 bg-white">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block mb-0.5">
                Weekly Wins & Breakthroughs
              </span>
              <p className="text-[11px] text-slate-800 leading-snug">
                {data.weeklyWins || 'Record notable accomplishments, milestone lifts, or mindset triumphs.'}
              </p>
            </div>

            <div className="border border-slate-200 rounded p-2.5 bg-white">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block mb-0.5">
                Challenges & Adjustments for Next Week
              </span>
              <p className="text-[11px] text-slate-800 leading-snug">
                {data.weeklyChallenges || 'Key obstacles identified and the specific tactical pivot to be made.'}
              </p>
            </div>
          </div>

          {/* Coach Feedback & Formal Sign-off Agreement (5 cols) */}
          <div className="md:col-span-5 border border-slate-200 rounded p-2.5 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-slate-700" />
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-900">
                  Coach Guidance & Assessment
                </span>
              </div>
              <p className="text-[10.5px] text-slate-700 leading-snug italic">
                "{data.coachNotes || 'Personal trainer review, form focus, and encouragement for the upcoming week.'}"
              </p>
            </div>

            {/* Signature Agreement Block */}
            <div className="mt-3 pt-2 border-t border-slate-300/80 space-y-2">
              <p className="text-[8.5px] text-slate-500 leading-tight">
                {data.clientCommitmentStatement}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="border-b border-slate-900 pb-0.5 min-h-[16px] text-[10px] font-mono font-semibold text-slate-800">
                    {isBlankMode ? '' : data.clientName}
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 block mt-0.5">
                    Client Signature / Ack
                  </span>
                </div>
                <div>
                  <div className="border-b border-slate-900 pb-0.5 min-h-[16px] text-[10px] font-mono font-semibold text-slate-800">
                    {isBlankMode ? '' : data.trainerName}
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 block mt-0.5">
                    Coach Verification
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-mono pt-0.5">
                <span>Date: {isBlankMode ? '_______________' : (data.dateSigned || 'Oct 14, 2026')}</span>
                <span>Audit Ref: #{data.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* DOCUMENT FOOTER: PRINT READY LEGAL & BRANDING */}
      {/* ========================================================= */}
      <footer className="mt-4 pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-400 font-mono gap-1">
        <div>
          <span>© {new Date().getFullYear()} {data.businessName || 'Apex Performance Lab'}. All rights reserved.</span>
          <span className="mx-1">·</span>
          <span>Personal Training Client Confidential</span>
        </div>
        <div>
          <span>GSPA Model: Goals · Skills · Performance · Actions</span>
          <span className="mx-1">·</span>
          <span>Page 1 of 1</span>
        </div>
      </footer>
    </div>
  );
};
