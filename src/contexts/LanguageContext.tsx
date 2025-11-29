import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "de" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  de: {
    // Navigation
    "nav.company": "Mein Unternehmen",
    "nav.search": "Suche",
    "nav.myPartners": "Meine Partner",
    "nav.messages": "Nachrichten",
    "nav.signOut": "Abmelden",
    
    // Common
    "common.loading": "Lädt...",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.search": "Suchen",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.send": "Senden",
    "common.close": "Schließen",
    
    // Company Profile
    "company.title": "Unternehmensprofil",
    "company.name": "Unternehmensname",
    "company.industry": "Branche",
    "company.size": "Unternehmensgröße",
    "company.country": "Land",
    "company.city": "Stadt",
    "company.foundedYear": "Gründungsjahr",
    "company.website": "Website",
    "company.description": "Beschreibung",
    "company.offers": "Angebote",
    "company.lookingFor": "Sucht",
    "company.cooperationType": "Kooperationstyp",
    
    // Search
    "search.title": "Partner suchen",
    "search.placeholder": "Beschreiben Sie, was Sie suchen...",
    "search.aiPlaceholder": "z.B. 'Ich suche einen CNC-Fräser in Bayern' oder 'Wer kann mir bei der Expansion nach Italien helfen?'",
    "search.results": "Suchergebnisse",
    "search.noResults": "Keine Ergebnisse gefunden",
    
    // Messages
    "messages.title": "Nachrichten",
    "messages.selectConversation": "Wählen Sie eine Konversation",
    "messages.typeMessage": "Nachricht eingeben...",
    "messages.noMessages": "Noch keine Nachrichten",
    "messages.translating": "Übersetze...",
    "messages.showOriginal": "Original zeigen",
    "messages.showTranslation": "Übersetzung zeigen",
    
    // Partners
    "partners.title": "Meine Partner",
    "partners.pending": "Ausstehend",
    "partners.accepted": "Akzeptiert",
    "partners.noPartners": "Keine Partner gefunden",
    "partners.sendRequest": "Anfrage senden",
    "partners.accept": "Akzeptieren",
    "partners.reject": "Ablehnen",
    
    // Notifications
    "notifications.title": "Benachrichtigungen",
    "notifications.markAllRead": "Alle als gelesen markieren",
    "notifications.noNotifications": "Keine Benachrichtigungen",
    
    // Auth
    "auth.signIn": "Anmelden",
    "auth.signUp": "Registrieren",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.forgotPassword": "Passwort vergessen?",
  },
  en: {
    // Navigation
    "nav.company": "My Company",
    "nav.search": "Search",
    "nav.myPartners": "My Partners",
    "nav.messages": "Messages",
    "nav.signOut": "Sign Out",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.search": "Search",
    "common.back": "Back",
    "common.next": "Next",
    "common.send": "Send",
    "common.close": "Close",
    
    // Company Profile
    "company.title": "Company Profile",
    "company.name": "Company Name",
    "company.industry": "Industry",
    "company.size": "Company Size",
    "company.country": "Country",
    "company.city": "City",
    "company.foundedYear": "Founded Year",
    "company.website": "Website",
    "company.description": "Description",
    "company.offers": "Offers",
    "company.lookingFor": "Looking For",
    "company.cooperationType": "Cooperation Type",
    
    // Search
    "search.title": "Search Partners",
    "search.placeholder": "Describe what you're looking for...",
    "search.aiPlaceholder": "e.g. 'I need a CNC miller in Bavaria' or 'Who can help me expand to Italy?'",
    "search.results": "Search Results",
    "search.noResults": "No results found",
    
    // Messages
    "messages.title": "Messages",
    "messages.selectConversation": "Select a conversation",
    "messages.typeMessage": "Type a message...",
    "messages.noMessages": "No messages yet",
    "messages.translating": "Translating...",
    "messages.showOriginal": "Show Original",
    "messages.showTranslation": "Show Translation",
    
    // Partners
    "partners.title": "My Partners",
    "partners.pending": "Pending",
    "partners.accepted": "Accepted",
    "partners.noPartners": "No partners found",
    "partners.sendRequest": "Send Request",
    "partners.accept": "Accept",
    "partners.reject": "Reject",
    
    // Notifications
    "notifications.title": "Notifications",
    "notifications.markAllRead": "Mark all as read",
    "notifications.noNotifications": "No notifications",
    
    // Auth
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot Password?",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "en" || saved === "de") ? saved : "de";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.de] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
