/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ComicForm } from './components/ComicForm';
import { ComicPreview } from './components/ComicPreview';
import { ExportSuccess } from './components/ExportSuccess';
import { ApiExplorer } from './components/ApiExplorer';
import { ComicLibrary } from './components/ComicLibrary';
import { ComicData } from './types/comic';
import { exportComicToPdf } from './utils/pdfGenerator';
import {
  Sparkles,
  BookOpen,
  Terminal,
  Library,
  PenTool,
  Download,
  AlertCircle,
} from 'lucide-react';

type ActiveView = 'create' | 'preview' | 'export_success' | 'library' | 'api_docs';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('create');
  const [currentComic, setCurrentComic] = useState<ComicData | null>(null);
  const [savedComics, setSavedComics] = useState<ComicData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastPdfFilename, setLastPdfFilename] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved comics from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('comiccraft_comics');
      if (stored) {
        setSavedComics(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load comics from localStorage:', e);
    }
  }, []);

  const saveComicToState = (newComic: ComicData) => {
    const updated = [newComic, ...savedComics.filter((c) => c.id !== newComic.id)];
    setSavedComics(updated);
    try {
      localStorage.setItem('comiccraft_comics', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  const deleteComic = (id: string) => {
    const updated = savedComics.filter((c) => c.id !== id);
    setSavedComics(updated);
    try {
      localStorage.setItem('comiccraft_comics', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not update localStorage:', e);
    }
  };

  // Comic Generation Pipeline (Activities 2.1, 2.2, 3.1)
  const handleGenerateComic = async (formData: {
    prompt: string;
    character_name: string;
    setting: string;
    tone: string;
    style: string;
    num_panels: number;
  }) => {
    setIsGenerating(true);
    setErrorMessage(null);
    const count = formData.num_panels || 2;
    setLoadingStep(`Step 1/3: Gemini generating ${count}-panel comic storyline...`);

    try {
      // Small simulated step update for feedback
      const timer = setTimeout(() => {
        setLoadingStep(`Step 2/3: Gemini writing dialogues & captions for ${count} panels...`);
      }, 1200);

      const timer2 = setTimeout(() => {
        setLoadingStep(`Step 3/3: Rendering ${count} high-fidelity comic images...`);
      }, 2400);

      const response = await fetch('/api/generate-comic/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      clearTimeout(timer);
      clearTimeout(timer2);

      if (!response.ok) {
        throw new Error(`Generation failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.comic) {
        setCurrentComic(data.comic);
        saveComicToState(data.comic);
        setActiveView('preview');
      } else {
        throw new Error('Invalid response structure received from server');
      }
    } catch (error: any) {
      console.error('Error generating comic:', error);
      setErrorMessage(error.message || 'Failed to generate comic. Please retry.');
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  // PDF Export Flow (Scenario 3 & Activity 2.1 exporters.py)
  const handleDownloadPdf = async (targetComic?: ComicData) => {
    const comicToExport = targetComic || currentComic;
    if (!comicToExport) return;

    setIsDownloading(true);
    try {
      const filename = await exportComicToPdf(comicToExport);
      setLastPdfFilename(filename);

      // Once exported, redirect to export_success (matching specification Page 24)
      setActiveView('export_success');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      setErrorMessage('Failed to compile PDF. Please check your browser settings.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans relative selection:bg-amber-400 selection:text-slate-900">
      {/* Top Scenic Background Layer for Home & Preview */}
      <div className="fixed inset-0 pointer-events-none z-0 scenic-background opacity-60" />
      <div className="fixed inset-0 pointer-events-none z-0 comic-dots-pattern" />

      {/* Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveView('create')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl">💥</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black font-comic tracking-wide text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                COMICCRAFT
                <span className="text-[10px] font-sans font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded uppercase">
                  AI
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Powered by Google Gemini Models
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveView('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeView === 'create'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>

            {currentComic && (
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeView === 'preview'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 relative ${
                activeView === 'library'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Library</span>
              {savedComics.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-mono">
                  {savedComics.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('api_docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeView === 'api_docs'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="FastAPI interactive /docs explorer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">API / Docs</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="relative z-30 max-w-xl mx-auto px-4 pt-4">
          <div className="p-3 bg-rose-500/90 text-white text-xs font-medium rounded-lg flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-white hover:text-rose-200 text-sm font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* VIEW 1: Input Form (index.html) */}
        {activeView === 'create' && (
          <div className="space-y-6">
            <ComicForm
              onGenerate={handleGenerateComic}
              isLoading={isGenerating}
              loadingStep={loadingStep}
            />
          </div>
        )}

        {/* VIEW 2: Comic Preview (comic_preview.html) */}
        {activeView === 'preview' && currentComic && (
          <ComicPreview
            comic={currentComic}
            onDownloadPdf={() => handleDownloadPdf()}
            onNewComic={() => setActiveView('create')}
            isDownloading={isDownloading}
          />
        )}

        {/* VIEW 3: Export Success Confirmation (export_success.html) */}
        {activeView === 'export_success' && (
          <ExportSuccess
            comic={currentComic}
            pdfFilename={lastPdfFilename}
            onGoCreateAnother={() => setActiveView('create')}
            onReviewComic={() => setActiveView('preview')}
            onReDownload={() => handleDownloadPdf()}
          />
        )}

        {/* VIEW 4: Comic Library Gallery */}
        {activeView === 'library' && (
          <ComicLibrary
            comics={savedComics}
            onSelectComic={(comic) => {
              setCurrentComic(comic);
              setActiveView('preview');
            }}
            onDownloadPdf={(comic) => handleDownloadPdf(comic)}
            onDeleteComic={deleteComic}
            onCreateNew={() => setActiveView('create')}
          />
        )}

        {/* VIEW 5: API Documentation & Explorer */}
        {activeView === 'api_docs' && <ApiExplorer />}
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800 bg-slate-950/90 text-slate-500 py-6 text-xs text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ComicCraft - AI Comic Story Creator using Gemini Models & Diffusers</p>
          <div className="flex items-center space-x-4">
            <span>FastAPI Architecture</span>
            <span>•</span>
            <span>Gemini Flash & Pro</span>
            <span>•</span>
            <span>FPDF / jsPDF Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
