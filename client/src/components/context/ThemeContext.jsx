import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const THEME_KEY = "app_theme";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "dark",
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
