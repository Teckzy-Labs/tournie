import * as d3 from 'd3-hierarchy';
import { Match, LayoutNode, Connector } from '../types/bracket';

export const NODE_WIDTH = 250;
export const NODE_HEIGHT = 80;
export const HORIZONTAL_SPACING = 50;
export const VERTICAL_SPACING = 30;

export function calculateBracketLayout(matches: Match[]): {
  nodes: LayoutNode[];
  connectors: Connector[];
} {
  // Simple check for Single vs Double Elimination
  const loserMatches = matches.filter(m => m.isLoserBracket);
  const winnerMatches = matches.filter(m => !m.isLoserBracket);

  const winnerLayout = calculateTreeLayout(winnerMatches, 0, 0);
  
  let loserLayout = { nodes: [] as LayoutNode[], connectors: [] as Connector[] };
  let yOffset = winnerLayout.nodes.length > 0 
      ? Math.max(...winnerLayout.nodes.map(n => n.y)) + NODE_HEIGHT + 100 
      : 0;

  if (loserMatches.length > 0) {
    loserLayout = calculateTreeLayout(loserMatches, 0, yOffset);
  }

  // Combine
  const nodes = [...winnerLayout.nodes, ...loserLayout.nodes];
  const connectors = [...winnerLayout.connectors, ...loserLayout.connectors];

  // TODO: Add connectors from Loser Bracket to Grand Final if necessary
  // This depends on the specific double elimination structure

  return { nodes, connectors };
}

function calculateTreeLayout(matches: Match[], startX: number, startY: number): {
    nodes: LayoutNode[];
    connectors: Connector[];
} {
    if (matches.length === 0) return { nodes: [], connectors: [] };

    // 1. Find the root (the match that does NOT have a nextMatchId pointing to a match in THIS list)
    const matchIds = new Set(matches.map(m => m.id));
    let rootMatches = matches.filter(m => !m.nextMatchId || !matchIds.has(m.nextMatchId));

    // If there are multiple roots (e.g., grouped stages), we handle them by wrapping in a pseudo-root
    let rootMatch = rootMatches[0]; 

    // Create a hierarchy map
    const childrenMap = new Map<string, Match[]>();
    matches.forEach(m => {
        if (m.nextMatchId && matchIds.has(m.nextMatchId)) {
            if (!childrenMap.has(m.nextMatchId)) childrenMap.set(m.nextMatchId, []);
            childrenMap.get(m.nextMatchId)!.push(m);
        }
    });

    // Custom layout algorithm since d3.tree is strictly top-down and expects a single root.
    // Brackets are typically drawn Left-to-Right. 
    // We will build a tree structure and assign X based on depth, and Y based on leaf nodes.

    type TreeNode = {
        match: Match;
        children: TreeNode[];
        depth: number;
        x?: number; // visual Y
        y?: number; // visual X
    };

    function buildTree(match: Match, depth: number): TreeNode {
        const children = childrenMap.get(match.id) || [];
        return {
            match,
            depth,
            children: children.map(c => buildTree(c, depth + 1))
        };
    }

    const tree = buildTree(rootMatch, 0);
    const maxDepth = getDepth(tree);

    // Assign visual X coordinates (depth reversed)
    const nodes: LayoutNode[] = [];
    let currentLeafY = startY;

    function assignCoordinates(node: TreeNode): number {
        const visualX = startX + (maxDepth - node.depth) * (NODE_WIDTH + HORIZONTAL_SPACING);
        let visualY = 0;

        if (node.children.length === 0) {
            visualY = currentLeafY;
            currentLeafY += NODE_HEIGHT + VERTICAL_SPACING;
        } else {
            // Parent's Y is the average of its children's Ys
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
            roundIndex: maxDepth - node.depth
        });

        return visualY;
    }

    assignCoordinates(tree);

    // Generate Connectors
    const connectors: Connector[] = [];
    nodes.forEach(node => {
        if (node.nextMatchId) {
            const nextNode = nodes.find(n => n.id === node.nextMatchId);
            if (nextNode) {
                connectors.push({
                    id: `conn-${node.id}-${nextNode.id}`,
                    sourceMatchId: node.id,
                    targetMatchId: nextNode.id,
                    startX: node.x + NODE_WIDTH,
                    startY: node.y + NODE_HEIGHT / 2,
                    endX: nextNode.x,
                    endY: nextNode.y + NODE_HEIGHT / 2,
                    isLoserBracket: node.isLoserBracket
                });
            }
        }
    });

    return { nodes, connectors };
}

function getDepth(node: any): number {
    if (!node.children || node.children.length === 0) return 0;
    return 1 + Math.max(...node.children.map(getDepth));
}
