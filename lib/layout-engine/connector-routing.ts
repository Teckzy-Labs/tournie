import { Connector } from '../../types/bracket';

export type ConnectorGeometry = {
  connector: Connector;
  path: string;
};

export function getStepConnectorPath(connector: Connector) {
  const midX = connector.startX + (connector.endX - connector.startX) / 2;
  return `M ${connector.startX} ${connector.startY} L ${midX} ${connector.startY} L ${midX} ${connector.endY} L ${connector.endX} ${connector.endY}`;
}

export function routeConnectors(connectors: Connector[]): ConnectorGeometry[] {
  return connectors.map((connector) => ({
    connector,
    path: getStepConnectorPath(connector)
  }));
}
