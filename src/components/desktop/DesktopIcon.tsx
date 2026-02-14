import { useCallback, useRef } from "react";
import Draggable from "react-draggable";
import type { DraggableData, DraggableEvent } from "react-draggable";
import styled from "styled-components";
import { useIsMobile } from "../../hooks/useIsMobile";

interface DesktopIconProps {
  label: string;
  icon: React.ReactNode;
  onDoubleClick: () => void;
  position?: { x: number; y: number };
  onDragEnd?: (pos: { x: number; y: number }) => void;
  style?: React.CSSProperties;
  className?: string;
}

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90px;
  padding: 6px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;

  &.react-draggable-dragging {
    z-index: 1000;
    opacity: 0.85;
  }

  &:hover .icon-label {
    background: #ff69b4;
    color: white;
  }

  @media (max-width: 767px) {
    width: 96px;
    padding: 8px;
  }
`;

const IconEmoji = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;

  @media (max-width: 767px) {
    width: 64px;
    height: 64px;
  }
`;

const IconLabel = styled.span`
  font-size: 13px;
  text-align: center;
  color: #8b0045;
  padding: 2px 4px;
  word-break: break-word;
  line-height: 1.3;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);

  @media (max-width: 767px) {
    font-size: 14px;
  }
`;

export function DesktopIcon({
  label,
  icon,
  onDoubleClick,
  position,
  onDragEnd,
  style,
  className,
}: DesktopIconProps) {
  const isMobile = useIsMobile();
  const nodeRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((_e: DraggableEvent, data: DraggableData) => {
    dragStartPos.current = { x: data.x, y: data.y };
    isDraggingRef.current = false;
  }, []);

  const handleDrag = useCallback((_e: DraggableEvent, data: DraggableData) => {
    const dx = data.x - dragStartPos.current.x;
    const dy = data.y - dragStartPos.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      isDraggingRef.current = true;
    }
  }, []);

  const handleStop = useCallback(
    (_e: DraggableEvent, data: DraggableData) => {
      const wasDragging = isDraggingRef.current;
      isDraggingRef.current = false;
      if (wasDragging && onDragEnd) {
        onDragEnd({ x: data.x, y: data.y });
      }
    },
    [onDragEnd],
  );

  const handleDoubleClick = useCallback(() => {
    if (isDraggingRef.current) return;
    onDoubleClick();
  }, [onDoubleClick]);

  const handleClick = useCallback(() => {
    if (isDraggingRef.current) return;
    if (isMobile) onDoubleClick();
  }, [isMobile, onDoubleClick]);

  const iconElement = (
    <IconWrapper
      ref={nodeRef}
      onDoubleClick={isMobile ? undefined : handleDoubleClick}
      onClick={isMobile ? handleClick : undefined}
      style={style}
      className={className}
    >
      <IconEmoji>{icon}</IconEmoji>
      <IconLabel className="icon-label">{label}</IconLabel>
    </IconWrapper>
  );

  if (position) {
    return (
      <Draggable
        nodeRef={nodeRef as React.RefObject<HTMLElement>}
        position={position}
        bounds="parent"
        onStart={handleStart}
        onDrag={handleDrag}
        onStop={handleStop}
      >
        {iconElement}
      </Draggable>
    );
  }

  return iconElement;
}
