import isPropValid from "@emotion/is-prop-valid";
import { ThemeProvider, StyleSheetManager } from "styled-components";
import { pinkTheme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import { WindowManagerProvider } from "./hooks/useWindowManager";
import { Desktop } from "./components/desktop/Desktop";

export function App() {
  return (
    <StyleSheetManager shouldForwardProp={isPropValid}>
      <ThemeProvider theme={pinkTheme}>
        <GlobalStyles />
        <WindowManagerProvider>
          <Desktop />
        </WindowManagerProvider>
      </ThemeProvider>
    </StyleSheetManager>
  );
}

export default App;
