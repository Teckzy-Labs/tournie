import { Match, LayoutNode, Connector, LayoutGroup } from '../types/bracket';

export const DEFAULT_NODE_WIDTH = 220;
export const DEFAULT_NODE_HEIGHT = 80;
export const DEFAULT_HORIZONTAL_SPACING = 50;
export const DEFAULT_VERTICAL_SPACING = 30;

export interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
}

export function calculateBracketLayout(matches: Match[], options: LayoutOptions = {}): {
  nodes: LayoutNode[];
  connectors: Connector[];
  groups: LayoutGroup[];
} {
  const NODE_WIDTH = options.nodeWidth || DEFAULT_NODE_WIDTH;
  const NODE_HEIGHT = options.nodeHeight || DEFAULT_NODE_HEIGHT;
  const HORIZONTAL_SPACING = DEFAULT_HORIZONTAL_SPACING;
  const VERTICAL_SPACING = DEFAULT_VERTICAL_SPACING;

  // 1. Assign default groups if not specified
  matches.forEach(m => {
    if (!m.group) {
      m.group = m.isLoserBracket ? "Losers Bracket" : "Winners Bracket";
    }
  });

  // 2. Separate into unique groups
  const groupNames = Array.from(new Set(matches.map(m => m.group!)));
  
  // Sort groups: "Winners Bracket" first, "Losers Bracket" second, then alphabetical
  groupNames.sort((a, b) => {
    if (a === "Winners Bracket") return -1;
    if (b === "Winners Bracket") return 1;
    if (a === "Losers Bracket") return -1;
    if (b === "Losers Bracket") return 1;
    return a.localeCompare(b);
  });

  const allNodes: LayoutNode[] = [];
  const allConnectors: Connector[] = [];
  const layoutGroups: LayoutGroup[] = [];

  let currentYOffset = 0;

  // 3. Layout each group vertically stacked
  groupNames.forEach(groupName => {
    const groupMatches = matches.filter(m => m.group === groupName);
    
    // Calculate layout for this group
    const { nodes, connectors } = calculateForestLayout(groupMatches, 0, currentYOffset, NODE_WIDTH, NODE_HEIGHT, HORIZONTAL_SPACING, VERTICAL_SPACING);
    
    if (nodes.length === 0) return;

    allNodes.push(...nodes);
    allConnectors.push(...connectors);

    // Calculate bounding box for the group
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x)) + NODE_WIDTH;
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y)) + NODE_HEIGHT;

    // Add padding for the group box (30px top for title, 20px sides/bottom)
    const paddingX = 30;
    const paddingTop = 50;
    const paddingBottom = 30;

    layoutGroups.push({
      id: `group-${groupName}`,
      title: groupName,
      x: minX - paddingX,
      y: minY - paddingTop,
      width: (maxX - minX) + paddingX * 2,
      height: (maxY - minY) + paddingTop + paddingBottom
    });

    // Advance Y offset for the next group
    currentYOffset = maxY + paddingTop + paddingBottom + 50; 
  });

  // 4. Generate inter-group connectors (e.g., LB to Grand Final)
  // Our forest layout generator only connected nodes within the SAME group pass.
  // We need to connect nodes that point outside their group.
  matches.forEach(nodeMatch => {
    const node = allNodes.find(n => n.id === nodeMatch.id);
    if (!node) return;

    // Standard Next Match
    if (nodeMatch.nextMatchId) {
      const targetNode = allNodes.find(n => n.id === nodeMatch.nextMatchId);
      // Only generate if it wasn't already generated (cross-group)
      if (targetNode && !allConnectors.some(c => c.sourceMatchId === node.id && c.targetMatchId === targetNode.id)) {
         allConnectors.push(createConnector(node, targetNode, NODE_WIDTH, NODE_HEIGHT));
      }
    }
    // Loser Next Match
    if (nodeMatch.nextLooserMatchId) {
      const targetNode = allNodes.find(n => n.id === nodeMatch.nextLooserMatchId);
      if (targetNode && !allConnectors.some(c => c.sourceMatchId === node.id && c.targetMatchId === targetNode.id)) {
         allConnectors.push(createConnector(node, targetNode, NODE_WIDTH, NODE_HEIGHT, true));
      }
    }
  });

  return { nodes: allNodes, connectors: allConnectors, groups: layoutGroups };
}

function createConnector(source: LayoutNode, target: LayoutNode, nodeWidth: number, nodeHeight: number, isLoser: boolean = false): Connector {
  return {
    id: `conn-${source.id}-${target.id}${isLoser ? '-lb' : ''}`,
    sourceMatchId: source.id,
    targetMatchId: target.id,
    startX: source.x + nodeWidth,
    startY: source.y + nodeHeight / 2,
    endX: target.x,
    endY: target.y + nodeHeight / 2,
    isLoserBracket: isLoser
  };
}

// Handles a forest of matches (multiple distinct roots)
function calculateForestLayout(
  matches: Match[], 
  startX: number, 
  startY: number,
  NODE_WIDTH: number,
  NODE_HEIGHT: number,
  HORIZONTAL_SPACING: number,
  VERTICAL_SPACING: number
): { nodes: LayoutNode[]; connectors: Connector[] } {
  if (matches.length === 0) return { nodes: [], connectors: [] };

  const matchIds = new Set(matches.map(m => m.id));
  
  // Find roots: matches that do NOT point to another match in THIS specific forest
  const rootMatches = matches.filter(m => !m.nextMatchId || !matchIds.has(m.nextMatchId));

  const childrenMap = new Map<string, Match[]>();
  matches.forEach(m => {
      if (m.nextMatchId && matchIds.has(m.nextMatchId)) {
          if (!childrenMap.has(m.nextMatchId)) childrenMap.set(m.nextMatchId, []);
          childrenMap.get(m.nextMatchId)!.push(m);
      }
  });

  type TreeNode = {
      match: Match;
      children: TreeNode[];
      depth: number;
  };

  function buildTree(match: Match, currentDepth: number): TreeNode {
      const children = childrenMap.get(match.id) || [];
      return {
          match,
          depth: currentDepth,
          children: children.map(c => buildTree(c, currentDepth + 1))
      };
  }

  // Determine overall max depth across all roots to align finals on the right
  const trees = rootMatches.map(r => buildTree(r, 0));
  const maxDepthOverall = Math.max(0, ...trees.map(getDepth));

  const nodes: LayoutNode[] = [];
  const connectors: Connector[] = [];
  
  let currentLeafY = startY;

  // To support disconnected trees in the same group (e.g. 3rd place match next to GF), 
  // we layout each root tree.
  trees.forEach(tree => {
      // Find relative max depth for this specific tree if we wanted it left-aligned,
      // but usually brackets align to the right (Finals align).
      
      function assignCoordinates(node: TreeNode): number {
          // Right-aligned: (maxDepthOverall - node.depth)
          // So if overall max depth is 3, a root (depth 0) goes at X = 3 * width
          const visualX = startX + (maxDepthOverall - node.depth) * (NODE_WIDTH + HORIZONTAL_SPACING);
          let visualY = 0;

          if (node.children.length === 0) {
              visualY = currentLeafY;
              currentLeafY += NODE_HEIGHT + VERTICAL_SPACING;
          } else {
              let sumY = 0;
              node.children.forEach(c => {
                  sumY += assignCoordinates(c);
              });
              visualY = sumY / node.children.length;
          }

          nodes.push({
              ...node.match,
              x: visualX,
              y: visualY,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
              roundIndex: maxDepthOverall - node.depth
          });

          return visualY;
      }

      assignCoordinates(tree);
      // add vertical spacing between distinct trees in the same group
      currentLeafY += VERTICAL_SPACING;
  });

  // Internal group connectors
  nodes.forEach(node => {
      if (node.nextMatchId && matchIds.has(node.nextMatchId)) {
          const nextNode = nodes.find(n => n.id === node.nextMatchId);
          if (nextNode) {
              connectors.push(createConnector(node, nextNode, NODE_WIDTH, NODE_HEIGHT));
          }
      }
  });

  return { nodes, connectors };
}

function getDepth(node: any): number {
  if (!node.children || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(getDepth));
}
