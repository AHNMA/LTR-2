
import React, { useEffect, useState } from 'react';
import { PostProvider } from './contexts/PostContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PredictionProvider } from './contexts/PredictionContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { db } from './services/db';
import { INITIAL_USERS, INITIAL_TEAMS, INITIAL_DRIVERS, INITIAL_RACES, INITIAL_MEDIA } from './services/initialData';
import { INITIAL_POSTS } from './constants';
import Header from './components/Header';
import DriverTicker from './components/DriverTicker';
import HeroSection from './components/HeroSection';
import SectionTitle from './components/SectionTitle';
import FeaturedGrid from './components/FeaturedGrid';
import NewsFeed from './components/NewsFeed';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import ArticlePage from './components/article/ArticlePage';
import TeamDetailPage from './components/pages/TeamDetailPage';
import DriverDetailPage from './components/pages/DriverDetailPage';
import TeamsDriversPage from './components/pages/TeamsDriversPage';
import CalendarPage from './components/pages/CalendarPage';
import StandingsPage from './components/pages/StandingsPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import UserProfilePage from './components/profile/UserProfilePage';
import PredictionPage from './components/pages/PredictionPage';

// Robust Seeding Logic using Transactions
const seedDatabase = async () => {
    try {
        await db.transaction('rw', db.users, db.posts, db.teams, db.drivers, db.races, db.media, async () => {
            const usersCount = await db.users.count();
            if (usersCount === 0) await db.users.bulkAdd(INITIAL_USERS);

            const postsCount = await db.posts.count();
            if (postsCount === 0) await db.posts.bulkAdd(INITIAL_POSTS);

            const teamsCount = await db.teams.count();
            if (teamsCount === 0) await db.teams.bulkAdd(INITIAL_TEAMS);

            const driversCount = await db.drivers.count();
            if (driversCount === 0) await db.drivers.bulkAdd(INITIAL_DRIVERS);

            const racesCount = await db.races.count();
            if (racesCount === 0) await db.races.bulkAdd(INITIAL_RACES);

            const mediaCount = await db.media.count();
            if (mediaCount === 0) await db.media.bulkAdd(INITIAL_MEDIA);
        });
    } catch (error) {
        console.error("Database seeding failed", error);
    }
};

function AppContent() {
  const { currentView, goToHome } = useNavigation();
  const { canAccessAdmin } = useAuth();

  // Admin Route Protection
  if (currentView === 'admin') {
      if (!canAccessAdmin) {
          // If user doesn't have permissions, redirect home immediately
          setTimeout(() => goToHome(), 0);
          return null; 
      }
      return <AdminDashboard onExit={goToHome} />;
  }

  // Full Page Auth Views
  if (currentView === 'login') return <LoginPage />;
  if (currentView === 'register') return <RegisterPage />;
  if (currentView === 'forgot-password') return <ForgotPasswordPage />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />
      <DriverTicker />
      
      <main className="flex-grow pt-4">
        {currentView === 'article' && <ArticlePage />}
        {currentView === 'team-detail' && <TeamDetailPage />}
        {currentView === 'driver-detail' && <DriverDetailPage />}
        {currentView === 'teams-drivers' && <TeamsDriversPage />}
        {currentView === 'calendar' && <CalendarPage />}
        {currentView === 'standings' && <StandingsPage />}
        {currentView === 'profile' && <UserProfilePage />}
        {currentView === 'prediction' && <PredictionPage />}
        
        {currentView === 'home' && (
          <>
            <HeroSection />
            <div className="container mx-auto px-4 mt-8 mb-4">
                 <SectionTitle title="AUSGEWÄHLT" />
            </div>
            <FeaturedGrid />
            <NewsFeed />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
      seedDatabase().then(() => setDbReady(true));
  }, []);

  if (!dbReady) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading Database...</div>;

  return (
    <NavigationProvider>
      <AuthProvider>
          <DataProvider>
            <PredictionProvider>
                <PostProvider>
                    <AppContent />
                </PostProvider>
            </PredictionProvider>
          </DataProvider>
      </AuthProvider>
    </NavigationProvider>
  );
}

export default App;
