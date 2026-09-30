import { Box, Button, Typography } from '@mui/material';
import { lazy, Suspense, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import AppNavbar from './components/AppNavbar';
import MobileBottomNav, { MOBILE_BOTTOM_NAV_EXTRA_PX } from './components/MobileBottomNav';
import RouteFallback from './components/RouteFallback';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { CreatePostModalProvider } from './context/CreatePostModalContext';
import { useAppSelector } from './features/auth/hooks';

const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const SharedBlogPage = lazy(() => import('./pages/SharedBlogPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DraftsPage = lazy(() => import('./pages/DraftsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = useAppSelector((s) => s.auth.accessToken);
  return token ? children : <Navigate to="/auth" replace />;
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 8, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The page you were looking for no longer exists or may have moved.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go home
        </Button>
      </Box>
    </Box>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <RouteErrorBoundary key={location.pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route path="/shared/:token" element={<SharedBlogPage />} />
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
            path="/drafts"
            element={
              <ProtectedRoute>
                <DraftsPage />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
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
        <AppRoutes />
      </Box>
      <MobileBottomNav />
    </CreatePostModalProvider>
  );
}
