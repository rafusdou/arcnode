import { createContext, useContext, useEffect, useState } from "react";
import { I18N } from "../i18n.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState("es");
  const [currency, setCurrency] = useState("ARS");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.lang = lang;
  }, [theme, lang]);

  const t = I18N[lang] || I18N.es;

  return (
    <AppContext.Provider value={{ lang, setLang, currency, setCurrency, theme, setTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
