import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

declare const __BASE_PATH__: string;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={__BASE_PATH__ || undefined}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
