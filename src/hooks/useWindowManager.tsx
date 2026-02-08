import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  useCallback,
} from "react";

export interface WindowState {
  id: string;
  title: string;
  componentKey: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  props?: Record<string, unknown>;
}

type Action =
  | {
    type: "OPEN_WINDOW";
    payload: {
      id: string;
      title: string;
      componentKey: string;
      props?: Record<string, unknown>;
    };
  }
  | { type: "CLOSE_WINDOW"; payload: string }
  | { type: "FOCUS_WINDOW"; payload: string }
  | { type: "MINIMIZE_WINDOW"; payload: string }
  | { type: "RESTORE_WINDOW"; payload: string }
  | {
    type: "MOVE_WINDOW";
    payload: { id: string; position: { x: number; y: number } };
  };

interface State {
  windows: WindowState[];
  nextZIndex: number;
}

const initialState: State = {
  windows: [],
  nextZIndex: 10,
};

// Cascade new windows so they don't stack exactly
let cascadeOffset = 0;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_WINDOW": {
      const existing = state.windows.find((w) => w.id === action.payload.id);
      if (existing) {
        // Focus existing window and restore if minimized
        return {
          ...state,
          windows: state.windows.map((w) =>
            w.id === action.payload.id
              ? { ...w, zIndex: state.nextZIndex, isMinimized: false }
              : w,
          ),
          nextZIndex: state.nextZIndex + 1,
        };
      }
      cascadeOffset = (cascadeOffset + 1) % 8;
      const newWindow: WindowState = {
        id: action.payload.id,
        title: action.payload.title,
        componentKey: action.payload.componentKey,
        position: { x: 60 + cascadeOffset * 30, y: 40 + cascadeOffset * 30 },
        size: { width: 600, height: 600 },
        zIndex: state.nextZIndex,
        isMinimized: false,
        props: action.payload.props,
      };
      return {
        windows: [...state.windows, newWindow],
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case "CLOSE_WINDOW":
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.payload),
      };
    case "FOCUS_WINDOW":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload ? { ...w, zIndex: state.nextZIndex } : w,
        ),
        nextZIndex: state.nextZIndex + 1,
      };
    case "MINIMIZE_WINDOW":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload ? { ...w, isMinimized: true } : w,
        ),
      };
    case "RESTORE_WINDOW":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload
            ? { ...w, isMinimized: false, zIndex: state.nextZIndex }
            : w,
        ),
        nextZIndex: state.nextZIndex + 1,
      };
    case "MOVE_WINDOW":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id
            ? { ...w, position: action.payload.position }
            : w,
        ),
      };
    default:
      return state;
  }
}

interface WindowManagerContextValue {
  windows: WindowState[];
  openWindow: (
    id: string,
    title: string,
    componentKey: string,
    props?: Record<string, unknown>,
  ) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, position: { x: number; y: number }) => void;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(
  null,
);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const openWindow = useCallback(
    (
      id: string,
      title: string,
      componentKey: string,
      props?: Record<string, unknown>,
    ) => {
      dispatch({
        type: "OPEN_WINDOW",
        payload: { id, title, componentKey, props },
      });
    },
    [],
  );

  const closeWindow = useCallback((id: string) => {
    dispatch({ type: "CLOSE_WINDOW", payload: id });
  }, []);

  const focusWindow = useCallback((id: string) => {
    dispatch({ type: "FOCUS_WINDOW", payload: id });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    dispatch({ type: "MINIMIZE_WINDOW", payload: id });
  }, []);

  const restoreWindow = useCallback((id: string) => {
    dispatch({ type: "RESTORE_WINDOW", payload: id });
  }, []);

  const moveWindow = useCallback(
    (id: string, position: { x: number; y: number }) => {
      dispatch({ type: "MOVE_WINDOW", payload: { id, position } });
    },
    [],
  );

  return (
    <WindowManagerContext.Provider
      value={{
        windows: state.windows,
        openWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        restoreWindow,
        moveWindow,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx)
    throw new Error("useWindowManager must be used within WindowManagerProvider");
  return ctx;
}
