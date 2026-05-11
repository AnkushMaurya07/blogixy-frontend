import { Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';

import AppNavbar from './components/AppNavbar';
import MobileBottomNav, { MOBILE_BOTTOM_NAV_EXTRA_PX } from './components/MobileBottomNav';
import { CreatePostModalProvider } from './context/CreatePostModalContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import HomePage from './pages/HomePage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { useAppSelector } from './features/auth/hooks';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = useAppSelector((s) => s.auth.accessToken);
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <CreatePostModalProvider>
      <AppNavbar />
      <Box
        sx={{
          pb: {
            xs: `calc(${MOBILE_BOTTOM_NAV_EXTRA_PX}px + env(safe-area-inset-bottom, 0px))`,
            md: 0,
          },
        }}
      >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/blogs/:slug" element={<BlogDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Box>
      <MobileBottomNav />
    </CreatePostModalProvider>
  );
}
