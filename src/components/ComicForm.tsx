import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Wand2,
  BookOpen,
  Compass,
  Smile,
  Palette,
  User,
  ArrowRight,
  Shuffle,
  Loader2,
  Layers,
} from 'lucide-react';
import {
  SETTING_OPTIONS,
  TONE_OPTIONS,
  ART_STYLE_OPTIONS,
  STORY_PRESETS,
  PresetStory,
} from '../types/comic';

interface ComicFormProps {
  onGenerate: (formData: {
    prompt: string;
    character_name: string;
    setting: string;
    tone: string;
    style: string;
    num_panels: number;
  }) => Promise<void>;
  isLoading: boolean;
  loadingStep: string;
}

export const ComicForm: React.FC<ComicFormProps> = ({
  onGenerate,
  isLoading,
  loadingStep,
}) => {
  const [prompt, setPrompt] = useState('A brave fox exploring an enchanted forest.');
  const [characterName, setCharacterName] = useState('Free');
  const [setting, setSetting] = useState('Forest');
  const [customSetting, setCustomSetting] = useState('');
  const [tone, setTone] = useState('dramatic');
  const [style, setStyle] = useState('realistic');
  const [numPanels, setNumPanels] = useState<number>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSetting = setting === 'Custom' ? customSetting.trim() || 'Wilderness' : setting;
    onGenerate({
      prompt: prompt.trim(),
      character_name: characterName.trim() || 'Hero',
      setting: finalSetting,
      tone,
      style,
      num_panels: numPanels,
    });
  };

  const applyPreset = (preset: PresetStory) => {
    setPrompt(preset.prompt);
    setCharacterName(preset.character_name);
    setSetting(preset.setting);
    setTone(preset.tone);
    setStyle(preset.style);
  };

  const randomize = () => {
    const randomPreset = STORY_PRESETS[Math.floor(Math.random() * STORY_PRESETS.length)];
    applyPreset(randomPreset);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Centered White Comic Box (matches screenshot on Page 21) */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-8 border-4 border-slate-900 comic-card-shadow transition-all relative overflow-hidden">
        {/* Top Comic Accent Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600" />

        {/* Card Header matching Page 21 */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 shadow-sm">
              <PenTool className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-comic">
                Create Your Comic
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                AI Comic Story Creator powered by Gemini Models
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={randomize}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
            title="Randomize inspiration"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Surprise Me</span>
          </button>
        </div>

        {/* Preset chips */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Inspiration Presets:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STORY_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 text-left bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-lg text-xs font-medium text-slate-700 transition-all group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">{p.icon}</span>
                <span className="truncate">{p.character_name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Story Prompt */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Story Prompt:
              </span>
              <span className="text-xs font-normal text-slate-400">Describe the premise</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={3}
              placeholder="e.g. A brave fox exploring an enchanted forest..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-colors resize-none placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Main Character Name */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-500" />
              Main Character Name:
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              required
              placeholder="e.g. Free"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-colors placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Setting */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-500" />
              Setting:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-colors cursor-pointer font-medium"
              >
                {SETTING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="Custom">+ Custom Setting...</option>
              </select>

              {setting === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter custom location..."
                  value={customSetting}
                  onChange={(e) => setCustomSetting(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-600 font-medium"
                  required
                />
              )}
            </div>
          </div>

          {/* Number of Images / Panels Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Number of Comic Images:
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {numPanels} Panels / Images {numPanels === 2 ? '(Selected)' : ''}
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setNumPanels(cnt)}
                  disabled={isLoading}
                  className={`py-2.5 px-3 rounded-lg border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    numPanels === cnt
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-sm font-extrabold">{cnt} Images</span>
                  <span className={`text-[10px] ${numPanels === cnt ? 'text-blue-100' : 'text-slate-500'}`}>
                    {cnt === 2 ? '⚡ Only 2' : `${cnt} scenes`}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Select 2 images for a fast 2-panel comic strip (Scene 1: Introduction, Scene 2: Climax & Resolution).
            </p>
          </div>

          {/* Two-Column: Story Tone & Art Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Story Tone */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-purple-500" />
                Story Tone:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-900 text-sm capitalize focus:outline-none focus:border-blue-600 focus:bg-white transition-colors cursor-pointer font-medium"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Art Style */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-rose-500" />
                Art Style:
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-900 text-sm capitalize focus:outline-none focus:border-blue-600 focus:bg-white transition-colors cursor-pointer font-medium"
              >
                {ART_STYLE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading Progress Feedback */}
          {isLoading && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center space-x-3 text-blue-900">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
              <div className="text-xs sm:text-sm font-medium">
                <p className="font-bold text-blue-800">Generating Your Comic...</p>
                <p className="text-blue-600">{loadingStep || 'Designing panels and rendering artwork...'}</p>
              </div>
            </div>
          )}

          {/* Generate Comic Button (matches exact blue button in screenshot Page 21) */}
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-400 text-white font-bold rounded-lg text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 border border-blue-700 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Story & Panels...</span>
              </>
            ) : (
              <>
                <span>Generate Comic</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
