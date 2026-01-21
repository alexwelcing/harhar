import React, { useState } from 'react';
import EmptyState from './components/EmptyState';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import Dashboard from './components/Dashboard';
import { HarRoot, HarEntry } from './types';
import { filterIrrelevantEntries } from './utils/harHelpers';
import { LayoutGrid, List, ArrowLeft, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [entries, setEntries] = useState<HarEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'inspector'>('dashboard');

  const handleFileLoaded = (content: string) => {
    try {
      const parsed: HarRoot = JSON.parse(content);
      if (parsed.log && parsed.log.entries) {
        // Filter out junk (images, css) so we focus on the "Session Activity"
        const relevantEntries = filterIrrelevantEntries(parsed.log.entries);
        setEntries(relevantEntries);
        setViewMode('inspector'); // Go straight to inspector on load
      } else {
        alert("Invalid HAR file format");
      }
    } catch (e) {
      console.error(e);
      alert("Error parsing HAR file");
    }
  };

  const handleReset = () => {
    setEntries([]);
    setSelectedIndex(null);
    setViewMode('dashboard');
  };

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
         <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
                <h1 className="text-lg font-bold tracking-tight">Session Reconstruct</h1>
            </div>
        </header>
        <main className="container mx-auto">
             <EmptyState onFileLoaded={handleFileLoaded} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 overflow-hidden">
        {/* Navbar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                    <h1 className="text-lg font-bold tracking-tight hidden md:block">Session Reconstruct</h1>
                </div>
                <div className="h-6 w-px bg-zinc-800 mx-2"></div>
                <nav className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button 
                        onClick={() => setViewMode('dashboard')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === 'dashboard' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Dashboard
                    </button>
                    <button 
                        onClick={() => setViewMode('inspector')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === 'inspector' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        Inspector
                    </button>
                </nav>
            </div>
            
            <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Upload New File
            </button>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
            {viewMode === 'dashboard' ? (
                <div className="h-full overflow-y-auto p-6 md:p-12">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6">Session Overview</h2>
                        <Dashboard entries={entries} />
                        
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                             <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                             <button 
                                onClick={() => setViewMode('inspector')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                             >
                                Inspect {entries.length} Requests
                             </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex h-full">
                    {/* Sidebar */}
                    <RequestList 
                        entries={entries} 
                        selectedIndex={selectedIndex} 
                        onSelect={setSelectedIndex} 
                    />
                    
                    {/* Detail View */}
                    <RequestDetail 
                        entry={selectedIndex !== null ? entries[selectedIndex] : null} 
                    />
                </div>
            )}
        </div>
    </div>
  );
};

export default App;
