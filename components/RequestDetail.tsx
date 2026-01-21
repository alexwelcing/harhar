import React, { useState, useEffect, useMemo } from 'react';
import { HarEntry, AnalysisResult } from '../types';
import { generateCurl } from '../utils/harHelpers';
import { analyzeEntry } from '../services/geminiService';
import { Bot, Terminal, Code, FileText, Play, Copy, Check, TriangleAlert } from 'lucide-react';

interface RequestDetailProps {
  entry: HarEntry | null;
}

type CodeLanguage = 'python' | 'typescript' | 'go' | 'rust' | 'php';

const RequestDetail: React.FC<RequestDetailProps> = ({ entry }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'curl' | 'headers' | 'payload' | 'response'>('analysis');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('python');

  useEffect(() => {
    setAnalysis(null);
    setIsAnalyzing(false);
    if (entry) {
        if (['POST', 'PUT', 'DELETE'].includes(entry.request.method)) {
            setActiveTab('analysis');
        } else {
             setActiveTab('headers');
        }
    }
  }, [entry]);

  const curlCommand = useMemo(() => entry ? generateCurl(entry.request) : '', [entry]);

  const handleAnalyze = async () => {
    if (!entry) return;
    setIsAnalyzing(true);
    const result = await analyzeEntry(entry, curlCommand);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeContent = () => {
    if (!analysis) return '';
    switch (codeLanguage) {
        case 'python': return analysis.pythonCode;
        case 'typescript': return analysis.typescriptCode;
        case 'go': return analysis.goCode;
        case 'rust': return analysis.rustCode;
        case 'php': return analysis.phpCode;
        default: return analysis.pythonCode;
    }
  };

  if (!entry) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8">
        <Terminal className="w-16 h-16 mb-4 opacity-20" />
        <p>Select a request from the sidebar to inspect details.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex items-start gap-4">
           <div className={`mt-1 px-3 py-1 rounded text-sm font-bold border ${
                entry.request.method === 'GET' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                entry.request.method === 'POST' ? 'text-green-400 border-green-400/20 bg-green-400/10' :
                entry.request.method === 'DELETE' ? 'text-red-400 border-red-400/20 bg-red-400/10' :
                'text-orange-400 border-orange-400/20 bg-orange-400/10'
           }`}>
             {entry.request.method}
           </div>
           <div className="flex-1 min-w-0">
             <h2 className="text-lg font-mono text-zinc-100 truncate select-all">{entry.request.url}</h2>
             <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                <span className={entry.response.status >= 400 ? 'text-red-400' : 'text-emerald-400'}>
                    Status: {entry.response.status} {entry.response.statusText}
                </span>
                <span>Time: {Math.round(entry.time)}ms</span>
                <span>Size: {entry.response.content.size} B</span>
             </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-6">
        {[
          { id: 'analysis', label: 'AI Analysis', icon: Bot },
          { id: 'curl', label: 'cURL', icon: Terminal },
          { id: 'payload', label: 'Payload', icon: Code },
          { id: 'headers', label: 'Headers', icon: FileText },
          { id: 'response', label: 'Response', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* AI Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!analysis && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Bot className="w-12 h-12 text-zinc-600 mb-4" />
                <h3 className="text-zinc-200 font-medium mb-2">Reconstruct User Action</h3>
                <p className="text-zinc-500 max-w-md mb-6">
                  Use Gemini AI to analyze the intent of this request and generate reproduction scripts in Python, TypeScript, Go, Rust, and PHP.
                </p>
                <button 
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Analyze & Reconstruct
                </button>
              </div>
            )}

            {isAnalyzing && (
               <div className="space-y-4 animate-pulse">
                 <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
                 <div className="h-24 bg-zinc-800 rounded w-full"></div>
                 <div className="h-64 bg-zinc-800 rounded w-full"></div>
               </div>
            )}

            {analysis && (
              <div className="space-y-6 animate-fade-in">
                {/* Summary Card */}
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-700 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-zinc-200">Plain English Interpretation</span>
                    </div>
                    <div className="p-5 text-zinc-300 leading-relaxed text-lg">
                        {analysis.summary}
                    </div>
                </div>

                {/* Error Analysis Card (Only if present) */}
                {analysis.errorAnalysis && analysis.errorAnalysis.trim().length > 0 && (
                    <div className="bg-red-950/20 border border-red-900/50 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 py-3 bg-red-900/20 border-b border-red-900/50 flex items-center gap-2">
                            <TriangleAlert className="w-4 h-4 text-red-400" />
                            <span className="font-semibold text-red-200">Error Diagnosis</span>
                        </div>
                        <div className="p-5 text-red-200/90 leading-relaxed text-lg">
                            {analysis.errorAnalysis}
                        </div>
                    </div>
                )}

                {/* Code Card */}
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-emerald-400" />
                            <span className="font-semibold text-zinc-200">Reproduction Script</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(getCodeContent())}
                          className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="Copy Code"
                        >
                           {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Language Tabs */}
                    <div className="flex items-center bg-[#0d1117] px-2 border-b border-zinc-800">
                        {(['python', 'typescript', 'go', 'rust', 'php'] as CodeLanguage[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setCodeLanguage(lang)}
                                className={`px-4 py-2 text-xs font-mono uppercase tracking-wide border-b-2 transition-colors ${
                                    codeLanguage === lang 
                                        ? 'border-emerald-500 text-emerald-400' 
                                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                {lang === 'typescript' ? 'TS' : lang}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <pre className="p-4 overflow-x-auto text-sm text-blue-100 bg-[#0d1117] min-h-[300px]">
                            <code>{getCodeContent()}</code>
                        </pre>
                    </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* cURL Tab */}
        {activeTab === 'curl' && (
          <div className="relative group">
            <button 
              onClick={() => copyToClipboard(curlCommand)}
              className="absolute top-2 right-2 p-2 bg-zinc-800 rounded text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
              {curlCommand}
            </pre>
          </div>
        )}

        {/* Headers Tab */}
        {activeTab === 'headers' && (
            <div className="space-y-4">
                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Request Headers</h3>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                        {entry.request.headers.map((h, i) => (
                            <div key={i} className="flex border-b border-zinc-800 last:border-0 px-4 py-2 text-sm">
                                <span className="w-1/3 text-zinc-400 font-mono truncate mr-2" title={h.name}>{h.name}</span>
                                <span className="flex-1 text-zinc-200 font-mono break-all">{h.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Payload Tab */}
        {activeTab === 'payload' && (
            <div className="h-full">
                {entry.request.postData?.text ? (
                    <pre className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto text-sm text-yellow-100 font-mono whitespace-pre-wrap">
                        {entry.request.postData.mimeType.includes('json') 
                            ? JSON.stringify(JSON.parse(entry.request.postData.text), null, 2)
                            : entry.request.postData.text
                        }
                    </pre>
                ) : (
                    <div className="text-zinc-500 italic">No payload data.</div>
                )}
            </div>
        )}

        {/* Response Tab */}
        {activeTab === 'response' && (
             <div className="h-full">
                {entry.response.content.text ? (
                    <pre className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto text-sm text-zinc-300 font-mono whitespace-pre-wrap">
                        {entry.response.content.mimeType.includes('json') 
                             // Try/Catch for JSON parsing because sometimes response claims JSON but is malformed or truncated
                             ? (() => {
                                 try { return JSON.stringify(JSON.parse(entry.response.content.text), null, 2); }
                                 catch { return entry.response.content.text; }
                             })()
                             : entry.response.content.text
                        }
                    </pre>
                ) : (
                    <div className="text-zinc-500 italic">No response content available.</div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;
