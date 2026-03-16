import React, { useState } from 'react';
import { FileData } from '../types';
import { formatBytes } from '../utils/hdfsLogic';
import { Database, Folder, FileText, Activity, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NameNodePanelProps {
  files: FileData[];
  metadataSize: number;
}

export const NameNodePanel: React.FC<NameNodePanelProps> = ({ files, metadataSize }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">NameNode</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-zinc-100 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500"
            title={showDetails ? "Hide Replica Details" : "Show Replica Details"}
          >
            {showDetails ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{showDetails ? "Hide Details" : "Show Details"}</span>
          </button>
          <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
            <Database size={18} className="text-zinc-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {/* Namespace Tree */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Filesystem Namespace</h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-zinc-500">
              <Folder size={14} />
              <span>/user/hdfs/data</span>
            </div>
            <div className="pl-4 space-y-2">
              {files.map((file, idx) => (
                <div key={file.id} className="space-y-1">
                  <div className="flex items-center gap-2" style={{ color: `hsl(${file.colorHue}, 70%, 40%)` }}>
                    <FileText size={12} />
                    <span className="font-bold">file_{idx + 1}.dat</span>
                    <span className="text-[10px] text-zinc-400 font-normal">({formatBytes(file.sizeBytes)})</span>
                  </div>
                  
                  {/* Block Mapping */}
                  <div className="pl-4 border-l border-zinc-100 space-y-1">
                    {file.blocks.map((block, bIdx) => (
                      <div key={block.id} className="space-y-1">
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                          <span className="font-bold text-zinc-400">B{bIdx}:</span>
                          <span className="text-[9px] text-zinc-300">
                            {block.replicas.length} Replicas
                          </span>
                        </div>
                        
                        <AnimatePresence>
                          {showDetails && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden flex flex-wrap gap-x-2 gap-y-1 pl-4"
                            >
                              {block.replicas.map((r, rIdx) => (
                                <span key={rIdx} className="bg-zinc-50 text-[9px] px-1.5 py-0.5 rounded border border-zinc-100 text-zinc-500">
                                  R{r.replicaIndex} → DN{r.dataNodeId.split('-')[1]}
                                </span>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata Stats */}
        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Metadata Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Total Blocks</p>
              <p className="text-lg font-bold text-zinc-900">{files.reduce((acc, f) => acc + f.blocks.length, 0)}</p>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">RAM Usage</p>
              <p className="text-lg font-bold text-zinc-900">{formatBytes(metadataSize)}</p>
            </div>
          </div>
        </div>

        {/* Educational Insight */}
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Educational Insight</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            The NameNode keeps the entire namespace in RAM. Each block replica adds metadata overhead. 
            Notice how increasing replication factor or decreasing block size directly impacts RAM usage.
          </p>
        </div>
      </div>
    </div>
  );
};
