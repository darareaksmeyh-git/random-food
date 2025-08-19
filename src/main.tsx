import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/700.css";

// Customize Joy theme
const theme = extendTheme({
  fontFamily: {
    body: "monospace, sans-serif",
    display: "monospace, sans-serif",
    code: "monospace",
    fallback: "monospace, sans-serif",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <App />
    </CssVarsProvider>
  </React.StrictMode>
);
