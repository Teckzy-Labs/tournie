import React from 'react';
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { BracketConfig, Connector, LayoutGroup, LayoutNode, Match, ViewportState } from '../../types/bracket';
import { calculateVisibleRegion } from '../../lib/viewport';
import { BracketCanvas } from './BracketCanvas';
import { BracketMinimap } from './BracketMinimap';
import { BracketToolbar } from './BracketToolbar';

interface BracketViewportProps {
  bracketRef: React.RefObject<HTMLDivElement | null>;
  zoomLocked: boolean;
  onToggleZoomLock: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  nodes: LayoutNode[];
  connectors: Connector[];
  groups: LayoutGroup[];
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  hoveredParticipantId: string | null;
  onHoverParticipant: (id: string | null) => void;
  onMatchClick: (match: Match) => void;
  onMatchDoubleClick: (match: Match, zoomToElement: (id: string, scale?: number, animationTime?: number) => void) => void;
  onViewportChange: (viewport: ViewportState) => void;
  viewport: ViewportState;
  showMinimap: boolean;
  virtualizationEnabled: boolean;
  config: BracketConfig;
}

function getViewportFromTransform(ref: ReactZoomPanPinchRef): ViewportState {
  const wrapper = ref.instance.wrapperComponent;
  const width = wrapper?.clientWidth || 0;
  const height = wrapper?.clientHeight || 0;

  return calculateVisibleRegion(ref.state.scale, ref.state.positionX, ref.state.positionY, width, height);
}

export const BracketViewport = React.memo(function BracketViewport({
  bracketRef,
  zoomLocked,
  onToggleZoomLock,
  onExportPDF,
  onExportExcel,
  nodes,
  connectors,
  groups,
  width,
  height,
  offsetX,
  offsetY,
  hoveredParticipantId,
  onHoverParticipant,
  onMatchClick,
  onMatchDoubleClick,
  onViewportChange,
  viewport,
  showMinimap,
  virtualizationEnabled,
  config
}: BracketViewportProps) {
  return (
    <div className="flex-1 relative overflow-hidden" ref={bracketRef}>
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={2}
        centerOnInit={false}
        initialPositionX={20}
        initialPositionY={20}
        wheel={{ step: 0.02, disabled: zoomLocked }}
        panning={{ disabled: false }}
        pinch={{ disabled: zoomLocked, step: 3 }}
        doubleClick={{ disabled: zoomLocked, mode: 'reset' }}
        limitToBounds={false}
        onInit={(ref) => onViewportChange(getViewportFromTransform(ref))}
        onTransform={(ref) => onViewportChange(getViewportFromTransform(ref))}
      >
        {({ zoomIn, zoomOut, resetTransform, setTransform, zoomToElement }) => (
          <>
            <BracketToolbar
              zoomLocked={zoomLocked}
              onToggleZoomLock={onToggleZoomLock}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetTransform={resetTransform}
              onExportPDF={onExportPDF}
              onExportExcel={onExportExcel}
            />

            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ padding: '80px' }}>
              <BracketCanvas
                nodes={nodes}
                connectors={connectors}
                groups={groups}
                width={width}
                height={height}
                offsetX={offsetX}
                offsetY={offsetY}
                hoveredParticipantId={hoveredParticipantId}
                onHoverParticipant={onHoverParticipant}
                onMatchClick={onMatchClick}
                onMatchDoubleClick={(match) => onMatchDoubleClick(match, zoomToElement)}
                viewport={viewport}
                virtualizationEnabled={virtualizationEnabled}
                config={config}
              />
            </TransformComponent>
            {showMinimap && (
              <BracketMinimap
                nodes={nodes.map((node) => ({ ...node, x: node.x + offsetX, y: node.y + offsetY }))}
                groups={groups.map((group) => ({ ...group, x: group.x + offsetX, y: group.y + offsetY }))}
                canvasWidth={width}
                canvasHeight={height}
                viewport={viewport}
                onFocus={(x, y) => {
                  const wrapper = bracketRef.current;
                  const viewportWidth = wrapper?.clientWidth || 0;
                  const viewportHeight = wrapper?.clientHeight || 0;
                  setTransform(
                    viewportWidth / 2 - x * viewport.scale,
                    viewportHeight / 2 - y * viewport.scale,
                    viewport.scale,
                    250
                  );
                }}
              />
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
});
