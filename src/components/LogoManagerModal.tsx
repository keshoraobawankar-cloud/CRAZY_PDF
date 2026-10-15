import React, { useRef } from 'react';
import { Upload, X, Trash2, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface LogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string | null;
  logoWidth: number;
  monogramInitials: string;
  businessName: string;
  onSave: (updates: { logoUrl: string | null; logoWidth: number; monogramInitials: string }) => void;
}

export const LogoManagerModal: React.FC<LogoManagerModalProps> = ({
  isOpen,
  onClose,
  logoUrl,
  logoWidth,
  monogramInitials,
  businessName,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentLogo, setCurrentLogo] = React.useState<string | null>(logoUrl);
  const [currentWidth, setCurrentWidth] = React.useState<number>(logoWidth || 130);
  const [currentInitials, setCurrentInitials] = React.useState<string>(monogramInitials || 'PT');

  React.useEffect(() => {
    setCurrentLogo(logoUrl);
    setCurrentWidth(logoWidth || 130);
    setCurrentInitials(monogramInitials || 'PT');
  }, [logoUrl, logoWidth, monogramInitials, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('File size exceeds 4MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCurrentLogo(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({
      logoUrl: currentLogo,
      logoWidth: currentWidth,
      monogramInitials: currentInitials.toUpperCase().slice(0, 3),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Branding & Logo Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the logo slot on your client habit tracker PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Logo Preview Area */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              Header Logo Preview
            </label>
            <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-lg flex flex-col items-center justify-center min-h-[110px]">
              {currentLogo ? (
                <div className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center bg-white p-2 rounded border border-slate-200 shadow-2xs"
                    style={{ width: `${currentWidth}px`, height: '64px' }}
                  >
                    <img
                      src={currentLogo}
                      alt="Business Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 font-mono">
                    Rendered width: {currentWidth}px
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-display font-bold text-base shadow-sm">
                    {currentInitials || 'PT'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 mt-2">
                    {businessName || 'Personal Training Enterprise'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Using generated coach monogram crest
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Upload Custom Logo Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  Choose File (PNG, SVG, JPG)
                </button>
                {currentLogo && (
                  <button
                    type="button"
                    onClick={() => setCurrentLogo(null)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Transparent PNG or vector SVG recommended for the sharpest print output.
              </p>
            </div>

            {/* Logo Width Slider (if logo uploaded) */}
            {currentLogo && (
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                  <span>Logo Display Width</span>
                  <span className="font-mono text-slate-500">{currentWidth}px</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="180"
                  step="5"
                  value={currentWidth}
                  onChange={(e) => setCurrentWidth(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>
            )}

            {/* Monogram Fallback Settings */}
            {!currentLogo && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Coach / Gym Monogram Initials
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={currentInitials}
                    onChange={(e) => setCurrentInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. VP"
                    className="w-24 px-3 py-1.5 text-xs font-mono font-bold tracking-widest uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 flex items-center">
                    Shown when no custom logo is uploaded yet. Perfect placeholder for your future business brand!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Check className="w-4 h-4" />
            Apply to Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
