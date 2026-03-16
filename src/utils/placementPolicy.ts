import { RackData, DataNodeData, ReplicaPlacement, BlockData } from '../types';
import { DATANODE_CAPACITY } from '../constants';

export function getPlacementExplanation(replicaIdx: number): string {
  switch (replicaIdx) {
    case 1: return "Replica 1: Placed on local DataNode (client node) for fast access.";
    case 2: return "Replica 2: Placed on a remote rack for fault tolerance.";
    case 3: return "Replica 3: Placed on the same remote rack as Replica 2, but a different node.";
    case 4: return "Replica 4: Placed to maximize rack diversity and balance load.";
    default: return "";
  }
}

export function placeReplicasForBlock(
  blockId: string,
  replicationFactor: number,
  racks: RackData[],
  clientNodeId: string
): ReplicaPlacement[] {
  const placements: ReplicaPlacement[] = [];
  const usedNodeIds = new Set<string>();

  const findNode = (
    predicate: (dn: DataNodeData, rack: RackData) => boolean
  ): { dn: DataNodeData; rack: RackData } | null => {
    for (const rack of racks) {
      for (const dn of rack.dataNodes) {
        if (!usedNodeIds.has(dn.id) && dn.blocks.length < DATANODE_CAPACITY && predicate(dn, rack)) {
          return { dn, rack };
        }
      }
    }
    // Fallback: any node with capacity
    for (const rack of racks) {
      for (const dn of rack.dataNodes) {
        if (!usedNodeIds.has(dn.id) && dn.blocks.length < DATANODE_CAPACITY) {
          return { dn, rack };
        }
      }
    }
    return null;
  };

  // Replica 1: On DataNode selected as client connection for that file
  const r1 = findNode((dn) => dn.id === clientNodeId);
  if (r1) {
    placements.push({ dataNodeId: r1.dn.id, replicaIndex: 1 });
    usedNodeIds.add(r1.dn.id);
    r1.dn.blocks.push(blockId);
  }

  if (replicationFactor < 2) return placements;

  // Replica 2: On DataNode in a different rack
  const r1RackId = r1?.rack.id;
  const r2 = findNode((_, rack) => rack.id !== r1RackId);
  if (r2) {
    placements.push({ dataNodeId: r2.dn.id, replicaIndex: 2 });
    usedNodeIds.add(r2.dn.id);
    r2.dn.blocks.push(blockId);
  }

  if (replicationFactor < 3) return placements;

  // Replica 3: On another DataNode in the same rack as Replica 2
  const r2RackId = r2?.rack.id;
  const r3 = findNode((dn, rack) => rack.id === r2RackId && dn.id !== r2?.dn.id);
  if (r3) {
    placements.push({ dataNodeId: r3.dn.id, replicaIndex: 3 });
    usedNodeIds.add(r3.dn.id);
    r3.dn.blocks.push(blockId);
  }

  if (replicationFactor < 4) return placements;

  // Replica 4+: At most one replica per DataNode, prefer unused racks, max 2 per rack
  for (let i = 4; i <= replicationFactor; i++) {
    const nextReplica = findNode((_, rack) => {
      const replicasInRack = placements.filter(p => 
        racks.find(r => r.id === rack.id)?.dataNodes.some(dn => dn.id === p.dataNodeId)
      ).length;
      return replicasInRack < 2;
    });
    if (nextReplica) {
      placements.push({ dataNodeId: nextReplica.dn.id, replicaIndex: i });
      usedNodeIds.add(nextReplica.dn.id);
      nextReplica.dn.blocks.push(blockId);
    }
  }

  return placements;
}
