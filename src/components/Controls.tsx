import React from 'react';
import { BLOCK_SIZES, FILE_SIZE_STEPS } from '../constants';
import { formatBytes } from '../utils/hdfsLogic';
import { FileData } from '../types';
import { RotateCcw, Info } from 'lucide-react';

interface ControlsProps {
  numFiles: number;
  setNumFiles: (n: number) => void;
  blockSizeIdx: number;
  setBlockSizeIdx: (i: number) => void;
  files: FileData[];
  updateFileProperty: (fileId: string, property: keyof FileData, value: any) => void;
  onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  numFiles,
  setNumFiles,
  blockSizeIdx,
  setBlockSizeIdx,
  files,
  updateFileProperty,
  onReset
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Simulation & Control</h2>
        <button 
          onClick={onReset}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
          title="Reset Simulation"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Global Controls */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Global Controls</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-2">
                Number of Files
                <span className="text-xs font-normal text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{numFiles}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="4" 
                value={numFiles} 
                onChange={(e) => setNumFiles(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-2">
                Block Size
                <span className="text-xs font-normal text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                  {BLOCK_SIZES[blockSizeIdx].label}
                </span>
              </label>
              <input 
                type="range" 
                min="0" 
                max={BLOCK_SIZES.length - 1} 
                step="1"
                value={blockSizeIdx} 
                onChange={(e) => setBlockSizeIdx(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              />
              <div className="flex justify-between mt-2 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                {BLOCK_SIZES.map((s, i) => (
                  <span key={i} className={i === blockSizeIdx ? 'text-zinc-900 font-bold' : ''}>{s.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Files 1 & 2 */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Files 1 & 2</h3>
          <div className="space-y-8">
            {files.slice(0, 2).map((file, idx) => (
              <FileControl key={file.id} file={file} idx={idx} updateFileProperty={updateFileProperty} />
            ))}
          </div>
        </div>

        {/* Column 3: Files 3 & 4 */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Files 3 & 4</h3>
          <div className="space-y-8">
            {files.slice(2, 4).map((file, idx) => (
              <FileControl key={file.id} file={file} idx={idx + 2} updateFileProperty={updateFileProperty} />
            ))}
            {files.length < 3 && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl p-8">
                <p className="text-xs text-zinc-300 italic">Add more files to see controls</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FileControlProps {
  file: FileData;
  idx: number;
  updateFileProperty: (fileId: string, property: keyof FileData, value: any) => void;
}

const FileControl: React.FC<FileControlProps> = ({ file, idx, updateFileProperty }) => {
  const currentStepIdx = FILE_SIZE_STEPS.findIndex(s => s.value === file.sizeBytes);
  
  return (
    <div className="space-y-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold flex items-center gap-2" style={{ color: `hsl(${file.colorHue}, 70%, 40%)` }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${file.colorHue}, 70%, 50%)` }} />
          File {idx + 1}
        </label>
        <span className="text-[10px] font-mono text-zinc-500">{formatBytes(file.sizeBytes)}</span>
      </div>

      {/* File Size */}
      <div className="space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">File Size</p>
        <input 
          type="range" 
          min="0" 
          max={FILE_SIZE_STEPS.length - 1} 
          step="1"
          value={currentStepIdx} 
          onChange={(e) => updateFileProperty(file.id, 'sizeBytes', FILE_SIZE_STEPS[parseInt(e.target.value)].value)}
          className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: `hsl(${file.colorHue}, 70%, 50%)` }}
        />
      </div>

      {/* Replication Factor */}
      <div className="space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Replication Factor: {file.replicationFactor}</p>
        <input 
          type="range" 
          min="1" 
          max="4" 
          step="1"
          value={file.replicationFactor} 
          onChange={(e) => updateFileProperty(file.id, 'replicationFactor', parseInt(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: `hsl(${file.colorHue}, 70%, 50%)` }}
        />
      </div>

      {/* Client Connection */}
      <div className="space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Client Connection: DN{file.clientNodeId.split('-')[1]}</p>
        <input 
          type="range" 
          min="1" 
          max="10" 
          step="1"
          value={parseInt(file.clientNodeId.split('-')[1])} 
          onChange={(e) => updateFileProperty(file.id, 'clientNodeId', `dn-${e.target.value}`)}
          className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: `hsl(${file.colorHue}, 70%, 50%)` }}
        />
      </div>
    </div>
  );
};
