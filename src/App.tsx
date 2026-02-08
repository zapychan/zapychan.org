import { ThemeProvider } from "styled-components";
import { pinkTheme, evilTheme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import { WindowManagerProvider } from "./hooks/useWindowManager";
import { EvilModeProvider, useEvilMode } from "./hooks/useEvilMode";
import { Desktop } from "./components/desktop/Desktop";

function AppInner() {
  const { isEvil } = useEvilMode();
  return (
    <ThemeProvider theme={isEvil ? evilTheme : pinkTheme}>
      <GlobalStyles $isEvil={isEvil} />
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <EvilModeProvider>
      <AppInner />
    </EvilModeProvider>
  );
}

export default App;
