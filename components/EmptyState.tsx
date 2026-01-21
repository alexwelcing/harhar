import React, { useRef } from 'react';
import { Upload, FileJson } from 'lucide-react';

interface EmptyStateProps {
  onFileLoaded: (content: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onFileLoaded }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileLoaded(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[600px] p-8 text-center animate-fade-in">
      <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex flex-col items-center justify-center w-96 h-64 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-xl hover:border-blue-500 hover:bg-zinc-800/50 transition-all duration-300">
          <Upload className="w-12 h-12 text-zinc-400 mb-4 group-hover:text-blue-400 transition-colors" />
          <h3 className="text-lg font-medium text-zinc-200">Upload Session Record</h3>
          <p className="text-sm text-zinc-500 mt-2">Drag & Drop or Click to Select</p>
          <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400 border border-zinc-700">
            <FileJson className="w-3 h-3" />
            <span>.HAR files only</span>
          </div>
        </div>
        <input 
          ref={inputRef}
          type="file" 
          accept=".har,.json" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
      
      <div className="mt-12 max-w-lg text-zinc-500 text-sm">
        <p>This tool analyzes network sessions to reconstruct user flows.</p>
        <p className="mt-2">Generate a HAR file from Chrome DevTools (Network Tab → Export HAR) and drop it here.</p>
      </div>
    </div>
  );
};

export default EmptyState;
