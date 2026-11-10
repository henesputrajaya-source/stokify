import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import BarangProvider from "./context/BarangProvider";
import TransaksiProvider from "./context/TransaksiProvider";
import PenggunaProvider from "./context/PenggunaProvider";
import SettingsProvider from "./context/SettingsProvider";
import ConfirmProvider from "./context/ConfirmProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <BarangProvider>
          <TransaksiProvider>
            <PenggunaProvider>
              <ConfirmProvider>
                <App />
              </ConfirmProvider>
            </PenggunaProvider>
          </TransaksiProvider>
        </BarangProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
);
