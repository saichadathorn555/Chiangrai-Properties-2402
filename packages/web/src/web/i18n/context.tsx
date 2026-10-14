import { createContext, useContext, useEffect, useState } from "react";
import { dicts, type Dict, type Lang } from "./dict";

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const I18n = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    (typeof localStorage !== "undefined" && (localStorage.getItem("lang") as Lang)) || "en",
  );
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);
  return <I18n.Provider value={{ lang, t: dicts[lang], setLang: setLangState }}>{children}</I18n.Provider>;
}

export function useT() {
  const ctx = useContext(I18n);
  if (!ctx) throw new Error("useT outside I18nProvider");
  return ctx;
}
