import React, { useState } from 'react';
import { GSPAData, HabitAction, TargetMetric, PerformanceBenchmark, SkillItem, ThemeColor } from '../types/gspa';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Layers, 
  CheckCircle, 
  Printer, 
  Image as ImageIcon,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Calendar,
  FileText
} from 'lucide-react';
import { PRESETS } from '../data/presets';

interface EditorDrawerProps {
  data: GSPAData;
  onChange: (updated: GSPAData) => void;
  onOpenLogoModal: () => void;
  onOpenGuideModal: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
}

export const EditorDrawer: React.FC<EditorDrawerProps> = ({
  data,
  onChange,
  onOpenLogoModal,
  onOpenGuideModal,
  onPrint,
  onExportPdf,
  isExportingPdf,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'gspa' | 'habits' | 'accountability'>('profile');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateField = <K extends keyof GSPAData>(field: K, value: GSPAData[K]) => {
    onChange({ ...data, [field]: value });
  };

  // Preset switch
  const handleLoadPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      // Preserve trainer's existing logo if already uploaded
      onChange({
        ...preset,
        logoUrl: data.logoUrl || preset.logoUrl,
        logoWidth: data.logoWidth || preset.logoWidth,
      });
    }
  };

  // Habit operations
  const handleAddHabit = () => {
    const newHabit: HabitAction = {
      id: `h_${Date.now()}`,
      category: 'Nutrition',
      title: 'New habit action protocol',
      timeOfDay: 'Morning',
      frequency: '7/7',
      targetMetric: 'Target goal',
      daysCompleted: [false, false, false, false, false, false, false],
    };
    updateField('habits', [...data.habits, newHabit]);
  };

  const handleUpdateHabit = (id: string, updates: Partial<HabitAction>) => {
    updateField(
      'habits',
      data.habits.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const handleDeleteHabit = (id: string) => {
    if (data.habits.length <= 1) {
      alert('Please keep at least one habit in the protocol.');
      return;
    }
    updateField(
      'habits',
      data.habits.filter((h) => h.id !== id)
    );
  };

  // Target Metrics operations
  const handleUpdateMetric = (id: string, updates: Partial<TargetMetric>) => {
    updateField(
      'targetMetrics',
      data.targetMetrics.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  // Performance Benchmarks
  const handleUpdateBenchmark = (id: string, updates: Partial<PerformanceBenchmark>) => {
    updateField(
      'benchmarks',
      data.benchmarks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  // Skills
  const handleUpdateSkill = (id: string, updates: Partial<SkillItem>) => {
    updateField(
      'skills',
      data.skills.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  return (
    <aside className="editor-panel w-full lg:w-[380px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-xs">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              PT
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-slate-950 leading-tight">
                GSPA Tracker Studio
              </h2>
              <p className="text-[11px] text-slate-500">Coach Design & Client Protocols</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenGuideModal}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            GSPA Model
          </button>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            {isExportingPdf ? 'Exporting...' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            Print / Save PDF
          </button>
        </div>

        {/* Sheet Mode Toggle: Digital Interactive vs Blank for Print */}
        <div className="mt-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1.5">
            <span>Sheet Render Mode:</span>
            <span className="font-mono text-[10px] text-slate-400">
              {data.sheetMode === 'blank-for-print' ? 'Clean Printout' : 'Interactive Digital'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => updateField('sheetMode', 'digital-tracking')}
              className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all text-center ${
                data.sheetMode === 'digital-tracking'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active Digital
            </button>
            <button
              type="button"
              onClick={() => updateField('sheetMode', 'blank-for-print')}
              className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all text-center ${
                data.sheetMode === 'blank-for-print'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Blank for Print
            </button>
          </div>
        </div>
      </div>

      {/* Editor Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white text-xs font-medium text-slate-600 px-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2.5 px-2.5 border-b-2 font-semibold transition-colors ${
            activeTab === 'profile'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Branding & Presets
        </button>
        <button
          onClick={() => setActiveTab('gspa')}
          className={`py-2.5 px-2.5 border-b-2 font-semibold transition-colors ${
            activeTab === 'gspa'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          G-S-P Setup
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`py-2.5 px-2.5 border-b-2 font-semibold transition-colors ${
            activeTab === 'habits'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Actions ({data.habits.length})
        </button>
        <button
          onClick={() => setActiveTab('accountability')}
          className={`py-2.5 px-2.5 border-b-2 font-semibold transition-colors ${
            activeTab === 'accountability'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Coach Notes
        </button>
      </div>

      {/* Drawer Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-700">
        {/* ========================================================= */}
        {/* TAB 1: PROFILE, BRANDING, LOGO & PRESETS */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Presets Selector */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Load Personal Training Template
              </label>
              <select
                onChange={(e) => handleLoadPreset(e.target.value)}
                defaultValue="hypertrophy"
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="hypertrophy">🏋️‍♂️ Hypertrophy & Muscle Gain</option>
                <option value="fatLoss">🔥 Fat Loss & Metabolic Health</option>
                <option value="longevity">🧘 Longevity & Functional Mobility</option>
                <option value="blank">📝 Clean Blank Template</option>
              </select>
            </div>

            {/* Logo Customization Card */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Business Logo & Brand Space</h4>
                  <p className="text-[11px] text-slate-500">Reserved for your gym or future business</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenLogoModal}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  {data.logoUrl ? 'Change Logo' : 'Upload Logo'}
                </button>
              </div>

              {data.logoUrl ? (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-14 h-10 border border-slate-200 rounded p-1 flex items-center justify-center bg-slate-50">
                    <img
                      src={data.logoUrl}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Custom logo active on sheet
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic pt-1">
                  Currently displaying styled athletic monogram [{data.monogramInitials || 'PT'}]. Click "Upload Logo" to use your custom emblem.
                </p>
              )}
            </div>

            {/* Trainer & Business Details */}
            <div className="space-y-3 border-t border-slate-200 pt-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Branding & Client Information
              </h4>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Business / Brand Name
                </label>
                <input
                  type="text"
                  value={data.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Tagline / Mission Statement
                </label>
                <input
                  type="text"
                  value={data.brandTagline}
                  onChange={(e) => updateField('brandTagline', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Coach Name
                  </label>
                  <input
                    type="text"
                    value={data.trainerName}
                    onChange={(e) => updateField('trainerName', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Credentials
                  </label>
                  <input
                    type="text"
                    value={data.trainerCredentials}
                    onChange={(e) => updateField('trainerCredentials', e.target.value)}
                    placeholder="e.g. CSCS, CISSN"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={data.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Cycle / Phase
                  </label>
                  <input
                    type="text"
                    value={data.cyclePeriod}
                    onChange={(e) => updateField('cyclePeriod', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Contact / Social Handle
                </label>
                <input
                  type="text"
                  value={data.contactInfo}
                  onChange={(e) => updateField('contactInfo', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Theme Colors */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Document Aesthetic Style
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['obsidian', 'editorial', 'titanium', 'emerald', 'navy'] as ThemeColor[]).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => updateField('theme', theme)}
                      className={`py-1.5 text-[10px] font-bold capitalize rounded border transition-all ${
                        data.theme === theme
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: G - S - P ARCHITECTURE */}
        {/* ========================================================= */}
        {activeTab === 'gspa' && (
          <div className="space-y-4">
            {/* G: Goals */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                  G
                </span>
                <h4 className="font-bold text-slate-900 text-xs">Primary Goal & Why</h4>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Primary Tangible Outcome Goal
                </label>
                <textarea
                  rows={2}
                  value={data.primaryGoal}
                  onChange={(e) => updateField('primaryGoal', e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  The Driving "Why" (Intrinsic Driver)
                </label>
                <textarea
                  rows={2}
                  value={data.whyStatement}
                  onChange={(e) => updateField('whyStatement', e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Target Deadline Date
                </label>
                <input
                  type="text"
                  value={data.targetDate}
                  onChange={(e) => updateField('targetDate', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Target Metrics */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Progress Metric Benchmarks
                </label>
                <div className="space-y-1.5">
                  {data.targetMetrics.map((m) => (
                    <div key={m.id} className="grid grid-cols-12 gap-1 text-[11px]">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleUpdateMetric(m.id, { name: e.target.value })}
                        className="col-span-6 border border-slate-200 rounded px-1.5 py-1 text-slate-900"
                        placeholder="Metric name"
                      />
                      <input
                        type="text"
                        value={m.start}
                        onChange={(e) => handleUpdateMetric(m.id, { start: e.target.value })}
                        className="col-span-3 border border-slate-200 rounded px-1.5 py-1 font-mono text-center text-slate-600"
                        placeholder="Start"
                      />
                      <input
                        type="text"
                        value={m.target}
                        onChange={(e) => handleUpdateMetric(m.id, { target: e.target.value })}
                        className="col-span-3 border border-slate-200 rounded px-1.5 py-1 font-mono font-bold text-center text-slate-900"
                        placeholder="Goal"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* S: Skills */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                    S
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">4 Core Skill Pillars</h4>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection('skills')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {collapsedSections['skills'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['skills'] && (
                <div className="space-y-3">
                  {data.skills.map((skill) => (
                    <div key={skill.id} className="border border-slate-100 bg-slate-50/50 p-2 rounded space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] uppercase text-slate-500">
                          {skill.category}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={skill.title}
                        onChange={(e) => handleUpdateSkill(skill.id, { title: e.target.value })}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-900"
                        placeholder="Skill title"
                      />
                      <textarea
                        rows={2}
                        value={skill.description}
                        onChange={(e) => handleUpdateSkill(skill.id, { description: e.target.value })}
                        className="w-full border border-slate-200 rounded p-1.5 text-[11px] text-slate-700"
                        placeholder="Description of competency"
                      />
                      <input
                        type="text"
                        value={skill.keyPractice}
                        onChange={(e) => handleUpdateSkill(skill.id, { keyPractice: e.target.value })}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800"
                        placeholder="Key daily/weekly practice rule"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* P: Performance Benchmarks */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                    P
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">Weekly Performance Standards</h4>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-600 font-medium">Compliance Threshold Standard</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={data.passingScorePercent}
                    onChange={(e) => updateField('passingScorePercent', Number(e.target.value))}
                    className="w-14 border border-slate-300 rounded px-1.5 py-0.5 text-center font-mono font-bold text-slate-900"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="space-y-2">
                {data.benchmarks.map((b) => (
                  <div key={b.id} className="border border-slate-100 p-2 rounded bg-slate-50/50 space-y-1">
                    <input
                      type="text"
                      value={b.metric}
                      onChange={(e) => handleUpdateBenchmark(b.id, { metric: e.target.value })}
                      className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-900"
                      placeholder="Benchmark title"
                    />
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Weekly Target</span>
                        <input
                          type="text"
                          value={b.weeklyTarget}
                          onChange={(e) => handleUpdateBenchmark(b.id, { weeklyTarget: e.target.value })}
                          className="w-full border border-slate-200 rounded px-1.5 py-1 text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Current Status</span>
                        <input
                          type="text"
                          value={b.currentScore || ''}
                          onChange={(e) => handleUpdateBenchmark(b.id, { currentScore: e.target.value })}
                          className="w-full border border-slate-200 rounded px-1.5 py-1 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: A - ACTIONS (DAILY HABIT MATRIX) */}
        {/* ========================================================= */}
        {activeTab === 'habits' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Daily Habit Actions
                </h4>
                <p className="text-[11px] text-slate-500">
                  Micro-behaviors tied to GSPA pillars
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHabit}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Action
              </button>
            </div>

            <div className="space-y-2.5">
              {data.habits.map((habit, index) => (
                <div
                  key={habit.id}
                  className="border border-slate-200 rounded-lg p-2.5 bg-white space-y-2 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      #{index + 1}
                    </span>
                    <select
                      value={habit.category}
                      onChange={(e) =>
                        handleUpdateHabit(habit.id, {
                          category: e.target.value as HabitAction['category'],
                        })
                      }
                      className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 bg-slate-50"
                    >
                      <option value="Nutrition">Nutrition</option>
                      <option value="Training">Training</option>
                      <option value="Recovery">Recovery</option>
                      <option value="Rhythm">Rhythm / Mindset</option>
                    </select>
                    <select
                      value={habit.timeOfDay}
                      onChange={(e) =>
                        handleUpdateHabit(habit.id, {
                          timeOfDay: e.target.value as HabitAction['timeOfDay'],
                        })
                      }
                      className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-600 bg-slate-50"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Day">Day</option>
                      <option value="Evening">Evening</option>
                      <option value="Anytime">Anytime</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors ml-auto"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={habit.title}
                      onChange={(e) => handleUpdateHabit(habit.id, { title: e.target.value })}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-900"
                      placeholder="Habit title and protocol"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Target Metric</span>
                      <input
                        type="text"
                        value={habit.targetMetric}
                        onChange={(e) => handleUpdateHabit(habit.id, { targetMetric: e.target.value })}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-slate-800"
                        placeholder="e.g. 500ml, 180g"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Frequency Target</span>
                      <input
                        type="text"
                        value={habit.frequency}
                        onChange={(e) => handleUpdateHabit(habit.id, { frequency: e.target.value })}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-slate-800"
                        placeholder="e.g. 7/7, 4/7"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: COACH NOTES, REFLECTION & ACCOUNTABILITY */}
        {/* ========================================================= */}
        {activeTab === 'accountability' && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Coach Assessment & Guidance
              </h4>
              <textarea
                rows={3}
                value={data.coachNotes}
                onChange={(e) => updateField('coachNotes', e.target.value)}
                placeholder="Coach weekly assessment, cues, and feedback..."
                className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Weekly Wins & Breakthroughs
              </h4>
              <textarea
                rows={2}
                value={data.weeklyWins}
                onChange={(e) => updateField('weeklyWins', e.target.value)}
                placeholder="Client highlights, proud moments, and consistency wins..."
                className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Weekly Challenges & Tactical Pivots
              </h4>
              <textarea
                rows={2}
                value={data.weeklyChallenges}
                onChange={(e) => updateField('weeklyChallenges', e.target.value)}
                placeholder="Obstacles encountered and the game plan for next week..."
                className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Client Commitment Agreement
              </h4>
              <textarea
                rows={2}
                value={data.clientCommitmentStatement}
                onChange={(e) => updateField('clientCommitmentStatement', e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-600">Verification Date:</span>
                <input
                  type="text"
                  value={data.dateSigned}
                  onChange={(e) => updateField('dateSigned', e.target.value)}
                  className="border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Drawer Bottom Bar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
        <span>GSPA Model Personal Training System</span>
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset tracker to default Hypertrophy preset?')) {
              handleLoadPreset('hypertrophy');
            }
          }}
          className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
    </aside>
  );
};
