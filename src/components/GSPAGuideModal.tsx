import React from 'react';
import { X, Target, Award, Dumbbell, CheckCircle2, ArrowRight } from 'lucide-react';

interface GSPAGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GSPAGuideModal: React.FC<GSPAGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-900 text-white font-display font-bold text-xs flex items-center justify-center">
                G
              </span>
              <span className="w-5 h-5 rounded bg-slate-900 text-white font-display font-bold text-xs flex items-center justify-center">
                S
              </span>
              <span className="w-5 h-5 rounded bg-slate-900 text-white font-display font-bold text-xs flex items-center justify-center">
                P
              </span>
              <span className="w-5 h-5 rounded bg-slate-900 text-white font-display font-bold text-xs flex items-center justify-center">
                A
              </span>
              <h3 className="font-display font-bold text-base text-slate-900 ml-1">
                The GSPA Framework Guide
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Goals · Skills · Performance · Actions for Personal Training
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Why GSPA */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
            <h4 className="font-display font-bold text-slate-900 text-sm mb-1.5">
              Why Typical Habit Checklists Fail Personal Training Clients
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard habit trackers ask clients to check boxes without anchoring them to identity, skills, or concrete progression. 
              The <strong>GSPA model</strong> (rooted in behavioral coaching and sports science) bridges the gap between high-level dreams and daily micro-habits.
            </p>
          </div>

          {/* 4 Pillars Breakdown */}
          <div className="space-y-4">
            {/* G - Goals */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded bg-slate-900 text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
                  G
                </span>
                <h5 className="font-display font-bold text-slate-950 text-xs uppercase tracking-wide">
                  Goals (The Destination & The Purpose)
                </h5>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                The tangible outcome the client desires (e.g. 15% body fat, 140kg squat, running 5k pain-free). Crucially, this must include the client’s deep <em>“Why”</em>—the emotional fuel that sustains effort when motivation dips.
              </p>
              <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-700">
                Example: "Build 1.5kg lean muscle & lower body fat to 15% to maintain boundless energy for executive leadership."
              </div>
            </div>

            {/* S - Skills */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded bg-slate-900 text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
                  S
                </span>
                <h5 className="font-display font-bold text-slate-950 text-xs uppercase tracking-wide">
                  Skills (The Capabilities Needed)
                </h5>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Clients do not fail goals because they lack will; they fail because they lack specific competencies. We break success into 4 pillars:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4 mb-2">
                <li><strong>Nutrition:</strong> Macronutrient awareness, meal preparation, satiety control.</li>
                <li><strong>Training:</strong> Progressive overload, tempo control, recovery autoregulation.</li>
                <li><strong>Recovery:</strong> Sleep hygiene, parasympathetic down-regulation, hydration floor.</li>
                <li><strong>Mindset:</strong> Routine consistency, environment design, rebound resilience.</li>
              </ul>
            </div>

            {/* P - Performance */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded bg-slate-900 text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
                  P
                </span>
                <h5 className="font-display font-bold text-slate-950 text-xs uppercase tracking-wide">
                  Performance (The Measurable Benchmarks)
                </h5>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Quantitative metrics that prove skills are actively developing. Instead of only weighing in, we measure compliance metrics (e.g., hitting protein 6 of 7 days, completing 4 resistance sessions, 9,000 steps daily average).
              </p>
              <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-700">
                Target Standard: ≥85% Weekly Compliance provides guaranteed physiological adaptation.
              </div>
            </div>

            {/* A - Actions */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded bg-slate-900 text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
                  A
                </span>
                <h5 className="font-display font-bold text-slate-950 text-xs uppercase tracking-wide">
                  Actions (The Daily Habit Matrix)
                </h5>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                The atomic, daily behaviors executed with specific time cues (Morning, Mid-day, Evening). Every single action in the daily log is tied to a specific Skill and Performance benchmark.
              </p>
              <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-700">
                Action: "Morning hydration: 600ml water + pinch of sea salt upon rising."
              </div>
            </div>
          </div>

          {/* Personal Trainer Pro Tip */}
          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
            <span className="font-bold text-slate-800">Trainer Pro-Tip:</span> Print out a clean blank sheet for your client to physically pin to their refrigerator or keep in their gym bag. Physical pen-on-paper checkoffs create 40% higher tactile dopamine reward loops than digital app notifications.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
