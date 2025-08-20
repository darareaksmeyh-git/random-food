import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import App from "./App";             // RandomFood page
import Login from "./pages/Login";   // Admin login
import Admin from "./pages/Admin";   // Admin dashboard
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/700.css";

// Customize Joy theme
const theme = extendTheme({
  fontFamily: {
    body: "Poppins, monospace, sans-serif",
    display: "Poppins, monospace, sans-serif",
    code: "monospace",
    fallback: "monospace, sans-serif",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />           {/* RandomFood */}
          <Route path="/login" element={<Login />} />    {/* Admin login */}
          <Route path="/admin" element={<Admin />} />    {/* Admin panel */}
        </Routes>
      </BrowserRouter>
    </CssVarsProvider>
  </React.StrictMode>
);
