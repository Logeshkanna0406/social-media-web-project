import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './hooks/useToast';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { JobsPage } from './pages/JobsPage';
import { MessagesPage } from './pages/MessagesPage';
import { NetworkingPage } from './pages/NetworkingPage';
import { AIHubPage } from './pages/AIHubPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { NotFoundPage } from './pages/NotFoundPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-[#090d16]" />;
  if (!user || !token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                  <Route path="messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                  <Route path="networking" element={<ProtectedRoute><NetworkingPage /></ProtectedRoute>} />
                  <Route path="ai-hub" element={<ProtectedRoute><AIHubPage /></ProtectedRoute>} />
                  <Route path="analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                  <Route path="admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
