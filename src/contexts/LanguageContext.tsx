import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "de" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const translations = {
  de: {
    // Navigation
    "nav.company": "Mein Unternehmen",
    "nav.search": "Partner finden",
    "nav.myPartners": "Meine Partner",
    "nav.messages": "Nachrichten",
    "nav.signOut": "Abmelden",
    
    // Common
    "common.loading": "Wird geladen...",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.edit": "Bearbeiten",
    "common.search": "Suchen",
    "common.back": "Zurück",
    "common.next": "Weiter",
    "common.send": "Senden",
    "common.close": "Schließen",
    "common.viewProfile": "Profil ansehen",
    "common.chat": "Chat",
    "common.profile": "Profil",
    "common.filter": "Filter",
    "common.all": "Alle",
    "common.employees": "Mitarbeiter",
    "common.error": "Fehler",
    "common.success": "Erfolg",
    "common.noResults": "Keine Ergebnisse gefunden",
    "common.noDescription": "Keine Beschreibung",
    
    // Company Profile
    "company.title": "Unternehmensprofil",
    "company.yourProfile": "Ihr Unternehmensprofil",
    "company.name": "Unternehmensname",
    "company.industry": "Branche",
    "company.size": "Unternehmensgröße",
    "company.country": "Land",
    "company.city": "Stadt",
    "company.location": "Standort",
    "company.foundedYear": "Gründungsjahr",
    "company.founded": "Gegründet",
    "company.website": "Website",
    "company.description": "Beschreibung",
    "company.aboutCompany": "Über das Unternehmen",
    "company.offers": "Was wir anbieten",
    "company.lookingFor": "Was wir suchen",
    "company.cooperationType": "Kooperationsarten",
    "company.editProfile": "Profil bearbeiten",
    "company.updateInfo": "Aktualisieren Sie Ihre Unternehmensinformationen",
    "company.profileCreated": "Profil erstellt!",
    "company.profileCreatedDesc": "Ihr Unternehmensprofil wurde erfolgreich angelegt.",
    "company.profileUpdated": "Erfolgreich gespeichert",
    "company.profileUpdatedDesc": "Ihr Profil wurde aktualisiert.",
    "company.createProfile": "Erstellen Sie Ihr Unternehmensprofil, um zu starten.",
    "company.welcome": "Willkommen bei EuroConnect!",
    "company.loadError": "Profile konnten nicht geladen werden",
    "company.updateError": "Profil konnte nicht aktualisiert werden.",
    "company.allIndustries": "Alle Branchen",
    "company.allCountries": "Alle Länder",
    "company.firmName": "Firmenname",
    "company.required": "erforderlich",
    "company.optional": "optional",
    "company.characterLimit": "Zeichen",
    
    // Search
    "search.title": "Partner suchen",
    "search.aiSearch": "KI-Suche",
    "search.aiSupported": "KI-gestützte Suche und alle Partner",
    "search.placeholder": "Was suchen Sie? Beschreiben Sie Ihren idealen Partner...",
    "search.aiPlaceholder": "Beschreiben Sie einfach, was Sie suchen - z.B. \"CNC-Fräsdienstleister in Bayern\" oder \"Bio-zertifizierte Lebensmittellieferanten\"",
    "search.searching": "Suche...",
    "search.aiResults": "KI-Suchergebnisse",
    "search.allPartners": "Alle Partner",
    "search.results": "Suchergebnisse",
    "search.noResults": "Keine Partner gefunden. Versuchen Sie andere Filter.",
    "search.searchCompanies": "Suche nach Unternehmen...",
    "search.searchComplete": "Suche abgeschlossen",
    "search.companiesFound": "passende Unternehmen gefunden",
    "search.inputRequired": "Eingabe erforderlich",
    "search.enterQuery": "Bitte geben Sie eine Suchanfrage ein",
    "search.tryAgain": "Versuchen Sie eine andere Suchanfrage",
    "search.searchError": "Fehler bei der Suche",
    "search.match": "Match",
    "search.loadingPartners": "Lade Partner...",
    
    // Messages
    "messages.title": "Nachrichten",
    "messages.selectConversation": "Wählen Sie eine Konversation",
    "messages.typeMessage": "Nachricht eingeben...",
    "messages.noMessages": "Noch keine Nachrichten",
    "messages.translating": "Übersetze...",
    "messages.showOriginal": "Original zeigen",
    "messages.showTranslation": "Übersetzung zeigen",
    "messages.translate": "Übersetzen",
    "messages.lastMessage": "Letzte Nachricht",
    "messages.messagesCount": "Nachrichten",
    "messages.justNow": "Gerade eben",
    "messages.minutesAgo": "vor {count} Min.",
    "messages.hoursAgo": "vor {count} Std.",
    "messages.daysAgo": "vor {count} Tag",
    "messages.daysAgoPlural": "vor {count} Tagen",
    
    // Partners
    "partners.title": "Meine Partner",
    "partners.noPartners": "Noch keine Partner",
    "partners.noPartnersDesc": "Beginnen Sie mit der Suche nach passenden Partnern und nehmen Sie Kontakt auf",
    "partners.searchPartners": "Partner suchen",
    "partners.partnersConnected": "Partner mit denen Sie in Kontakt stehen",
    "partners.pending": "Ausstehend",
    "partners.accepted": "Akzeptiert",
    "partners.sendRequest": "Anfrage senden",
    "partners.accept": "Akzeptieren",
    "partners.reject": "Ablehnen",
    "partners.loadError": "Partner konnten nicht geladen werden",
    
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
    "nav.search": "Find Partners",
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
    "common.viewProfile": "View Profile",
    "common.chat": "Chat",
    "common.profile": "Profile",
    "common.filter": "Filter",
    "common.all": "All",
    "common.employees": "Employees",
    "common.error": "Error",
    "common.success": "Success",
    "common.noResults": "No results found",
    "common.noDescription": "No description",
    
    // Company Profile
    "company.title": "Company Profile",
    "company.yourProfile": "Your Company Profile",
    "company.name": "Company Name",
    "company.industry": "Industry",
    "company.size": "Company Size",
    "company.country": "Country",
    "company.city": "City",
    "company.location": "Location",
    "company.foundedYear": "Founded Year",
    "company.founded": "Founded",
    "company.website": "Website",
    "company.description": "Description",
    "company.aboutCompany": "About the Company",
    "company.offers": "What We Offer",
    "company.lookingFor": "What We're Looking For",
    "company.cooperationType": "Cooperation Types",
    "company.editProfile": "Edit Profile",
    "company.updateInfo": "Update your company information",
    "company.profileCreated": "Profile Created!",
    "company.profileCreatedDesc": "Your company profile has been successfully created.",
    "company.profileUpdated": "Successfully Saved",
    "company.profileUpdatedDesc": "Your profile has been updated.",
    "company.createProfile": "Create your company profile to get started.",
    "company.welcome": "Welcome to EuroConnect!",
    "company.loadError": "Profiles could not be loaded",
    "company.updateError": "Profile could not be updated.",
    "company.allIndustries": "All Industries",
    "company.allCountries": "All Countries",
    "company.firmName": "Company Name",
    "company.required": "required",
    "company.optional": "optional",
    "company.characterLimit": "characters",
    
    // Search
    "search.title": "Search Partners",
    "search.aiSearch": "AI Search",
    "search.aiSupported": "AI-powered search and all partners",
    "search.placeholder": "What are you looking for? Describe your ideal partner...",
    "search.aiPlaceholder": "Simply describe what you're looking for - e.g. \"CNC milling service provider in Bavaria\" or \"Organic certified food suppliers\"",
    "search.searching": "Searching...",
    "search.aiResults": "AI Search Results",
    "search.allPartners": "All Partners",
    "search.results": "Search Results",
    "search.noResults": "No partners found. Try different filters.",
    "search.searchCompanies": "Search for companies...",
    "search.searchComplete": "Search Complete",
    "search.companiesFound": "matching companies found",
    "search.inputRequired": "Input Required",
    "search.enterQuery": "Please enter a search query",
    "search.tryAgain": "Try a different search query",
    "search.searchError": "Search Error",
    "search.match": "Match",
    "search.loadingPartners": "Loading Partners...",
    
    // Messages
    "messages.title": "Messages",
    "messages.selectConversation": "Select a conversation",
    "messages.typeMessage": "Type a message...",
    "messages.noMessages": "No messages yet",
    "messages.translating": "Translating...",
    "messages.showOriginal": "Show Original",
    "messages.showTranslation": "Show Translation",
    "messages.translate": "Translate",
    "messages.lastMessage": "Last Message",
    "messages.messagesCount": "Messages",
    "messages.justNow": "Just now",
    "messages.minutesAgo": "{count} min. ago",
    "messages.hoursAgo": "{count} hrs. ago",
    "messages.daysAgo": "{count} day ago",
    "messages.daysAgoPlural": "{count} days ago",
    
    // Partners
    "partners.title": "My Partners",
    "partners.noPartners": "No partners yet",
    "partners.noPartnersDesc": "Start searching for suitable partners and get in touch",
    "partners.searchPartners": "Search Partners",
    "partners.partnersConnected": "partners you're connected with",
    "partners.pending": "Pending",
    "partners.accepted": "Accepted",
    "partners.sendRequest": "Send Request",
    "partners.accept": "Accept",
    "partners.reject": "Reject",
    "partners.loadError": "Partners could not be loaded",
    
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

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let text = translations[language][key as keyof typeof translations.de] || key;
    
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, String(value));
      });
    }
    
    return text;
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
