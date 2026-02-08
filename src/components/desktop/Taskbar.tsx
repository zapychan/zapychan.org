import { useState, useCallback, useEffect, useRef } from "react";
import { AppBar, Toolbar, Button } from "react95";
import styled from "styled-components";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useEvilMode } from "../../hooks/useEvilMode";
import { useIsMobile } from "../../hooks/useIsMobile";
import { StartMenu } from "./StartMenu";

const TaskbarWrapper = styled(AppBar)`
  position: fixed !important;
  bottom: 0;
  top: auto !important;
  left: 0;
  right: 0;
  z-index: 9999;
`;

const TaskbarToolbar = styled(Toolbar)`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  position: relative;
  min-height: 40px;
`;

const StartButton = styled(Button)`
  font-weight: bold;
  min-width: 80px;
  font-size: 15px;
  padding: 4px 10px;
`;

const WindowButtons = styled.div`
  display: flex;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 0;
  }
`;

const WindowButton = styled(Button)<{ $isActive: boolean }>`
  font-size: 13px;
  max-width: 170px;
  min-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 3px 8px;
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.8)};
`;

/* ── System Tray (right-side notification area) ── */

const SystemTray = styled.div`
  display: flex;
  align-items: stretch;
  gap: 4px;
  flex-shrink: 0;
  align-self: stretch;
`;

const TrayCell = styled.span<{ $clickable?: boolean }>`
  font-size: 13px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 8px;
  border-style: inset;
  border-width: 2px;
  white-space: nowrap;

  &:hover {
    ${({ $clickable }) => $clickable && "filter: brightness(1.2);"}
  }
`;

/* ── Volume popup ── */

const VolumePopup = styled.div`
  position: absolute;
  bottom: 30px;
  right: -10px;
  background: ${({ theme }) => theme.material};
  border: 2px outset ${({ theme }) => theme.borderLight};
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 10001;
  min-width: 44px;
  box-shadow: 2px 2px 0 ${({ theme }) => theme.borderDarkest};
`;

const VolumeSliderTrack = styled.div`
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VolumeSlider = styled.input`
  writing-mode: vertical-lr;
  direction: rtl;
  width: 22px;
  height: 100px;
  appearance: auto;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.headerBackground};
`;

const VolumeLabel = styled.div`
  font-size: 11px;
  text-align: center;
  font-weight: bold;
`;

/* ── Hooks ── */

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);
  return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function weatherEmoji(code: number, isEvil: boolean): string {
  if (isEvil) {
    if (code === 0) return "🌑";
    if (code <= 3) return "🌫️";
    if (code <= 48) return "👁️";
    if (code <= 67) return "🩸";
    if (code <= 77) return "💀";
    if (code >= 95) return "⛈️";
    return "👁️";
  }
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

function useWeather() {
  const [weather, setWeather] = useState<{
    temp: number;
    code: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        const res = await fetch("/api/weather");
        const data = await res.json();
        if (!cancelled && data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
          });
        }
      } catch {
        // silently fail
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600_000); // refresh every 10 min
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return weather;
}

/* ── Component ── */

export function Taskbar() {
  const { windows, minimizeWindow, restoreWindow } = useWindowManager();
  const { isEvil } = useEvilMode();
  const isMobile = useIsMobile();
  const [startOpen, setStartOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volume, setVolume] = useState(75);
  const time = useTime();
  const weather = useWeather();
  const taskbarRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLSpanElement>(null);

  // Close popups on outside click
  useEffect(() => {
    if (!startOpen && !volumeOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        startOpen &&
        taskbarRef.current &&
        !taskbarRef.current.contains(target)
      ) {
        setStartOpen(false);
      }
      if (
        volumeOpen &&
        volumeRef.current &&
        !volumeRef.current.contains(target)
      ) {
        setVolumeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [startOpen, volumeOpen]);

  const toggleStart = useCallback(() => {
    setStartOpen((prev) => !prev);
    setVolumeOpen(false);
  }, []);

  const closeStart = useCallback(() => {
    setStartOpen(false);
  }, []);

  const handleWindowButton = useCallback(
    (id: string, isMinimized: boolean) => {
      if (isMinimized) {
        restoreWindow(id);
      } else {
        minimizeWindow(id);
      }
    },
    [restoreWindow, minimizeWindow],
  );

  const volumeIcon =
    volume === 0 ? "🔇" : volume < 33 ? "🔈" : volume < 66 ? "🔉" : "🔊";

  return (
    <TaskbarWrapper ref={taskbarRef}>
      <TaskbarToolbar>
        <StartButton active={startOpen} onClick={toggleStart}>
          {isEvil ? "💀 Start" : "💖 Start"}
        </StartButton>

        <WindowButtons>
          {windows.map((w) => (
            <WindowButton
              key={w.id}
              $isActive={!w.isMinimized}
              active={!w.isMinimized}
              size="sm"
              onClick={() => handleWindowButton(w.id, w.isMinimized)}
            >
              {w.title}
            </WindowButton>
          ))}
        </WindowButtons>

        <SystemTray>
          {/* Volume */}
          <TrayCell
            ref={volumeRef}
            $clickable
            title={isEvil ? "SCREAMS" : `Volume: ${volume}%`}
            onClick={() => {
              setVolumeOpen((v) => !v);
              setStartOpen(false);
            }}
          >
            {isEvil ? "🔇" : volumeIcon}
            {volumeOpen && (
              <VolumePopup onClick={(e) => e.stopPropagation()}>
                <VolumeLabel>
                  {isEvil ? "???" : `${volume}%`}
                </VolumeLabel>
                <VolumeSliderTrack>
                  <VolumeSlider
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                  />
                </VolumeSliderTrack>
                <div style={{ fontSize: 13 }}>
                  {isEvil ? "🔇" : volumeIcon}
                </div>
              </VolumePopup>
            )}
          </TrayCell>

          {/* Mail indicator */}
          {!isMobile && (
            <TrayCell
              title={
                isEvil ? "666 unread messages" : "0 unread messages"
              }
            >
              {isEvil ? "📧" : "✉️"}
            </TrayCell>
          )}

          {/* Weather (NYC) */}
          {weather && (
            <TrayCell title={`NYC: ${weather.temp}°F`}>
              {weatherEmoji(weather.code, isEvil)}{" "}
              {isEvil ? "??°" : `${weather.temp}°`}
            </TrayCell>
          )}

          {/* Clock */}
          <TrayCell>{time}</TrayCell>
        </SystemTray>
      </TaskbarToolbar>

      {startOpen && <StartMenu onClose={closeStart} />}
    </TaskbarWrapper>
  );
}
