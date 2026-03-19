/**
 * Dijkstra shortest-path algorithm for indoor wayfinding.
 *
 * Supports multi-floor routing with configurable penalties
 * for stairs vs. elevator transitions, and accessible-only mode.
 */

export interface WayfinderNode {
  id: string;
  x: number;
  y: number;
  floor: string;
  label: string;
  isAccessible: boolean;
  linkedRoomId: string | null;
}

export interface WayfinderEdge {
  from: string;
  to: string;
  distance: number;
  isAccessible: boolean;
  isStairs: boolean;
}

export interface WayfinderGraph {
  nodes: Map<string, WayfinderNode>;
  edges: Map<string, WayfinderEdge[]>; // adjacency list keyed by node id
}

export interface WayfinderResult {
  path: WayfinderNode[];
  distance: number;
  estimatedTime: string;
}

/** Walking speed in metres per second */
const WALKING_SPEED_MS = 1.2;

/** Additional time penalty for taking stairs between floors (seconds) */
const STAIRS_PENALTY_S = 30;

/** Additional time penalty for taking an elevator between floors (seconds) */
const ELEVATOR_PENALTY_S = 45;

// ── Priority Queue (min-heap) ──────────────────────────────────

interface PQEntry {
  nodeId: string;
  priority: number;
}

class MinPriorityQueue {
  private heap: PQEntry[] = [];

  get size(): number {
    return this.heap.length;
  }

  enqueue(nodeId: string, priority: number): void {
    this.heap.push({ nodeId, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): PQEntry | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].priority <= this.heap[index].priority) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

// ── Graph Builder ──────────────────────────────────────────────

/**
 * Build a WayfinderGraph from arrays of nodes and edges.
 */
export function buildGraph(
  nodes: WayfinderNode[],
  edges: WayfinderEdge[],
): WayfinderGraph {
  const nodeMap = new Map<string, WayfinderNode>();
  const adjacency = new Map<string, WayfinderEdge[]>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    // Bidirectional
    adjacency.get(edge.from)?.push(edge);
    adjacency.get(edge.to)?.push({
      ...edge,
      from: edge.to,
      to: edge.from,
    });
  }

  return { nodes: nodeMap, edges: adjacency };
}

// ── Dijkstra ───────────────────────────────────────────────────

/**
 * Find the shortest path between two nodes using Dijkstra's algorithm.
 *
 * @param graph - The wayfinding graph
 * @param startId - Source node ID
 * @param endId - Destination node ID
 * @param accessibleOnly - If true, only use accessible edges (no stairs)
 */
export function findPath(
  graph: WayfinderGraph,
  startId: string,
  endId: string,
  accessibleOnly = false,
): WayfinderResult | null {
  const { nodes, edges } = graph;

  if (!nodes.has(startId) || !nodes.has(endId)) return null;

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const pq = new MinPriorityQueue();

  for (const id of nodes.keys()) {
    dist.set(id, Infinity);
    prev.set(id, null);
  }

  dist.set(startId, 0);
  pq.enqueue(startId, 0);

  while (pq.size > 0) {
    const current = pq.dequeue()!;
    const currentId = current.nodeId;
    const currentDist = current.priority;

    if (currentId === endId) break;

    // Skip if we already found a shorter path
    if (currentDist > (dist.get(currentId) ?? Infinity)) continue;

    const neighbours = edges.get(currentId) ?? [];
    for (const edge of neighbours) {
      // Skip inaccessible edges in accessible mode
      if (accessibleOnly && !edge.isAccessible) continue;

      // Determine edge cost (distance + floor-change penalties)
      let cost = edge.distance;
      const fromNode = nodes.get(currentId);
      const toNode = nodes.get(edge.to);

      if (fromNode && toNode && fromNode.floor !== toNode.floor) {
        if (edge.isStairs) {
          // In accessible mode, stairs are already filtered out above
          cost += STAIRS_PENALTY_S * WALKING_SPEED_MS;
        } else {
          cost += ELEVATOR_PENALTY_S * WALKING_SPEED_MS;
        }
      }

      const alt = (dist.get(currentId) ?? Infinity) + cost;
      if (alt < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, alt);
        prev.set(edge.to, currentId);
        pq.enqueue(edge.to, alt);
      }
    }
  }

  // Reconstruct path
  const totalDist = dist.get(endId) ?? Infinity;
  if (totalDist === Infinity) return null;

  const path: WayfinderNode[] = [];
  let current: string | null = endId;
  while (current !== null) {
    const node = nodes.get(current);
    if (node) path.unshift(node);
    current = prev.get(current) ?? null;
  }

  // Estimate time
  const totalSeconds = totalDist / WALKING_SPEED_MS;
  const estimatedTime = formatTime(totalSeconds);

  return {
    path,
    distance: totalDist,
    estimatedTime,
  };
}

/**
 * Format seconds into a human-readable duration string.
 */
function formatTime(seconds: number): string {
  const mins = Math.ceil(seconds / 60);
  if (mins < 1) return '< 1 Min.';
  if (mins === 1) return '1 Min.';
  return `${mins} Min.`;
}
