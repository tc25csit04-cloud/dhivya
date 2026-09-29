import React, { useState } from 'react';
import { Terminal, Play, Send, Code, Copy, Check, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ApiExplorer: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<string>('/api/generate-comic/json');
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(
      {
        prompt: 'A brave fox exploring an enchanted forest.',
        character_name: 'Free',
        setting: 'Forest',
        tone: 'dramatic',
        style: 'realistic',
      },
      null,
      2
    )
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const endpoints = [
    {
      path: '/api/generate-comic/json',
      method: 'POST',
      desc: 'JSON payload endpoint for comic creation pipeline',
      sample: {
        prompt: 'A brave fox exploring an enchanted forest.',
        character_name: 'Free',
        setting: 'Forest',
        tone: 'dramatic',
        style: 'comic book',
      },
    },
    {
      path: '/api/generate-outline',
      method: 'POST',
      desc: 'Gemini Flash: Generate 5-panel structured outline',
      sample: {
        story_prompt: 'Cyberpunk hacker infiltration into data vault',
        character_name: 'Cipher',
        setting: 'Cyberpunk Metropolis',
        tone: 'suspenseful',
        style: 'anime',
      },
    },
    {
      path: '/api/generate-story',
      method: 'POST',
      desc: 'Gemini: Expand 5 panels with captions, narration, and dialogue',
      sample: {
        outline: [
          { panel: 1, title: 'Approach', scene_description: 'Approaching the vault gate', image_prompt: 'High tech gate' },
          { panel: 2, title: 'Breach', scene_description: 'Hacking the lock', image_prompt: 'Sparks flying' },
          { panel: 3, title: 'Defense', scene_description: 'Drones activate', image_prompt: 'Red lasers' },
          { panel: 4, title: 'Counter', scene_description: 'EMP detonated', image_prompt: 'Blue flash' },
          { panel: 5, title: 'Escape', scene_description: 'Fleeing with data', image_prompt: 'Rooftop leap' },
        ],
        character_name: 'Cipher',
        setting: 'Cyber City',
        tone: 'suspenseful',
        style: 'anime',
      },
    },
    {
      path: '/api/test-image',
      method: 'POST',
      desc: 'Developer utility to test image generation directly',
      sample: {
        prompt: 'A futuristic city at sunset, sci-fi, cinematic, artstation',
      },
    },
    {
      path: '/api/health',
      method: 'GET',
      desc: 'System health check and Gemini API status',
      sample: {},
    },
  ];

  const handleSelectEndpoint = (ep: (typeof endpoints)[0]) => {
    setActiveEndpoint(ep.path);
    setRequestBody(JSON.stringify(ep.sample, null, 2));
    setResponseData(null);
    setResponseStatus(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseData(null);
    setResponseStatus(null);

    try {
      const selected = endpoints.find((e) => e.path === activeEndpoint);
      const isGet = selected?.method === 'GET';

      const res = await fetch(activeEndpoint, {
        method: selected?.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: isGet ? undefined : requestBody,
      });

      setResponseStatus(res.status);
      const data = await res.json();
      setResponseData(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: err.message || 'Request failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (responseData) {
      navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-xl text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-comic tracking-wide text-white">
              FastAPI / Interactive API Explorer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Corresponds to <code className="text-amber-400 bg-slate-800 px-1 py-0.5 rounded">/docs</code> specification (Page 21)
            </p>
          </div>
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {endpoints.map((ep) => (
          <button
            key={ep.path}
            onClick={() => handleSelectEndpoint(ep)}
            className={`p-3 text-left rounded-lg border text-xs font-semibold transition-all ${
              activeEndpoint === ep.path
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                ep.method === 'GET' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {ep.method}
              </span>
            </div>
            <p className="truncate font-mono">{ep.path.replace('/api', '')}</p>
          </button>
        ))}
      </div>

      {/* Request & Response Workbench */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Side */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-400" /> Request Payload (JSON)
            </span>
            <span className="text-xs text-amber-400 font-mono">{activeEndpoint}</span>
          </div>

          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={12}
            className="w-full flex-grow p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 resize-none"
          />

          <button
            type="button"
            onClick={handleExecute}
            disabled={isLoading}
            className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calling API...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>

        {/* Response Side */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-400">Response</span>
              {responseStatus !== null && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  Status: {responseStatus}
                </span>
              )}
            </div>

            {responseData && (
              <button
                onClick={copyToClipboard}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          <div className="w-full flex-grow p-3 bg-slate-950 text-slate-300 font-mono text-xs rounded-lg border border-slate-800 overflow-auto max-h-[300px]">
            {responseData ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(responseData, null, 2)}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                {isLoading ? 'Executing request...' : 'Click "Send Request" to test endpoint'}
              </div>
            )}
          </div>

          {responseData?.path && (
            <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <p className="text-xs font-bold text-slate-400 mb-2">Rendered Preview:</p>
              <img
                src={responseData.path}
                alt="API test image preview"
                referrerPolicy="no-referrer"
                className="w-full h-36 object-cover rounded border border-slate-700"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
