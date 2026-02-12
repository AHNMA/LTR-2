
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ViewType = 'home' | 'article' | 'admin' | 'team-detail' | 'driver-detail' | 'teams-drivers' | 'calendar' | 'standings' | 'login' | 'register' | 'forgot-password' | 'profile' | 'prediction';

interface NavigationContextType {
  currentView: ViewType;
  currentArticleId: string | null;
  currentEntityId: string | null; // Re-used for Team/Driver ID
  goToHome: () => void;
  goToArticle: (id: string) => void;
  goToTeam: (id: string) => void;
  goToDriver: (id: string) => void;
  goToTeamsDrivers: () => void;
  goToCalendar: () => void;
  goToStandings: () => void;
  goToAdmin: () => void;
  goToLogin: () => void;
  goToRegister: () => void;
  goToForgotPassword: () => void;
  goToProfile: () => void;
  goToPrediction: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [currentEntityId, setCurrentEntityId] = useState<string | null>(null);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, currentArticleId, currentEntityId]);

  const goToHome = () => {
    setCurrentView('home');
    setCurrentArticleId(null);
    setCurrentEntityId(null);
  };

  const goToArticle = (id: string) => {
    setCurrentArticleId(id);
    setCurrentView('article');
  };

  const goToTeam = (id: string) => {
    setCurrentEntityId(id);
    setCurrentView('team-detail');
  };

  const goToDriver = (id: string) => {
    setCurrentEntityId(id);
    setCurrentView('driver-detail');
  };

  const goToTeamsDrivers = () => {
    setCurrentView('teams-drivers');
    setCurrentArticleId(null);
    setCurrentEntityId(null);
  };

  const goToCalendar = () => {
    setCurrentView('calendar');
    setCurrentArticleId(null);
    setCurrentEntityId(null);
  };

  const goToStandings = () => {
    setCurrentView('standings');
    setCurrentArticleId(null);
    setCurrentEntityId(null);
  };

  const goToPrediction = () => {
    setCurrentView('prediction');
    setCurrentArticleId(null);
    setCurrentEntityId(null);
  };

  const goToAdmin = () => {
    setCurrentView('admin');
  };

  const goToLogin = () => setCurrentView('login');
  const goToRegister = () => setCurrentView('register');
  const goToForgotPassword = () => setCurrentView('forgot-password');
  const goToProfile = () => setCurrentView('profile');

  return (
    <NavigationContext.Provider value={{ 
      currentView, currentArticleId, currentEntityId, 
      goToHome, goToArticle, goToAdmin, goToTeam, goToDriver, 
      goToTeamsDrivers, goToCalendar, goToStandings,
      goToLogin, goToRegister, goToForgotPassword, goToProfile,
      goToPrediction
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
