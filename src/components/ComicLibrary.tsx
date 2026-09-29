import React from 'react';
import { BookOpen, Calendar, User, Compass, Download, ArrowRight, Trash2, Sparkles } from 'lucide-react';
import { ComicData } from '../types/comic';

interface ComicLibraryProps {
  comics: ComicData[];
  onSelectComic: (comic: ComicData) => void;
  onDownloadPdf: (comic: ComicData) => void;
  onDeleteComic: (id: string) => void;
  onCreateNew: () => void;
}

export const ComicLibrary: React.FC<ComicLibraryProps> = ({
  comics,
  onSelectComic,
  onDownloadPdf,
  onDeleteComic,
  onCreateNew,
}) => {
  if (comics.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto py-12 text-center">
        <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-3xl">
            📚
          </div>
          <h3 className="text-xl font-bold font-comic text-white">Your Comic Library is Empty</h3>
          <p className="text-sm text-slate-400">
            Generate your first AI comic book story with Gemini models to view it here.
          </p>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Comic Now</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between bg-slate-900 border-2 border-slate-700 p-5 rounded-xl text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-comic text-white">
              My Saved Comics ({comics.length})
            </h2>
            <p className="text-xs text-slate-400">Revisit, read, and export your previous creations</p>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Comic</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comics.map((comic) => {
          const coverImg = comic.layout?.[0]?.image_url;
          return (
            <div
              key={comic.id}
              className="bg-white rounded-xl border-4 border-slate-900 comic-card-shadow overflow-hidden flex flex-col transition-all hover:-translate-y-1"
            >
              {/* Cover Preview */}
              <div className="h-44 w-full bg-slate-950 relative overflow-hidden group">
                {coverImg ? (
                  <img
                    src={coverImg}
                    alt={comic.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-3xl">
                    🖼️
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded font-mono">
                  {comic.layout.length} PANELS
                </div>
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-amber-400/40">
                  {comic.style}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 font-comic tracking-wide leading-tight">
                    {comic.title || `${comic.character_name}'s Adventure`}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    "{comic.prompt}"
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      {comic.character_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-500" />
                      {comic.setting}
                    </span>
                    <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">
                      {comic.tone}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onDeleteComic(comic.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Delete Comic"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDownloadPdf(comic)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded flex items-center gap-1 transition-colors"
                      title="Export as PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => onSelectComic(comic)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
