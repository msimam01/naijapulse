import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Language = "en" | "pidgin";

interface Translations {
  [key: string]: {
    en: string;
    pidgin: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", pidgin: "Home" },
  "nav.polls": { en: "All Polls", pidgin: "All Polls Dem" },
  "nav.myPolls": { en: "My Polls", pidgin: "My Own Polls" },
  "nav.create": { en: "Create Poll", pidgin: "Create Poll" },
  "nav.categories": { en: "Categories", pidgin: "Categories" },
  "nav.login": { en: "Login", pidgin: "Enter" },
  "nav.account": { en: "Account", pidgin: "Account" },
  "nav.install": { en: "Install App", pidgin: "Install App" },
  
  // Hero Section
  "hero.title": { en: "What's Naija Thinking Today?", pidgin: "Wetin Naija Dey Think Today?" },
  "hero.subtitle": { en: "Join millions of Nigerians sharing their opinions on politics, entertainment, economy, and more.", pidgin: "Join millions of Naija people wey dey share their mind on politics, entertainment, money matter, and other things." },
  "hero.cta": { en: "Create Your Poll", pidgin: "Create Your Own Poll" },
  "hero.exploreCta": { en: "Explore Polls", pidgin: "Check Out Polls" },
  "hero.stats.polls": { en: "Active Polls", pidgin: "Active Polls" },
  "hero.stats.votes": { en: "Total Votes", pidgin: "All Votes" },
  "hero.stats.users": { en: "Active Users", pidgin: "Active Users" },
  
  // Poll Cards
  "poll.votes": { en: "votes", pidgin: "votes" },
  "poll.comments": { en: "comments", pidgin: "comments" },
  "poll.vote": { en: "Vote Now", pidgin: "Vote Now" },
  "poll.viewResults": { en: "View Results", pidgin: "See Results" },
  "poll.timeLeft": { en: "left", pidgin: "remain" },
  "poll.trending": { en: "Trending", pidgin: "Trending" },
  
  // Sections
  "section.trending": { en: "Trending Now", pidgin: "Wetin Dey Hot Now" },
  "section.trendingDesc": { en: "The most popular polls right now", pidgin: "The polls wey everybody dey talk about" },
  "section.featured": { en: "Featured Polls", pidgin: "Special Polls" },
  "section.featuredDesc": { en: "Handpicked polls from our community", pidgin: "Polls wey we select for you" },
  "section.categories": { en: "Explore Categories", pidgin: "Check Categories" },
  "section.categoriesDesc": { en: "Find polls that interest you", pidgin: "Find polls wey you like" },
  "section.viewAll": { en: "View All", pidgin: "See All" },
  
  // Categories
  "category.politics": { en: "Politics", pidgin: "Politics" },
  "category.entertainment": { en: "Entertainment", pidgin: "Entertainment" },
  "category.economy": { en: "Economy", pidgin: "Money Matter" },
  "category.lifestyle": { en: "Lifestyle", pidgin: "Life Style" },
  "category.sports": { en: "Sports", pidgin: "Sports" },
  "category.technology": { en: "Technology", pidgin: "Tech" },
  
  // Poll Creation
  "create.title": { en: "Create a New Poll", pidgin: "Create New Poll" },
  "create.pollTitle": { en: "Poll Title", pidgin: "Poll Title" },
  "create.question": { en: "Your Question", pidgin: "Your Question" },
  "create.options": { en: "Options", pidgin: "Options" },
  "create.addOption": { en: "Add Option", pidgin: "Add Option" },
  "create.category": { en: "Category", pidgin: "Category" },
  "create.duration": { en: "Duration", pidgin: "How Long" },
  "create.publish": { en: "Publish Poll", pidgin: "Publish Poll" },
  "create.preview": { en: "Preview", pidgin: "Preview" },
  
  // Poll View
  "pollView.submitVote": { en: "Submit My Vote", pidgin: "Submit My Vote" },
  "pollView.results": { en: "Results", pidgin: "Results" },
  "pollView.share": { en: "Share", pidgin: "Share Am" },
  "pollView.copyLink": { en: "Copy Link", pidgin: "Copy Link" },
  "pollView.report": { en: "Report", pidgin: "Report" },
  "pollView.comments": { en: "Comments", pidgin: "Comments" },
  "pollView.addComment": { en: "Share your thoughts...", pidgin: "Share wetin you dey think..." },
  "pollView.postComment": { en: "Post Comment", pidgin: "Post Comment" },
  "pollView.back": { en: "Back to polls", pidgin: "Go back to polls" },
  
  // Footer
  "footer.tagline": { en: "Nigeria's #1 Public Opinion Platform", pidgin: "Naija Number One Opinion Platform" },
  "footer.quickLinks": { en: "Quick Links", pidgin: "Quick Links" },
  "footer.categories": { en: "Categories", pidgin: "Categories" },
  "footer.connect": { en: "Connect", pidgin: "Connect" },
  "footer.copyright": { en: "All rights reserved.", pidgin: "All rights reserved." },
  "footer.madeWith": { en: "Made with ❤️ for Naija", pidgin: "We make am with ❤️ for Naija" },
  
  // Auth
  "auth.login": { en: "Login", pidgin: "Enter" },
  "auth.signup": { en: "Sign Up", pidgin: "Join" },
  "auth.email": { en: "Email or Phone", pidgin: "Email or Phone" },
  "auth.password": { en: "Password", pidgin: "Password" },
  "auth.guest": { en: "Continue as Guest", pidgin: "Continue as Guest" },
  "auth.forgotPassword": { en: "Forgot password?", pidgin: "You forget password?" },
  
  // Common
  "common.search": { en: "Search polls...", pidgin: "Search polls..." },
  "common.loading": { en: "Loading...", pidgin: "E dey load..." },
  "common.noResults": { en: "No polls found", pidgin: "We no see any poll" },
  "common.seeMore": { en: "See More", pidgin: "See More" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("naijapulse-language");
    return (saved as Language) || "en";
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("naijapulse-language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const translation = translations[key];
      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
      return translation[language];
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
