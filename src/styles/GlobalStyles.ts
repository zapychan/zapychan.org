import { createGlobalStyle } from "styled-components";
import { styleReset, createScrollbars } from "react95";

export const GlobalStyles = createGlobalStyle`
  ${styleReset}

  @font-face {
    font-family: 'ms_sans_serif';
    src: url('https://unpkg.com/react95@4.0.0/dist/fonts/ms_sans_serif.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'ms_sans_serif';
    src: url('https://unpkg.com/react95@4.0.0/dist/fonts/ms_sans_serif_bold.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
  }

  * {
    box-sizing: border-box;
  }

  img {
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    pointer-events: auto;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: 'ms_sans_serif', 'Tahoma', sans-serif;
    font-size: 13px;
    color: #8b0045;
  }

  /* Windows 95 scrollbar styling via react95 */
  ${createScrollbars()}
`;
