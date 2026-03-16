import React from 'react';
import { FileData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { formatBytes } from '../utils/hdfsLogic';

interface FilePanelProps {
  files: FileData[];
}

export const FilePanel: React.FC<FilePanelProps> = ({ files }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-6 h-full overflow-y-auto">
      <h2 className="text-xl font-bold tracking-tight text-zinc-900">Files & Blocks</h2>
      
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {files.map((file, idx) => (
            <motion.div 
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-sm font-bold text-zinc-800">File {idx + 1}</h3>
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                    {formatBytes(file.sizeBytes)} • {file.blocks.length} Blocks
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-0.5 p-1 bg-zinc-50 rounded-lg border border-zinc-100 min-h-[40px]">
                {file.blocks.map((block) => (
                  <motion.div
                    key={block.id}
                    layoutId={block.id}
                    className="w-4 h-6 rounded-sm shadow-sm border border-black/5"
                    style={{ backgroundColor: block.color }}
                    title={`Block ${block.index}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                ))}
                {file.blocks.length === 0 && (
                  <div className="w-full flex items-center justify-center text-[10px] text-zinc-300 italic">
                    No blocks
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
