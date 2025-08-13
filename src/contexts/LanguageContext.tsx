import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ruTranslations from '../locales/ru.json';
import enTranslations from '../locales/en.json';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getCountryName: (code: string) => string;
  getCities: (countryCode: string) => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ru');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const getTranslations = () => {
    return language === 'ru' ? ruTranslations : enTranslations;
  };

  const t = (key: string): string => {
    const translations = getTranslations();
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const getCountryName = (code: string): string => {
    const translations = getTranslations();
    return translations.countries[code as keyof typeof translations.countries] || code;
  };

  const getCities = (countryCode: string): string[] => {
    const translations = getTranslations();
    return translations.cities[countryCode as keyof typeof translations.cities] || [];
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    getCountryName,
    getCities
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 