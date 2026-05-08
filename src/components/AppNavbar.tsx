import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { RiQuillPenLine } from 'react-icons/ri';

import { useNotifications } from '../api/hooks';
import { useAppDispatch, useAppSelector } from '../features/auth/hooks';
import { logout } from '../features/auth/authSlice';

export default function AppNavbar() {
  const theme = useTheme();
  const token = useAppSelector((s) => s.auth.accessToken);
  const dispatch = useAppDispatch();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const shellMaxWidth = useAppSelector((s) => s.ui.shellMaxWidth);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: notifications } = useNotifications();
  const unreadCount = useMemo(
    () =>
      Boolean(token)
        ? (notifications as { id: number; is_read: boolean }[] | undefined)?.filter((n) => !n.is_read).length ?? 0
        : 0,
    [notifications, token],
  );

  const maxWidthPx =
    shellMaxWidth === 'full'
      ? '100%'
      : shellMaxWidth === 'xl'
        ? `${theme.breakpoints.values.xl}px`
        : shellMaxWidth === 'lg'
          ? `${theme.breakpoints.values.lg}px`
          : `${theme.breakpoints.values.md}px`;

  const closeDrawer = () => setDrawerOpen(false);

  type NavSpec = { label: string; to: string; auth?: boolean; icon: React.ReactElement };

  const items: NavSpec[] = [
    { label: 'Home', to: '/', icon: <HomeRoundedIcon fontSize="small" /> },
    { label: 'Explore', to: '/explore', icon: <ExploreRoundedIcon fontSize="small" /> },
    { label: 'Dashboard', to: '/dashboard', auth: true, icon: <DashboardRoundedIcon fontSize="small" /> },
    { label: 'Messages', to: '/messages', auth: true, icon: <ForumRoundedIcon fontSize="small" /> },
    { label: 'Notifications', to: '/notifications', auth: true, icon: <NotificationsRoundedIcon fontSize="small" /> },
    { label: 'Settings', to: '/settings', icon: <SettingsRoundedIcon fontSize="small" /> },
  ];

  const visible = items.filter((i) => (i.auth ? Boolean(token) : true));

  const navSx = (isActive: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    px: '14px',
    py: '9px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(14.5),
    transition: theme.transitions.create(['background-color', 'color', 'border-color', 'box-shadow'], {
      duration: theme.transitions.duration.shorter,
    }),
    border: `1px solid ${alpha(theme.palette.primary.main, isActive ? 0.52 : theme.palette.mode === 'light' ? 0.22 : 0.2)}`,
    color: alpha(theme.palette.text.primary, isActive ? 0.95 : 0.76),
    backgroundColor: alpha(theme.palette.primary.main, isActive ? (theme.palette.mode === 'light' ? 0.1 : 0.16) : theme.palette.mode === 'light' ? 0.035 : 0.08),
    boxShadow:
      isActive && theme.palette.mode === 'light'
        ? `0 14px 32px ${alpha(theme.palette.primary.main, 0.1)}`
        : isActive && theme.palette.mode === 'dark'
          ? '0 14px 42px rgba(2,7,20,0.45)'
          : 'none',
  });

  const iconFor = (link: NavSpec) => {
    if (link.to === '/notifications' && token) {
      return (
        <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="warning" max={99}>
          {link.icon}
        </Badge>
      );
    }
    return link.icon;
  };

  const renderNav = () =>
    visible.map((link) => (
      <motion.div key={link.to} whileHover={{ y: -1 }} transition={{ duration: 0.14 }}>
        <NavLink to={link.to} onClick={closeDrawer} style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <Box component="span" sx={{ ...navSx(isActive) }}>
              {iconFor(link)}
              {link.label}
            </Box>
          )}
        </NavLink>
      </motion.div>
    ));

  return (
    <>
      <Box
        component="header"
        sx={{ position: 'sticky', top: 0, zIndex: theme.zIndex.appBar, backdropFilter: 'blur(14px)' }}
      >
        <Toolbar sx={{ bgcolor: alpha(theme.palette.background.paper, 0.88), gap: { xs: 1, md: 2 }, minHeight: 72 }}>
          {!isMdUp && (
            <IconButton aria-label="Open menu" edge="start" onClick={() => setDrawerOpen(true)} size="medium">
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box
            sx={{
              mx: 'auto',
              px: { xs: 2, md: 3 },
              width: '100%',
              maxWidth: maxWidthPx,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexGrow: isMdUp ? 1 : 0,
            }}
          >
            <Box
              component={Link}
              to="/"
              onClick={closeDrawer}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                textDecoration: 'none',
                color: 'inherit',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  display: 'grid',
                  placeItems: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.dark ?? '#1d4ed8', theme.palette.mode === 'light' ? 0.88 : 0.55)})`,
                  color: '#fff',
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                <RiQuillPenLine aria-hidden fontSize={24} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
                <Typography sx={{ letterSpacing: 1.65, fontSize: theme.typography.pxToRem(11), fontWeight: 700 }}>
                  CUSTOM BLOG
                </Typography>
                <Typography component="span" variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                  Blog
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    Xy
                  </Box>
                </Typography>
              </Box>
            </Box>

            {isMdUp && (
              <Box
                sx={{
                  ml: 'auto',
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                {renderNav()}
                <Divider flexItem orientation="vertical" sx={{ mx: 0.5, alignSelf: 'stretch' }} />
                {!token ? (
                  <Button component={Link} to="/auth" variant="contained" color="primary" size="medium">
                    Sign in
                  </Button>
                ) : (
                  <Button variant="outlined" color="inherit" size="medium" onClick={() => dispatch(logout())}>
                    Log out
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Toolbar>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} slotProps={{ paper: { sx: { width: 296, p: 2 } } }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Navigate
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>{renderNav()}</Box>
        <Divider sx={{ my: 2 }} />
        {!token ? (
          <Button component={Link} to="/auth" variant="contained" fullWidth onClick={closeDrawer}>
            Sign in
          </Button>
        ) : (
          <Button variant="outlined" fullWidth onClick={() => { dispatch(logout()); closeDrawer(); }}>
            Log out
          </Button>
        )}
      </Drawer>
    </>
  );
}
