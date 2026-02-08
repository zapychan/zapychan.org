import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "zapychan-evil-mode";

interface EvilModeContextValue {
  isEvil: boolean;
  toggleEvil: () => void;
  disableEvil: () => void;
  isTransitioning: boolean;
}

const EvilModeContext = createContext<EvilModeContextValue>({
  isEvil: false,
  toggleEvil: () => {},
  disableEvil: () => {},
  isTransitioning: false,
});

export function EvilModeProvider({ children }: { children: ReactNode }) {
  const [isEvil, setIsEvil] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleEvil = useCallback(() => {
    setIsTransitioning(true);
    // Brief delay for the transition animation
    setTimeout(() => {
      setIsEvil((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // localStorage unavailable
        }
        return next;
      });
      setTimeout(() => setIsTransitioning(false), 500);
    }, 300);
  }, []);

  const disableEvil = useCallback(() => {
    setIsEvil(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return (
    <EvilModeContext.Provider
      value={{ isEvil, toggleEvil, disableEvil, isTransitioning }}
    >
      {children}
    </EvilModeContext.Provider>
  );
}

export function useEvilMode() {
  return useContext(EvilModeContext);
}
