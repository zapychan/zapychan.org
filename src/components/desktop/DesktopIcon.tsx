import { useCallback } from "react";
import styled from "styled-components";
import { useIsMobile } from "../../hooks/useIsMobile";

interface DesktopIconProps {
  label: string;
  icon: React.ReactNode;
  onDoubleClick: () => void;
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
  style,
  className,
}: DesktopIconProps) {
  const isMobile = useIsMobile();

  const handleDoubleClick = useCallback(() => {
    onDoubleClick();
  }, [onDoubleClick]);

  const handleClick = useCallback(() => {
    if (isMobile) onDoubleClick();
  }, [isMobile, onDoubleClick]);

  return (
    <IconWrapper
      onDoubleClick={isMobile ? undefined : handleDoubleClick}
      onClick={isMobile ? handleClick : undefined}
      style={style}
      className={className}
    >
      <IconEmoji>{icon}</IconEmoji>
      <IconLabel className="icon-label">{label}</IconLabel>
    </IconWrapper>
  );
}
