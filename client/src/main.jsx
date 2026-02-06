import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App";
import { LocationProvider } from "./components/context/LocationContext";
import { AuthProvider } from "./components/context/AuthContext";
import ScrollToTop from "./components/common/ScrollToTop";
import { ThemeProvider } from "./components/context/ThemeContext";
import { CatalogProvider } from "./components/context/CatalogContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppTree = (
  <BrowserRouter>
    <ScrollToTop />
    <ThemeProvider>
      <AuthProvider>
        <CatalogProvider>
          <LocationProvider>
            <App />
          </LocationProvider>
        </CatalogProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        {AppTree}
      </GoogleOAuthProvider>
    ) : (
      AppTree
    )}
  </StrictMode>
);
