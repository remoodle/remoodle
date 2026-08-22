import {
  ChakraProvider,
  ThemeProvider,
  theme,
  ColorModeProvider,
  CSSReset,
} from "@chakra-ui/react";
import Home from "../page/Home";
import { isIOS } from "mobile-device-detect";
import MapProvider from "./MapProvider";

function App() {
  return (
    <MapProvider>
      <ChakraProvider>
        <ThemeProvider theme={theme}>
          <ColorModeProvider>
            <CSSReset />
            <Home isIOS={isIOS} />
          </ColorModeProvider>
        </ThemeProvider>
      </ChakraProvider>
    </MapProvider>
  );
}

export default App;
