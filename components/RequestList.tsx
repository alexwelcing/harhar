import React, { useMemo, useState } from 'react';
import { HarEntry } from '../types';
import { getMethodColor, getStatusColor } from '../utils/harHelpers';
import { Search, Globe, ChevronDown, ChevronRight, Layers } from 'lucide-react';

interface RequestListProps {
  entries: HarEntry[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const RequestList: React.FC<RequestListProps> = ({ entries, selectedIndex, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());

  // Group entries by Domain
  const groupedData = useMemo(() => {
    const groups: Record<string, { entries: HarEntry[], originalIndices: number[] }> = {};
    
    entries.forEach((entry, index) => {
      // Filtering logic
      const matchesSearch = entry.request.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = filterMethod ? entry.request.method === filterMethod : true;

      if (matchesSearch && matchesMethod) {
        let domain;
        try {
            domain = new URL(entry.request.url).hostname;
        } catch {
            domain = 'Unknown Host';
        }
        
        if (!groups[domain]) {
            groups[domain] = { entries: [], originalIndices: [] };
        }
        groups[domain].entries.push(entry);
        groups[domain].originalIndices.push(index);
      }
    });

    // Sort domains alphabetically, but maybe put the one with most requests first? 
    // Let's stick to alphabetical for stability or count. Let's do Count.
    return Object.entries(groups).sort((a, b) => b[1].entries.length - a[1].entries.length);
  }, [entries, searchTerm, filterMethod]);

  const toggleDomain = (domain: string) => {
    const newSet = new Set(collapsedDomains);
    if (newSet.has(domain)) {
        newSet.delete(domain);
    } else {
        newSet.add(domain);
    }
    setCollapsedDomains(newSet);
  };

  return (
    <div className="flex flex-col h-full border-r border-zinc-800 bg-zinc-900/50 w-full lg:w-96 shrink-0">
      <div className="p-4 border-b border-zinc-800 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Filter URLs..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['POST', 'PUT', 'DELETE', 'GET', 'PATCH'].map(m => (
            <button
              key={m}
              onClick={() => setFilterMethod(filterMethod === m ? null : m)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                filterMethod === m 
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groupedData.length === 0 && (
             <div className="p-8 text-center text-zinc-500 text-sm flex flex-col items-center">
                <Layers className="w-8 h-8 mb-2 opacity-20" />
                No matching requests found.
             </div>
        )}

        {groupedData.map(([domain, data]) => {
            const isCollapsed = collapsedDomains.has(domain);
            
            return (
                <div key={domain} className="border-b border-zinc-800/50 last:border-0">
                    <div 
                        onClick={() => toggleDomain(domain)}
                        className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 hover:bg-zinc-800/80 cursor-pointer sticky top-0 z-10 backdrop-blur-sm border-b border-zinc-800/50"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            {isCollapsed ? <ChevronRight className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
                            <Globe className="w-3 h-3 text-zinc-600" />
                            <span className="text-xs font-semibold text-zinc-300 truncate">{domain}</span>
                        </div>
                        <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full border border-zinc-700">
                            {data.entries.length}
                        </span>
                    </div>

                    {!isCollapsed && (
                        <div>
                            {data.entries.map((entry, idx) => {
                                const originalIndex = data.originalIndices[idx];
                                const isSelected = selectedIndex === originalIndex;
                                const fileName = entry.request.url.split('/').pop()?.split('?')[0] || '/';

                                return (
                                    <div 
                                        key={`${domain}-${idx}`}
                                        onClick={() => onSelect(originalIndex)}
                                        className={`group flex flex-col p-3 border-l-2 cursor-pointer transition-all hover:bg-zinc-800/50 ${
                                            isSelected 
                                                ? 'bg-blue-500/5 border-l-blue-500' 
                                                : 'border-l-transparent border-b border-b-zinc-800/30'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMethodColor(entry.request.method)}`}>
                                            {entry.request.method}
                                            </span>
                                            <span className={`text-xs font-mono ${getStatusColor(entry.response.status)}`}>
                                            {entry.response.status}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-zinc-300 truncate font-mono pl-1" title={entry.request.url}>
                                            {fileName}
                                        </div>
                                        <div className="flex justify-between items-center mt-1 pl-1">
                                            <div className="text-[10px] text-zinc-600 font-mono">{Math.round(entry.time)}ms</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default RequestList;
