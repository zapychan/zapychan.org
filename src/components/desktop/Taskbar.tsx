import { useState, useCallback, useEffect, useRef } from "react";
import { AppBar, Toolbar, Button, Frame } from "react95";
import styled from "styled-components";
import { Mmsys110, Sndvol32303, Globe } from "@react95/icons";
import { useWindowManager } from "../../hooks/useWindowManager";
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

const WindowButton = styled(Button) <{ $isActive: boolean }>`
  max-width: 170px;
  min-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const TrayCell = styled(Frame) <{ $clickable?: boolean }>`
  font-size: 13px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 8px;
  white-space: nowrap;

  &:hover:not([data-popup-open="true"]) {
    ${({ $clickable }) => $clickable && "filter: brightness(1.2);"}
  }
`;

/* ── Volume popup ── */

const VolumePopup = styled(Frame)`
  position: absolute;
  bottom: 30px;
  right: -10px;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 10001;
  min-width: 44px;
`;

const Win95Slider = styled.input`
  writing-mode: vertical-lr;
  direction: rtl;
  width: 24px;
  height: 110px;
  appearance: none;
  background: transparent;
  cursor: pointer;

  /* Track */
  &::-webkit-slider-runnable-track {
    width: 6px;
    height: 100%;
    background: ${({ theme }) => theme.canvas};
    border-left: 2px solid ${({ theme }) => theme.borderDarkest};
    border-top: 2px solid ${({ theme }) => theme.borderDarkest};
    border-right: 2px solid ${({ theme }) => theme.borderLightest};
    border-bottom: 2px solid ${({ theme }) => theme.borderLightest};
  }

  /* Thumb */
  &::-webkit-slider-thumb {
    appearance: none;
    width: 11px;
    height: 21px;
    background: ${({ theme }) => theme.material};
    border-top: 2px solid ${({ theme }) => theme.borderLightest};
    border-left: 2px solid ${({ theme }) => theme.borderLightest};
    border-bottom: 2px solid ${({ theme }) => theme.borderDarkest};
    border-right: 2px solid ${({ theme }) => theme.borderDarkest};
    box-shadow: inset 1px 1px 0 0 ${({ theme }) => theme.borderLight},
      inset -1px -1px 0 0 ${({ theme }) => theme.borderDark};
    margin-left: -3px;
  }

  &::-moz-range-track {
    width: 6px;
    background: ${({ theme }) => theme.canvas};
    border-left: 2px solid ${({ theme }) => theme.borderDarkest};
    border-top: 2px solid ${({ theme }) => theme.borderDarkest};
    border-right: 2px solid ${({ theme }) => theme.borderLightest};
    border-bottom: 2px solid ${({ theme }) => theme.borderLightest};
  }

  &::-moz-range-thumb {
    width: 11px;
    height: 21px;
    border-radius: 0;
    background: ${({ theme }) => theme.material};
    border-top: 2px solid ${({ theme }) => theme.borderLightest};
    border-left: 2px solid ${({ theme }) => theme.borderLightest};
    border-bottom: 2px solid ${({ theme }) => theme.borderDarkest};
    border-right: 2px solid ${({ theme }) => theme.borderDarkest};
    box-shadow: inset 1px 1px 0 0 ${({ theme }) => theme.borderLight},
      inset -1px -1px 0 0 ${({ theme }) => theme.borderDark};
  }
`;

const TickMarks = styled.div`
  position: absolute;
  right: 4px;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 0;
`;

const Tick = styled.div`
  width: 4px;
  height: 1px;
  background: ${({ theme }) => theme.materialText};
`;

const SliderWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 10px;
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

function weatherEmoji(code: number): string {
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
  const isMobile = useIsMobile();
  const [startOpen, setStartOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volume, setVolume] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const time = useTime();
  const weather = useWeather();
  const taskbarRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio("/audio/bgm.webm");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Sync volume and play/pause
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = newVolume / 100;
    if (newVolume > 0 && audio.paused) {
      audio.play().catch(() => {});
    } else if (newVolume === 0) {
      audio.pause();
    }
  }, []);

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

  const volumeIcon = volume === 0 ? <Sndvol32303 variant="16x16_4" /> : <Mmsys110 variant="16x16_4" />;

  return (
    <TaskbarWrapper ref={taskbarRef}>
      <TaskbarToolbar>
        <StartButton active={startOpen} onClick={toggleStart}>
          <img src="/images/icons/pfp-icon.png" width={22} height={22} style={{ marginRight: 4, imageRendering: "pixelated" }} alt="" /> Start
        </StartButton>

        <WindowButtons>
          {windows.map((w) => (
            <WindowButton
              key={w.id}
              $isActive={!w.isMinimized}
              active={!w.isMinimized}
              onClick={() => handleWindowButton(w.id, w.isMinimized)}
            >
              {w.title}
            </WindowButton>
          ))}
        </WindowButtons>

        <SystemTray>
          {/* Volume */}
          <TrayCell
            variant="status"
            ref={volumeRef}
            $clickable
            data-popup-open={volumeOpen ? "true" : undefined}
            title={`Volume: ${volume}%`}
            onClick={() => {
              setVolumeOpen((v) => !v);
              setStartOpen(false);
            }}
          >
            {volumeIcon}
            {volumeOpen && (
              <VolumePopup variant="window" shadow onClick={(e) => e.stopPropagation()}>
                <VolumeLabel>
                  {`${volume}%`}
                </VolumeLabel>
                <SliderWrapper>
                  <Win95Slider
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  />
                  <TickMarks>
                    {Array.from({ length: 11 }, (_, i) => (
                      <Tick key={i} />
                    ))}
                  </TickMarks>
                </SliderWrapper>
                <div style={{ fontSize: 13 }}>
                  {volumeIcon}
                </div>
              </VolumePopup>
            )}
          </TrayCell>

          {/* Internet connected */}
          {!isMobile && (
            <TrayCell
              variant="status"
              title="Internet connected"
            >
              <Globe variant="16x16_4" />
            </TrayCell>
          )}

          {/* Weather (NYC) */}
          {weather && (
            <TrayCell variant="status" title={`NYC: ${weather.temp}°F`}>
              {weatherEmoji(weather.code)}{" "}
              {`${weather.temp}°`}
            </TrayCell>
          )}

          {/* Clock */}
          <TrayCell variant="status">{time}</TrayCell>
        </SystemTray>
      </TaskbarToolbar>

      {startOpen && <StartMenu onClose={closeStart} />}
    </TaskbarWrapper>
  );
}
