import { Connector, LayoutNode, ViewportState } from '../types/bracket';
import { rectsIntersect } from './viewport';

export type RenderWindow = {
  nodes: LayoutNode[];
  connectors: Connector[];
  visibleNodeIds: Set<string>;
};

export function getRenderWindow(
  nodes: LayoutNode[],
  connectors: Connector[],
  viewport: ViewportState,
  enabled: boolean,
  padding = 600
): RenderWindow {
  if (!enabled || viewport.width <= 0 || viewport.height <= 0) {
    return {
      nodes,
      connectors,
      visibleNodeIds: new Set(nodes.map((node) => node.id))
    };
  }

  const bounds = {
    x: viewport.x - padding,
    y: viewport.y - padding,
    width: viewport.width + padding * 2,
    height: viewport.height + padding * 2
  };

  const visibleNodes = nodes.filter((node) => rectsIntersect(node, bounds));
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleConnectors = connectors.filter((connector) => {
    return visibleNodeIds.has(connector.sourceMatchId) || visibleNodeIds.has(connector.targetMatchId);
  });

  return {
    nodes: visibleNodes,
    connectors: visibleConnectors,
    visibleNodeIds
  };
}
