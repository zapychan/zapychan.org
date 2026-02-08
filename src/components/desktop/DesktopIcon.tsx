import { useCallback } from "react";
import styled from "styled-components";

interface DesktopIconProps {
  label: string;
  icon: string;
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
`;

const IconEmoji = styled.div`
  font-size: 40px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;

const IconLabel = styled.span`
  font-size: 13px;
  text-align: center;
  color: #8b0045;
  padding: 2px 4px;
  word-break: break-word;
  line-height: 1.3;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
`;

export function DesktopIcon({
  label,
  icon,
  onDoubleClick,
  style,
  className,
}: DesktopIconProps) {
  const handleDoubleClick = useCallback(() => {
    onDoubleClick();
  }, [onDoubleClick]);

  return (
    <IconWrapper
      onDoubleClick={handleDoubleClick}
      style={style}
      className={className}
    >
      <IconEmoji>{icon}</IconEmoji>
      <IconLabel className="icon-label">{label}</IconLabel>
    </IconWrapper>
  );
}
