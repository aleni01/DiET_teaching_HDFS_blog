import { FileData, BlockData, RackData, DataNodeData, ReplicaPlacement } from '../types';
import { DATANODE_CAPACITY, METADATA_PER_BLOCK } from '../constants';
import { placeReplicasForBlock } from './placementPolicy';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function distributeBlocks(files: FileData[], racks: RackData[]): RackData[] {
  // Reset all DataNodes
  const newRacks = racks.map(rack => ({
    ...rack,
    dataNodes: rack.dataNodes.map(dn => ({ ...dn, blocks: [] }))
  }));

  files.forEach(file => {
    file.blocks.forEach(block => {
      block.replicas = placeReplicasForBlock(block.id, file.replicationFactor, newRacks, file.clientNodeId);
    });
  });

  return newRacks;
}

export function calculateMetadataSize(totalBlocks: number): number {
  return totalBlocks * METADATA_PER_BLOCK;
}

export function getBlockColor(fileIdx: number, blockIdx: number, totalBlocks: number): string {
  const hues = [
    [0, 40],   // File 1: Red -> Orange
    [80, 140], // File 2: Green -> Yellow-Green
    [180, 240],// File 3: Blue -> Turquoise
    [260, 320] // File 4: Purple -> Magenta/Pink
  ];
  
  const [minHue, maxHue] = hues[fileIdx % hues.length];
  // Spread hues across blocks
  const hue = minHue + (blockIdx / Math.max(1, totalBlocks - 1)) * (maxHue - minHue);
  // Vary saturation and lightness slightly to make them distinguishable
  const saturation = 70 + (blockIdx % 5) * 4;
  const lightness = 40 + (blockIdx % 7) * 4;
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function generateBlocksForFile(fileId: string, fileSize: number, blockSize: number, fileIdx: number): BlockData[] {
  const numBlocks = Math.ceil(fileSize / blockSize);
  const blocks: BlockData[] = [];

  for (let i = 0; i < numBlocks; i++) {
    blocks.push({
      id: `${fileId}-b${i}`,
      fileId,
      index: i,
      replicas: [],
      color: getBlockColor(fileIdx, i, numBlocks)
    });
  }

  return blocks;
}
