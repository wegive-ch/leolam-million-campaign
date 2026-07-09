import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MissaoLanding } from "./routes/index";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MissaoLanding />
  </StrictMode>,
);
