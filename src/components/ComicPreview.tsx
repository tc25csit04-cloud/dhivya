import React, { useState } from 'react';
import {
  Download,
  BookOpen,
  Volume2,
  VolumeX,
  RefreshCw,
  Edit3,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Columns,
  Square,
  Maximize2,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { ComicData, ComicPanel } from '../types/comic';

interface ComicPreviewProps {
  comic: ComicData;
  onDownloadPdf: () => void;
  onNewComic: () => void;
  isDownloading: boolean;
}

export const ComicPreview: React.FC<ComicPreviewProps> = ({
  comic,
  onDownloadPdf,
  onNewComic,
  isDownloading,
}) => {
  const [panels, setPanels] = useState<ComicPanel[]>(comic.layout);
  const [layoutMode, setLayoutMode] = useState<'strip' | 'grid'>('strip');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [editingPanelIdx, setEditingPanelIdx] = useState<number | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<{ [key: number]: boolean }>({});
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  // Read aloud feature using browser speech synthesis
  const toggleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const fullStory = panels
          .map(
            (p) =>
              `${p.title}. Scene: ${p.scene_description}. Caption: ${p.caption || ''}. Narration: ${p.narration || ''}. Dialogue: ${p.dialogue || ''}`
          )
          .join('. ');

        const utterance = new SpeechSynthesisUtterance(fullStory);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const togglePromptVisibility = (panelNum: number) => {
    setExpandedPrompts((prev) => ({
      ...prev,
      [panelNum]: !prev[panelNum],
    }));
  };

  const handleUpdatePanelText = (index: number, field: keyof ComicPanel, val: string) => {
    setPanels((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border-2 border-slate-700 shadow-xl">
        <button
          onClick={onNewComic}
          className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Create Another Story</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Audio narration button */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isSpeaking
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
            title="Read comic story narration aloud"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
          </button>

          {/* Layout mode switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setLayoutMode('strip')}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                layoutMode === 'strip' ? 'bg-amber-400 text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
              title="Sequential strip mode"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                layoutMode === 'grid' ? 'bg-amber-400 text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
              title="2-Column grid mode"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Comic Preview Header (matching Page 22 screenshot) */}
      <div className="bg-white text-slate-900 rounded-t-xl p-5 border-4 border-b-0 border-slate-900 comic-card-shadow flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">📖</span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-comic">
            Your Comic Preview
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300 uppercase">
            {comic.style}
          </span>
          <span className="hidden sm:inline-block px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold border border-blue-300 uppercase">
            {comic.tone}
          </span>
        </div>
      </div>

      {/* Sequential Panels (as shown in PDF screenshots Page 22-24) */}
      <div
        className={`bg-slate-100 border-4 border-slate-900 comic-card-shadow p-4 sm:p-8 space-y-8 rounded-b-xl ${
          layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0' : ''
        }`}
      >
        {panels.map((panel, idx) => (
          <div
            key={panel.panel || idx}
            className="bg-white rounded-lg border-2 border-slate-300 shadow-md p-5 sm:p-7 space-y-5 transition-all hover:border-slate-400"
          >
            {/* 1. Panel Title Header (matching screenshot: "Panel 2: Into the Deep Woods") */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-comic tracking-wide flex items-center gap-2">
                <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded font-sans font-bold">
                  Panel {panel.panel}
                </span>
                <span>{panel.title}</span>
              </h3>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setEditingPanelIdx(editingPanelIdx === idx ? null : idx)
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors text-xs flex items-center gap-1 font-semibold"
                  title="Edit panel story lines"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {editingPanelIdx === idx ? 'Done' : 'Edit'}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Comic Image (AI generated illustration) */}
            <div className="relative group overflow-hidden rounded-lg border-2 border-slate-900 shadow-inner bg-slate-950 aspect-[16/9]">
              <img
                src={panel.image_url}
                alt={panel.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Upload or swap custom image */}
                <label
                  className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-md cursor-pointer transition-colors shadow"
                  title="Upload custom image for this panel"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (loadEvent) => {
                          const result = loadEvent.target?.result as string;
                          if (result) {
                            handleUpdatePanelText(idx, 'image_url', result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <RefreshCw className="w-3.5 h-3.5" />
                </label>

                <button
                  type="button"
                  onClick={() => setActiveModalImage(panel.image_url)}
                  className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-md transition-colors shadow"
                  title="View full image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtle watermark badge of the art style */}
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-amber-400/30 uppercase tracking-wider">
                {comic.style}
              </div>
            </div>

            {/* Editing mode or standard view */}
            {editingPanelIdx === idx ? (
              <div className="space-y-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <label className="text-xs font-bold text-slate-700">Scene Description (Italics):</label>
                  <textarea
                    value={panel.scene_description}
                    onChange={(e) =>
                      handleUpdatePanelText(idx, 'scene_description', e.target.value)
                    }
                    rows={2}
                    className="w-full text-xs p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">**CAPTION**:</label>
                  <input
                    type="text"
                    value={panel.caption || ''}
                    onChange={(e) => handleUpdatePanelText(idx, 'caption', e.target.value)}
                    className="w-full text-xs p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">**NARRATION**:</label>
                  <input
                    type="text"
                    value={panel.narration || ''}
                    onChange={(e) =>
                      handleUpdatePanelText(idx, 'narration', e.target.value)
                    }
                    className="w-full text-xs p-2 border rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Dialogue:</label>
                  <input
                    type="text"
                    value={panel.dialogue || ''}
                    onChange={(e) => handleUpdatePanelText(idx, 'dialogue', e.target.value)}
                    className="w-full text-xs p-2 border rounded bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPanelIdx(null)}
                  className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 text-slate-800 text-sm leading-relaxed">
                {/* 3. Scene Description (displayed in italics, matching screenshot Page 23) */}
                {panel.scene_description && (
                  <p className="italic text-slate-600 text-xs sm:text-sm font-medium border-l-2 border-slate-300 pl-3">
                    {panel.scene_description}
                  </p>
                )}

                {/* 4. Caption and Narration (matching verbatim screenshot Page 23) */}
                <div className="space-y-2 pt-1">
                  {panel.caption && (
                    <p className="text-xs sm:text-sm">
                      <span className="font-extrabold text-slate-900 tracking-wide">
                        **CAPTION**
                      </span>{' '}
                      <span className="text-slate-700">{panel.caption}</span>
                    </p>
                  )}

                  {panel.narration && (
                    <p className="text-xs sm:text-sm">
                      <span className="font-extrabold text-slate-900 tracking-wide">
                        **NARRATION**
                      </span>{' '}
                      <span className="text-slate-700">{panel.narration}</span>
                    </p>
                  )}

                  {panel.dialogue && (
                    <div className="my-2 p-2.5 bg-amber-50/80 rounded-lg border-l-4 border-amber-500 text-xs sm:text-sm font-medium text-slate-900 flex items-start gap-2">
                      <span className="text-base leading-none">💬</span>
                      <span className="font-speech italic">{panel.dialogue}</span>
                    </div>
                  )}
                </div>

                {/* 5. Image Prompt Reference (original prompt description, Page 23) */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => togglePromptVisibility(panel.panel)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 focus:outline-none"
                  >
                    <span>**IMAGE PROMPT** Reference</span>
                    {expandedPrompts[panel.panel] ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {expandedPrompts[panel.panel] && (
                    <p className="mt-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 font-mono">
                      {panel.image_prompt}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prominent Download Button (matches screenshot Page 24) */}
      <div className="flex flex-col items-center justify-center pt-4">
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isDownloading}
          className="w-full sm:w-auto min-w-[340px] px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-3 border-2 border-blue-700 comic-card-shadow cursor-pointer"
        >
          <Download className="w-6 h-6 stroke-[2.5]" />
          <span>
            {isDownloading ? 'Compiling PDF File...' : 'Download Your Comic as PDF'}
          </span>
        </button>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Compiles all {panels.length} panels, images, descriptions, captions, and narrative into a structured multi-page PDF
        </p>
      </div>

      {/* Modal for full image view */}
      {activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] bg-slate-900 p-2 rounded-xl border-2 border-slate-700 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeModalImage}
              alt="Comic Panel Zoom"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setActiveModalImage(null)}
              className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
