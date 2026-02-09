import "styled-components";
import type { Theme } from "react95/dist/themes/types";

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface DefaultTheme extends Theme {}
}
