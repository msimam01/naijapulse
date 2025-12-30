import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import enTranslations from "@/i18n/en.json";
import pidginTranslations from "@/i18n/pidgin.json";

type Language = "en" | "pidgin";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested translation value
const getNestedTranslation = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
};

// Detect browser language
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  // Check if browser language is Nigerian English or Pidgin-related
  if (browserLang.includes('en-ng') || browserLang.includes('yo') || browserLang.includes('ha') || browserLang.includes('ig')) {
    return 'en'; // Default to English for Nigerian languages, user can switch to Pidgin
  }
  return 'en'; // Default to English
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // First check localStorage, then browser language
    const saved = localStorage.getItem("naijapulse-language");
    return (saved as Language) || detectBrowserLanguage();
  });

  // Load user's language preference from database when they log in
  useEffect(() => {
    const loadUserLanguagePreference = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('language_preference')
            .eq('id', user.id)
            .single();

          if (!error && profile?.language_preference) {
            const dbLang = profile.language_preference as Language;
            if (dbLang !== language) {
              setLanguageState(dbLang);
              localStorage.setItem("naijapulse-language", dbLang);
            }
          }
        } catch (error) {
          console.warn('Failed to load user language preference:', error);
        }
      }
    };

    loadUserLanguagePreference();
  }, [user, language]);

  const handleSetLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("naijapulse-language", lang);

    // Save to database if user is logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            language_preference: lang
          }, {
            onConflict: 'id'
          });
      } catch (error) {
        // Silently fail if database column doesn't exist yet
        console.warn('Database language preference not available yet - using localStorage only');
      }
    }
  }, [user]);

  const t = useCallback(
    (key: string): string => {
      const translations = language === 'en' ? enTranslations : pidginTranslations;
      const value = getNestedTranslation(translations, key);
      if (value === key) {
        console.warn(`Translation missing for key: ${key}`);
      }
      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
