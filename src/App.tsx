import React, { useState, useEffect, useMemo } from 'react';
import { Controls } from './components/Controls';
import { FilePanel } from './components/FilePanel';
import { NameNodePanel } from './components/NameNodePanel';
import { ClusterPanel } from './components/ClusterPanel';
import { FileData, RackData, DataNodeData } from './types';
import { BLOCK_SIZES, FILE_SIZE_STEPS, FILE_HUES, DATANODE_CAPACITY } from './constants';
import { generateBlocksForFile, distributeBlocks, calculateMetadataSize } from './utils/hdfsLogic';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_RACKS: RackData[] = [
  {
    id: 'rack-1',
    dataNodes: [
      { id: 'dn-1', rackId: 'rack-1', blocks: [], capacity: DATANODE_CAPACITY },
      { id: 'dn-2', rackId: 'rack-1', blocks: [], capacity: DATANODE_CAPACITY },
      { id: 'dn-3', rackId: 'rack-1', blocks: [], capacity: DATANODE_CAPACITY },
    ]
  },
  {
    id: 'rack-2',
    dataNodes: [
      { id: 'dn-4', rackId: 'rack-2', blocks: [], capacity: DATANODE_CAPACITY },
      { id: 'dn-5', rackId: 'rack-2', blocks: [], capacity: DATANODE_CAPACITY },
      { id: 'dn-6', rackId: 'rack-2', blocks: [], capacity: DATANODE_CAPACITY },
    ]
  },
  {
    id: 'rack-3',
    dataNodes: [
      { id: 'dn-7', rackId: 'rack-3', blocks: [], capacity: DATANODE_CAPACITY },
      { id: 'dn-8', rackId: 'rack-3', blocks: [], capacity: DATANODE_CAPACITY },
      { id: 'dn-9', rackId: 'rack-3', blocks: [], capacity: DATANODE_CAPACITY },
      { id: 'dn-10', rackId: 'rack-3', blocks: [], capacity: DATANODE_CAPACITY },
    ]
  }
];

export default function App() {
  const [numFiles, setNumFiles] = useState(1);
  const [blockSizeIdx, setBlockSizeIdx] = useState(2); // Default 128MB
  const [files, setFiles] = useState<FileData[]>([]);
  const [racks, setRacks] = useState<RackData[]>(INITIAL_RACKS);
  const [showExplanation, setShowExplanation] = useState(false);

  const blockSizeBytes = BLOCK_SIZES[blockSizeIdx].value;

  // Initialize or update files when numFiles or blockSize changes
  useEffect(() => {
    setFiles(prev => {
      const newFiles = [...prev];
      
      // Add files if needed
      if (newFiles.length < numFiles) {
        for (let i = newFiles.length; i < numFiles; i++) {
          const id = `file-${Date.now()}-${i}`;
          const sizeBytes = FILE_SIZE_STEPS[0].value; // Default 1GB
          const hue = FILE_HUES[i % FILE_HUES.length];
          newFiles.push({
            id,
            name: `File ${i + 1}`,
            sizeBytes,
            colorHue: hue,
            blocks: generateBlocksForFile(id, sizeBytes, blockSizeBytes, i),
            replicationFactor: 3,
            clientNodeId: 'dn-1'
          });
        }
      } 
      // Remove files if needed
      else if (newFiles.length > numFiles) {
        newFiles.splice(numFiles);
      }

      // Re-generate blocks for all files if block size changed
      return newFiles.map((f, idx) => ({
        ...f,
        blocks: generateBlocksForFile(f.id, f.sizeBytes, blockSizeBytes, idx)
      }));
    });
  }, [numFiles, blockSizeBytes]);

  // Update DataNode distribution whenever files change
  useEffect(() => {
    setRacks(prevRacks => distributeBlocks(files, prevRacks));
  }, [files]);

  const updateFileProperty = (fileId: string, property: keyof FileData, value: any) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const updatedFile = { ...f, [property]: value };
        if (property === 'sizeBytes') {
          const fileIdx = prev.findIndex(pf => pf.id === fileId);
          updatedFile.blocks = generateBlocksForFile(f.id, value, blockSizeBytes, fileIdx);
        }
        return updatedFile;
      }
      return f;
    }));
  };

  const resetSimulation = () => {
    setNumFiles(1);
    setBlockSizeIdx(2);
    setFiles([]);
    setRacks(INITIAL_RACKS);
  };

  const totalBlocks = useMemo(() => files.reduce((acc, f) => acc + f.blocks.length, 0), [files]);
  const metadataSize = useMemo(() => calculateMetadataSize(totalBlocks), [totalBlocks]);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-black/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-black italic">
            H
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">HDFS Visual Simulator</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Distributed Systems Education</p>
          </div>
        </div>
        <div className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-widest text-zinc-400 items-center">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className={`px-3 py-1 rounded-full transition-all ${showExplanation ? 'bg-zinc-900 text-white' : 'hover:text-zinc-900'}`}
          >
            Why 128MB?
          </button>
          <a href="#" className="hover:text-zinc-900 transition-colors">Architecture</a>
          <a href="#" className="hover:text-zinc-900 transition-colors">Metadata Scaling</a>
        </div>
      </header>

      {/* Explanation Overlay */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-900 text-white p-8 border-b border-white/10 relative z-40"
          >
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Why is the default block size 128MB?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-zinc-400 leading-relaxed">
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">1. Minimize Seek Time:</strong> By making blocks large, the time to transfer the data from the disk can be significantly longer than the time to seek to the start of the block. Thus, the time to transfer a large file made of multiple blocks is dominated by the transfer rate.
                  </p>
                  <p>
                    <strong className="text-white">2. Reduce NameNode Memory:</strong> The NameNode stores all file system metadata in RAM. Each block requires about 150 bytes of metadata. If blocks were small (e.g., 4KB), a 1TB file would create 250 million blocks, requiring 37GB of RAM just for one file!
                  </p>
                </div>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">3. Network Efficiency:</strong> Larger blocks mean fewer requests to the NameNode for block locations, reducing network overhead and NameNode RPC load.
                  </p>
                  <p>
                    <strong className="text-white text-emerald-400">The Trade-off:</strong> If blocks are too large, we lose parallelism (fewer DataNodes can work on the same file) and increase "hotspot" risks where one DataNode is overwhelmed by a single large block. 128MB is the "Goldilocks" zone for most big data workloads.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowExplanation(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="p-8 max-w-[1800px] mx-auto flex-grow flex flex-col gap-8 w-full">
        {/* Top Section: 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
          {/* Left Column: NameNode */}
          <div className="lg:col-span-3 min-h-[500px]">
            <NameNodePanel 
              files={files} 
              metadataSize={metadataSize} 
            />
          </div>

          {/* Center Column: DataNodes & Racks */}
          <div className="lg:col-span-6 min-h-[500px]">
            <ClusterPanel racks={racks} allBlocks={files.flatMap(f => f.blocks)} files={files} />
          </div>

          {/* Right Column: Files & Blocks */}
          <div className="lg:col-span-3 min-h-[500px]">
            <FilePanel files={files} />
          </div>
        </div>

        {/* Bottom Section: Controls */}
        <div className="w-full">
          <Controls 
            numFiles={numFiles}
            setNumFiles={setNumFiles}
            blockSizeIdx={blockSizeIdx}
            setBlockSizeIdx={setBlockSizeIdx}
            files={files}
            updateFileProperty={updateFileProperty}
            onReset={resetSimulation}
          />
        </div>
      </main>

      {/* Footer / Info */}
      <footer className="p-8 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        Built for Educational Purposes • Hadoop Distributed File System Simulation
      </footer>
    </div>
  );
}
