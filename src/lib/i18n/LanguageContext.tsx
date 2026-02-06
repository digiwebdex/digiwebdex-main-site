import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translations, Language, TranslationKeys } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract language from URL path
  const getLanguageFromPath = (): Language => {
    const path = location.pathname;
    if (path.startsWith('/en')) return 'en';
    return 'bn'; // Default to Bangla
  };

  const [language, setLanguageState] = useState<Language>(getLanguageFromPath);

  // Update language when URL changes
  useEffect(() => {
    const urlLang = getLanguageFromPath();
    if (urlLang !== language) {
      setLanguageState(urlLang);
    }
  }, [location.pathname]);

  // Update HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'bn') {
      document.documentElement.classList.add('font-bangla');
    } else {
      document.documentElement.classList.remove('font-bangla');
    }
  }, [language]);

  const setLanguage = useCallback((newLang: Language) => {
    const currentPath = location.pathname;
    let newPath: string;

    // Remove existing language prefix
    const pathWithoutLang = currentPath.replace(/^\/(bn|en)/, '') || '/';

    // Add new language prefix
    if (newLang === 'bn') {
      // Bangla is default, use /bn prefix for consistency
      newPath = `/bn${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
    } else {
      newPath = `/en${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
    }

    // Navigate to new path if different
    if (newPath !== currentPath) {
      navigate(newPath);
    }
    setLanguageState(newLang);
  }, [location.pathname, navigate]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL: false, // Bangla is LTR
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { translations, type Language, type TranslationKeys };
