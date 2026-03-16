import React from 'react';
import { RackData, BlockData, FileData } from '../types';
import { motion } from 'motion/react';
import { Server, Box, User } from 'lucide-react';
import { DATANODE_CAPACITY } from '../constants';

interface ClusterPanelProps {
  racks: RackData[];
  allBlocks: BlockData[];
  files: FileData[];
}

export const ClusterPanel: React.FC<ClusterPanelProps> = ({ racks, allBlocks, files }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">DataNodes & Racks</h2>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-200" />
            Empty
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-900" />
            Full
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {racks.map((rack, rIdx) => (
          <div key={rack.id} className="flex-1 min-w-[180px] flex flex-col bg-zinc-50 rounded-2xl border border-zinc-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Box size={14} className="text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Rack {rIdx + 1}</span>
            </div>
            
            <div className="flex-1 flex flex-col gap-3">
              {rack.dataNodes.map(node => {
                const usagePercent = (node.blocks.length / DATANODE_CAPACITY) * 100;
                const isFull = node.blocks.length >= DATANODE_CAPACITY;
                
                // Find which files are connected to this node
                const connectedFiles = files.filter(f => f.clientNodeId === node.id);

                return (
                  <div key={node.id} className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm space-y-3 relative">
                    {/* Client Connection Indicators - Larger and Labeled */}
                    <div className="absolute -top-3 -right-2 flex flex-col gap-1 z-10">
                      {connectedFiles.map((f, fIdx) => (
                        <div 
                          key={f.id}
                          className="px-2 py-0.5 rounded-md border-2 border-white shadow-md flex items-center gap-1 animate-bounce"
                          style={{ 
                            backgroundColor: `hsl(${f.colorHue}, 70%, 50%)`,
                            animationDelay: `${fIdx * 0.2}s`
                          }}
                          title={`Client for File ${f.id.split('-')[1]} connected`}
                        >
                          <User size={10} className="text-white" />
                          <span className="text-[9px] font-black text-white">C{files.indexOf(f) + 1}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Server size={10} className={isFull ? 'text-red-500' : 'text-zinc-400'} />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">DN{node.id.split('-')[1]}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{node.blocks.length}/{DATANODE_CAPACITY}</span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${isFull ? 'bg-red-500' : 'bg-zinc-900'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercent}%` }}
                      />
                    </div>

                    {/* Block Grid - Full 10x10 Grid */}
                    <div className="grid grid-cols-10 gap-0.5">
                      {Array.from({ length: DATANODE_CAPACITY }).map((_, i) => {
                        const blockId = node.blocks[i];
                        const block = blockId ? allBlocks.find(b => b.id === blockId) : null;
                        const replica = block?.replicas.find(r => r.dataNodeId === node.id);
                        
                        return (
                          <div 
                            key={`${node.id}-slot-${i}`}
                            className={`aspect-square rounded-[1px] flex items-center justify-center ${!block ? 'bg-zinc-100' : ''}`}
                            style={{ 
                              backgroundColor: block?.color
                            }}
                            title={block ? `Block ${block.index} (Replica ${replica?.replicaIndex})` : 'Empty Slot'}
                          >
                            {replica && (
                              <span className="text-[4px] font-bold text-white leading-none opacity-80">
                                {replica.replicaIndex}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
