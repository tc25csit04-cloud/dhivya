import React from 'react';
import { CheckCircle2, RotateCcw, Download, Eye, Sparkles, BookOpen, Share2 } from 'lucide-react';
import { ComicData } from '../types/comic';

interface ExportSuccessProps {
  comic: ComicData | null;
  pdfFilename: string;
  onGoCreateAnother: () => void;
  onReviewComic: () => void;
  onReDownload: () => void;
}

export const ExportSuccess: React.FC<ExportSuccessProps> = ({
  comic,
  pdfFilename,
  onGoCreateAnother,
  onReviewComic,
  onReDownload,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto py-8">
      {/* Centered Export Success Box (matching screenshot on Page 24) */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 border-4 border-slate-900 comic-card-shadow text-center space-y-6 relative overflow-hidden">
        {/* Top colored strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />

        {/* Green Checkmark & Heading (verbatim from screenshot Page 24) */}
        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-comic tracking-wide flex items-center justify-center gap-2">
            Comic Exported Successfully!
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
            Your AI-powered comic has been successfully created! Dive back in and bring another story to life.
          </p>
        </div>

        {/* Download metadata & card */}
        {comic && (
          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>Export Details</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">PDF Ready</span>
            </div>

            <p className="text-sm font-bold text-slate-900 truncate">
              {comic.title || `${comic.character_name}'s Comic`}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
              <div>
                <span className="font-semibold text-slate-800">Character:</span> {comic.character_name}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Setting:</span> {comic.setting}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Tone:</span> {comic.tone}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Style:</span> {comic.style}
              </div>
            </div>

            {pdfFilename && (
              <p className="text-xs font-mono text-slate-400 truncate pt-1 border-t border-slate-200">
                File: {pdfFilename}
              </p>
            )}
          </div>
        )}

        {/* Primary CTA Button matching Page 24 screenshot: "Go Create Another Comic" */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={onGoCreateAnother}
            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 border border-blue-700 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>Go Create Another Comic</span>
          </button>

          {/* Secondary actions: Re-download or Review */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onReDownload}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Again</span>
            </button>

            <button
              type="button"
              onClick={onReviewComic}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
