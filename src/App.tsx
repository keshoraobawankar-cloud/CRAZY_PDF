import React, { useState, useEffect } from 'react';
import { GSPAData } from './types/gspa';
import { PRESETS } from './data/presets';
import { GSPAPdfSheet } from './components/GSPAPdfSheet';
import { EditorDrawer } from './components/EditorDrawer';
import { LogoManagerModal } from './components/LogoManagerModal';
import { GSPAGuideModal } from './components/GSPAGuideModal';
import { AICoachModal } from './components/AICoachModal';
import { GameShell } from './game/GameShell';
import { exportElementToPdf, triggerNativePrint } from './utils/pdfExport';
import { 
  FileText, 
  Printer, 
  SlidersHorizontal, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Gamepad2,
  Bot,
  HelpCircle, 
  Sparkles
} from 'lucide-react';

const STORAGE_KEY = 'apex_gspa_tracker_data_v1';

export default function App() {
  // Load saved data or default to hypertrophy preset
  const [data, setData] = useState<GSPAData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved tracker data:', e);
    }
    return PRESETS.hypertrophy;
  });

  const [isGameActive, setIsGameActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Auto-save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Handle habit check toggle in digital mode
  const handleUpdateHabit = (habitId: string, dayIndex: number, completed: boolean) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id === habitId) {
          const newDays = [...h.daysCompleted];
          newDays[dayIndex] = completed;
          return { ...h, daysCompleted: newDays };
        }
        return h;
      }),
    }));
  };

  // Export PDF Handler
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setExportStatus('Rendering PDF document...');

    try {
      const sanitizedClient = (data.clientName || 'Client').replace(/\s+/g, '_');
      const filename = `GSPA_Habit_Tracker_${sanitizedClient}.pdf`;

      await exportElementToPdf({
        elementId: 'gspa-printable-document',
        filename,
        paperSize: data.paperSize,
        orientation: data.orientation,
        onProgress: (status) => setExportStatus(status),
      });

      setExportStatus('Download complete!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Could not generate PDF via canvas. Triggering native print-to-PDF instead.');
      triggerNativePrint();
      setExportStatus(null);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle Logo & Monogram save
  const handleSaveLogo = (updates: {
    logoUrl: string | null;
    logoWidth: number;
    monogramInitials: string;
  }) => {
    setData((prev) => ({
      ...prev,
      logoUrl: updates.logoUrl,
      logoWidth: updates.logoWidth,
      monogramInitials: updates.monogramInitials,
    }));
  };

  // Handle AI Coach Notes apply
  const handleApplyCoachNotes = (notes: string) => {
    setData((prev) => ({
      ...prev,
      coachNotes: notes,
    }));
  };

  // Preset quick switch handler
  const handleQuickPreset = (presetKey: string) => {
    const selected = PRESETS[presetKey];
    if (selected) {
      setData((prev) => ({
        ...selected,
        logoUrl: prev.logoUrl || selected.logoUrl,
        logoWidth: prev.logoWidth || selected.logoWidth,
      }));
    }
  };

  // If in 3D Game mode: Render ONLY the full-viewport Game Shell (Zero website navbars/footers)
  if (isGameActive) {
    return (
      <GameShell
        onExitGame={() => setIsGameActive(false)}
        clientName={data.clientName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans">
      {/* ========================================================= */}
      {/* 3-ZONE TOP BAR (STRICT CONTRACT FROM DESIGN CONSTITUTION) */}
      {/* ========================================================= */}
      <header className="no-print bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8 shrink-0 z-30 sticky top-0 shadow-2xs">
        {/* Zone 1: Brand wordmark (single line, no descriptor tags) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Toggle Protocol Editor Drawer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <span className="text-lg font-display font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Apex GSPA Studio
          </span>
        </div>

        {/* Zone 2: Concise Nav Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setIsGameActive(true)}
            className="flex items-center gap-1.5 text-sky-700 hover:text-sky-900 font-bold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 transition-colors whitespace-nowrap shrink-0"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Play 3D Habit Arena
          </button>
          <button
            type="button"
            onClick={() => setIsAiCoachOpen(true)}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Bot className="w-3.5 h-3.5 text-slate-500" />
            AI Coach
          </button>
          <button
            type="button"
            onClick={() => setIsLogoModalOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Logo Branding
          </button>
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            GSPA Guide
          </button>
        </nav>

        {/* Zone 3: Primary Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={triggerNativePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Sheet
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-2xs disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            {isExportingPdf ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* WORKSPACE: SIDEBAR EDITOR + DOCUMENT LIVE CANVAS */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Sidebar Drawer */}
        {isSidebarOpen && (
          <EditorDrawer
            data={data}
            onChange={setData}
            onOpenLogoModal={() => setIsLogoModalOpen(true)}
            onOpenGuideModal={() => setIsGuideModalOpen(true)}
            onPrint={triggerNativePrint}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
          />
        )}

        {/* Document Viewport & Live Canvas */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col items-center bg-slate-200/70">
          {/* Floating Document Viewport Controls Bar */}
          <div className="no-print w-full max-w-[850px] mb-4 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-300/80 shadow-xs">
            {/* Left: Document Mode and Game Launcher CTA */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-900">
                {data.clientName || 'Client'} · {data.cyclePeriod || 'Cycle'}
              </span>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setIsGameActive(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 px-2 py-0.5 rounded transition-colors"
              >
                <Gamepad2 className="w-3 h-3" /> Launch 3D Arena
              </button>
            </div>

            {/* Middle: Status Toast if Exporting */}
            {exportStatus && (
              <div className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md border border-slate-300 animate-pulse">
                {exportStatus}
              </div>
            )}

            {/* Right: Zoom Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
                className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-500 w-12 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 130))}
                className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                title="Reset Zoom (100%)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div
            className="pdf-sheet-container transition-transform duration-150 origin-top flex justify-center w-full"
            style={{
              transform: `scale(${zoomLevel / 100})`,
            }}
          >
            <div className="bg-white p-6 sm:p-10 rounded-sm shadow-xl border border-slate-300 w-full max-w-[850px]">
              <GSPAPdfSheet
                data={data}
                onUpdateHabit={handleUpdateHabit}
                onOpenLogoModal={() => setIsLogoModalOpen(true)}
              />
            </div>
          </div>

          {/* Helpful Bottom Note */}
          <div className="no-print mt-6 mb-4 text-center text-xs text-slate-500 max-w-lg">
            <p>
              Designed for high-resolution 300 DPI PDF export and direct A4 / Letter printouts.
              Click on checkboxes in <strong>Active Digital</strong> mode or switch to <strong>Blank for Print</strong> for physical paper handouts.
            </p>
          </div>
        </main>
      </div>

      {/* Logo Manager Modal */}
      <LogoManagerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        logoUrl={data.logoUrl}
        logoWidth={data.logoWidth}
        monogramInitials={data.monogramInitials}
        businessName={data.businessName}
        onSave={handleSaveLogo}
      />

      {/* GSPA Framework Guide Modal */}
      <GSPAGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* AI Sports Science Coach Modal */}
      <AICoachModal
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        data={data}
        onApplyCoachNotes={handleApplyCoachNotes}
      />
    </div>
  );
}
