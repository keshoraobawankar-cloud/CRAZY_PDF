import React, { useEffect, useRef, useState } from 'react';
import { initThreeScene } from './threeSetup';
import { GameEngine, GameState, GameStats } from './gameEngine';
import { soundFX } from './audio';
import { 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Shield, 
  Zap, 
  Award,
  Pause,
  Sparkles
} from 'lucide-react';

interface GameShellProps {
  onExitGame: () => void;
  clientName?: string;
}

export const GameShell: React.FC<GameShellProps> = ({ onExitGame, clientName }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('title');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    habitsCollected: 0,
    comboStreak: 1,
    health: 100,
    maxHealth: 100,
    currentWave: 1,
    totalWaves: 3,
    gspaMultiplier: 1.5,
    dashCooldownRemaining: 0,
  });
  const [isMuted, setIsMuted] = useState(soundFX.isMuted);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const sceneContext = initThreeScene(mountRef.current);

    // Initialize Game Engine
    const engine = new GameEngine(
      sceneContext.scene,
      sceneContext.camera,
      sceneContext.renderer
    );

    engine.onStateChange = (state) => {
      setGameState(state);
    };

    engine.onStatsUpdate = (newStats) => {
      setStats(newStats);
    };

    engine.startLoop();
    engineRef.current = engine;

    return () => {
      engine.dispose();
      sceneContext.cleanup();
    };
  }, []);

  const handleStartGame = () => {
    engineRef.current?.startGame();
  };

  const handleResume = () => {
    engineRef.current?.resumeGame();
  };

  const handleRestart = () => {
    engineRef.current?.restartGame();
  };

  const toggleSound = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Mount (Isolated from React DOM updates) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* ========================================================= */}
      {/* TITLE SCREEN (GAME SHELL SPEC: LIVE CAMERA PAN + SVG TITLE) */}
      {/* ========================================================= */}
      {gameState === 'title' && (
        <div className="absolute inset-0 flex flex-col justify-between p-8 sm:p-12 z-20 pointer-events-auto">
          {/* Top Bar with Return & Mute */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onExitGame}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Habit Tracker
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className="p-2 text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              title="Toggle Web Audio Synth"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>
          </div>

          {/* Hero Center Lockup over 30-40% Negative Space */}
          <div className="max-w-xl mx-auto text-center flex flex-col items-center">
            {/* Bespoke Inline SVG Title Lockup */}
            <div className="mb-4">
              <svg width="340" height="74" viewBox="0 0 340 74" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
                <rect x="2" y="2" width="336" height="70" rx="8" stroke="url(#accentGrad)" strokeWidth="2" strokeDasharray="6 4" />
                <path d="M18 37L32 18H58L44 56H28L18 37Z" fill="url(#coreGrad)" />
                <text x="70" y="32" fill="#F8FAFC" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="19" letterSpacing="0.1em">
                  APEX KINETIC
                </text>
                <text x="70" y="52" fill="#38BDF8" fontFamily="'JetBrains Mono', monospace" fontWeight="600" fontSize="11" letterSpacing="0.22em">
                  GSPA DISCIPLINE ARENA
                </text>
                <defs>
                  <linearGradient id="accentGrad" x1="0" y1="0" x2="340" y2="74" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" />
                    <stop offset="0.5" stopColor="#0284C7" />
                    <stop offset="1" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="coreGrad" x1="18" y1="18" x2="58" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" />
                    <stop offset="1" stopColor="#0284C7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md leading-relaxed">
              Your personal training discipline manifested in 3D. Collect GSPA habit runes, trigger athletic power surges, and evade distraction drones.
            </p>

            {/* Primary Start CTA */}
            <button
              type="button"
              onClick={handleStartGame}
              className="px-8 py-3.5 text-sm font-display font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-sky-400 to-amber-400 hover:from-sky-300 hover:to-amber-300 rounded-xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Enter Arena (Space or Enter)
            </button>
          </div>

          {/* Single Flat Control-Hint Line */}
          <div className="text-center">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800">
              WASD Move · Space Dash/Slam · Esc Pause
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PLAYING HUD (LOW OCCLUSION: <15% VIEWPORT, POINTER-EVENTS NONE) */}
      {/* ========================================================= */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-20">
          {/* Top Status Bar (Perimeter Clusters in Game World Palette) */}
          <div className="flex items-start justify-between w-full">
            {/* Health & Wave Cluster */}
            <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-500/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-400 uppercase">Athlete Health</span>
                  <span className="font-bold tabular-nums text-slate-100">{stats.health}%</span>
                </div>
                <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-150 ${
                      stats.health > 40 ? 'bg-sky-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stats.health}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Wave & Combo Center */}
            <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Wave {stats.currentWave} / {stats.totalWaves}
              </div>
              <div className="text-base font-display font-extrabold text-amber-400 tabular-nums">
                {stats.comboStreak}x Discipline Combo
              </div>
            </div>

            {/* Score & Mute / Pause Controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Discipline Score
                </span>
                <span className="text-base font-display font-black text-sky-400 tabular-nums">
                  {stats.score.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => engineRef.current?.pauseGame()}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors"
                title="Pause Game (Esc)"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Dash & Habit Progress Indicator */}
          <div className="flex items-end justify-between w-full">
            <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-xl flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Dash / Slam (Space)
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {stats.dashCooldownRemaining <= 0 ? (
                    <span className="text-emerald-400">READY</span>
                  ) : (
                    <span className="text-amber-400 tabular-nums">
                      {stats.dashCooldownRemaining.toFixed(1)}s
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Habits Collected
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                {stats.habitsCollected} Runes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAUSE MODAL */}
      {/* ========================================================= */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="font-display font-bold text-xl text-white">
              Training Paused
            </h3>
            <p className="text-xs text-slate-400">
              Catch your breath. Ready to re-engage the discipline gauntlet?
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleResume}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors"
              >
                Resume Training (Esc)
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                Restart Wave
              </button>
              <button
                type="button"
                onClick={onExitGame}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Exit to Habit Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GAME OVER MODAL */}
      {/* ========================================================= */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-950 border border-rose-500/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-white">
              Session Fatigue Reached
            </h3>
            <p className="text-xs text-slate-400">
              Distraction drones interrupted your kinetic momentum. Rest, rehydrate, and attack the next cycle!
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left font-mono text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Final Score:</span>
                <span className="text-white font-bold tabular-nums">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Habits Secured:</span>
                <span className="text-emerald-400 font-bold tabular-nums">{stats.habitsCollected}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors"
              >
                Re-enter Arena (Space)
              </button>
              <button
                type="button"
                onClick={onExitGame}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Return to Tracker & PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VICTORY MODAL */}
      {/* ========================================================= */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-950 border border-amber-500/40 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-white">
              GSPA Arena Mastery!
            </h3>
            <p className="text-xs text-slate-300">
              Outstanding consistency, {clientName || 'Athlete'}! You completed all 3 waves of the GSPA Discipline Arena with supreme execution.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left font-mono text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Total Score:</span>
                <span className="text-amber-400 font-bold tabular-nums">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discipline Multiplier:</span>
                <span className="text-sky-400 font-bold tabular-nums">{stats.gspaMultiplier}x</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GSPA Rating:</span>
                <span className="text-emerald-400 font-bold">ELITE ADHERENCE</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-sky-400 to-amber-400 hover:opacity-90 rounded-lg transition-opacity"
              >
                Play Again (Space)
              </button>
              <button
                type="button"
                onClick={onExitGame}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Return to Tracker & PDF Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
