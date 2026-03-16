export type Unit = 'KB' | 'MB' | 'GB' | 'TB';

export interface FileData {
  id: string;
  name: string;
  sizeBytes: number;
  colorHue: number;
  blocks: BlockData[];
  replicationFactor: number;
  clientNodeId: string;
}

export interface ReplicaPlacement {
  dataNodeId: string;
  replicaIndex: number; // 1, 2, 3, 4
}

export interface BlockData {
  id: string;
  fileId: string;
  index: number;
  replicas: ReplicaPlacement[];
  color: string;
}

export interface DataNodeData {
  id: string;
  rackId: string;
  blocks: string[]; // Array of block IDs
  capacity: number;
}

export interface RackData {
  id: string;
  dataNodes: DataNodeData[];
}

export interface HDFSState {
  files: FileData[];
  blockSizeBytes: number;
  racks: RackData[];
  metadataSize: number;
}
