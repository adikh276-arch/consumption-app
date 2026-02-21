import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface TranslateCtx {
  t: (text: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
}

const TranslateContext = createContext<TranslateCtx>({
  t: (text) => text,
  language: "en",
  setLanguage: () => {},
});

export const useTranslate = () => useContext(TranslateContext);

export function TranslateProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState(() => {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (urlLang) {
      sessionStorage.setItem("app_language", urlLang.toLowerCase());
      return urlLang.toLowerCase();
    }
    return sessionStorage.getItem("app_language") || "en";
  });

  const [cache, setCache] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("translate_cache") || "{}");
    } catch {
      return {};
    }
  });

  const pendingRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const setLanguage = useCallback((lang: string) => {
    setLangState(lang);
    sessionStorage.setItem("app_language", lang);
  }, []);

  // Persist cache
  useEffect(() => {
    sessionStorage.setItem("translate_cache", JSON.stringify(cache));
  }, [cache]);

  const batchTranslate = useCallback(async () => {
    const strings = Array.from(pendingRef.current);
    pendingRef.current.clear();
    if (strings.length === 0 || language === "en") return;

    const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) return;

    try {
      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: strings, target: language, source: "en" }),
        }
      );
      const data = await res.json();
      if (data?.data?.translations) {
        const newCache: Record<string, string> = {};
        data.data.translations.forEach((tr: { translatedText: string }, i: number) => {
          newCache[`${language}:${strings[i]}`] = tr.translatedText;
        });
        setCache((prev) => ({ ...prev, ...newCache }));
      }
    } catch {
      // Fallback to English silently
    }
  }, [language]);

  const t = useCallback(
    (text: string): string => {
      if (language === "en" || !text) return text;
      const key = `${language}:${text}`;
      if (cache[key]) return cache[key];

      pendingRef.current.add(text);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(batchTranslate, 150);
      return text;
    },
    [language, cache, batchTranslate]
  );

  return (
    <TranslateContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslateContext.Provider>
  );
}
