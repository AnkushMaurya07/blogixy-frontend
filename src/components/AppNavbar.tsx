import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { RiQuillPenLine } from 'react-icons/ri';

import { userAvatarUrl } from '../api/mediaUrl';
import { useConversations, useNotifications, useProfile } from '../api/hooks';
import type { ConversationSummary, UserProfile } from '../api/types';
import { useCreatePostModal } from '../context/CreatePostModalContext';
import { useAppDispatch, useAppSelector } from '../features/auth/hooks';
import { logout } from '../features/auth/authSlice';

export default function AppNavbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((s) => s.auth.accessToken);
  const dispatch = useAppDispatch();
  const { openCreatePostModal } = useCreatePostModal();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const shellMaxWidth = useAppSelector((s) => s.ui.shellMaxWidth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [navSearchQuery, setNavSearchQuery] = useState('');

  useEffect(() => {
    if (location.pathname !== '/explore') return;
    const q = new URLSearchParams(location.search).get('q')?.trim() ?? '';
    setNavSearchQuery(q);
  }, [location.pathname, location.search]);

  const submitNavSearch = () => {
    const q = navSearchQuery.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  };

  const { data: notifications } = useNotifications();
  const profileQuery = useProfile();
  const { data: conversations } = useConversations();
  const messageUnreadCount = useMemo(
    () =>
      Boolean(token)
        ? (conversations as ConversationSummary[] | undefined)?.reduce(
            (sum, c) => sum + (c.unread_count ?? 0),
            0,
          ) ?? 0
        : 0,
    [conversations, token],
  );
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

  type NavSpec = { label: string; to: string; auth?: boolean; icon: ReactElement };

  const NAV_LINKS: NavSpec[] = [
    { label: 'Home', to: '/', icon: <HomeRoundedIcon fontSize="small" /> },
    { label: 'Explore', to: '/explore', icon: <ExploreRoundedIcon fontSize="small" /> },
    { label: 'Dashboard', to: '/dashboard', auth: true, icon: <DashboardRoundedIcon fontSize="small" /> },
    { label: 'Settings', to: '/settings', icon: <SettingsRoundedIcon fontSize="small" /> },
  ];

  const filterByAuth = (list: NavSpec[]) => list.filter((i) => (i.auth ? Boolean(token) : true));

  /** Top bar: primary routes only (Settings lives in drawer + profile menu). */
  const barLinks = filterByAuth(NAV_LINKS.filter((i) => i.to !== '/settings'));
  const drawerPrimaryLinks = filterByAuth(NAV_LINKS);

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

  const recentNotifications = (notifications as { id: number; title: string; message: string; is_read: boolean }[] | undefined)?.slice(0, 5) ?? [];
  const me = profileQuery.data as UserProfile | undefined;
  const avatarSrc =
    me && me.username
      ? userAvatarUrl({ id: me.id, username: me.username, avatar: me.avatar ?? null }, 128)
      : undefined;
  const closeProfileMenu = () => setProfileMenuAnchor(null);

  const profileMenuPaperSx = {
    width: 260,
    mt: 0.75,
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  };

  const profileTriggerSx = {
    p: 0.35,
    border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
  };

  const profileAvatarEl = (
    <Avatar alt="" src={avatarSrc} sx={{ width: 36, height: 36, fontWeight: 800, fontSize: '1rem' }}>
      {me?.username ? me.username.slice(0, 1).toUpperCase() : '…'}
    </Avatar>
  );

  const profileTriggerButton = (
    <IconButton
      aria-label="Account menu"
      aria-controls={profileMenuAnchor ? 'profile-account-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={Boolean(profileMenuAnchor) ? 'true' : undefined}
      color="inherit"
      size="medium"
      onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
      sx={profileTriggerSx}
    >
      {profileAvatarEl}
    </IconButton>
  );

  const drawerProfileTrigger = (
    <IconButton
      aria-label="Account menu"
      aria-controls={profileMenuAnchor ? 'profile-account-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={Boolean(profileMenuAnchor) ? 'true' : undefined}
      color="inherit"
      size="medium"
      onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
      sx={profileTriggerSx}
    >
      <Avatar alt="" src={avatarSrc} sx={{ width: 36, height: 36, fontWeight: 800, fontSize: '1rem' }}>
        {me?.username ? me.username.slice(0, 1).toUpperCase() : '…'}
      </Avatar>
    </IconButton>
  );

  const iconNavTargetSx = (isActive: boolean) => ({
    width: 42,
    height: 42,
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: alpha(theme.palette.text.primary, isActive ? 0.96 : 0.74),
    backgroundColor: alpha(
      theme.palette.primary.main,
      isActive ? (theme.palette.mode === 'light' ? 0.12 : 0.2) : theme.palette.mode === 'light' ? 0.04 : 0.08,
    ),
    border: `1px solid ${alpha(theme.palette.primary.main, isActive ? 0.5 : theme.palette.mode === 'light' ? 0.2 : 0.18)}`,
    boxShadow:
      isActive && theme.palette.mode === 'dark'
        ? `0 0 0 1px ${alpha(theme.palette.primary.light, 0.12)}, 0 8px 28px rgba(0,0,0,0.35)`
        : 'none',
    transition: theme.transitions.create(['background-color', 'color', 'border-color', 'box-shadow'], {
      duration: theme.transitions.duration.shorter,
    }),
    '& .MuiSvgIcon-root': { fontSize: 22 },
  });

  const renderDesktopIconNav = () =>
    barLinks.map((link) => (
      <motion.div key={link.to} whileHover={{ y: -1 }} transition={{ duration: 0.14 }} style={{ display: 'inline-flex' }}>
        <Tooltip title={link.label} arrow enterDelay={300}>
          <Box component="span" sx={{ display: 'inline-flex' }}>
            <NavLink
              to={link.to}
              aria-label={link.label}
              onClick={closeDrawer}
              style={{ textDecoration: 'none', display: 'inline-flex' }}
            >
              {({ isActive }) => <Box component="span" sx={iconNavTargetSx(isActive)}>{link.icon}</Box>}
            </NavLink>
          </Box>
        </Tooltip>
      </motion.div>
    ));

  const renderDrawerLinks = () =>
    drawerPrimaryLinks.map((link) => (
      <motion.div key={link.to} whileHover={{ x: 2 }} transition={{ duration: 0.14 }}>
        <NavLink to={link.to} onClick={closeDrawer} style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <Box component="span" sx={{ ...navSx(isActive) }}>
              {link.icon}
              {link.label}
            </Box>
          )}
        </NavLink>
      </motion.div>
    ));

  const messagesIconEl =
    messageUnreadCount > 0 ? (
      <Badge badgeContent={messageUnreadCount > 99 ? '99+' : messageUnreadCount} color="error" max={99}>
        <ForumRoundedIcon />
      </Badge>
    ) : (
      <ForumRoundedIcon />
    );

  const notificationsIconEl =
    unreadCount > 0 ? (
      <Badge badgeContent={unreadCount > 99 ? '99+' : unreadCount} color="warning" max={99}>
        <NotificationsRoundedIcon />
      </Badge>
    ) : (
      <NotificationsRoundedIcon />
    );

  return (
    <>
      <Box
        component="header"
        sx={{ position: 'sticky', top: 0, zIndex: theme.zIndex.appBar, backdropFilter: 'blur(14px)' }}
      >
        <Toolbar sx={{ bgcolor: alpha(theme.palette.background.paper, 0.88), gap: { xs: 0.5, md: 2 }, minHeight: 72 }}>
          {!isMdUp && (
            <IconButton aria-label="Open menu" edge="start" onClick={() => setDrawerOpen(true)} size="medium">
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box
            sx={{
              mx: 'auto',
              px: { xs: 1.5, md: 3 },
              width: '100%',
              maxWidth: maxWidthPx,
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, md: 2 },
              flexGrow: 1,
              minWidth: 0,
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
                minWidth: 0,
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
              <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}>
                <Typography component="span" variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
                  Blog
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    Xy
                  </Box>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, letterSpacing: 0.2, display: { xs: 'none', sm: 'block' } }}
                  noWrap
                >
                  Posts · friends · messages
                </Typography>
              </Box>
            </Box>

            {isMdUp ? (
              <TextField
                size="small"
                placeholder="Search posts…"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitNavSearch();
                  }
                }}
                aria-label="Search posts"
                sx={{
                  flex: 1,
                  maxWidth: 420,
                  minWidth: 160,
                  mx: { md: 1.5 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '999px',
                    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.95 : 0.5),
                  },
                }}
                variant="outlined"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            ) : null}

            {!isMdUp && <Box sx={{ flex: 1, minWidth: 0 }} aria-hidden />}

            {!isMdUp && token ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                <IconButton
                  aria-label="Messages"
                  component={Link}
                  to="/messages"
                  onClick={closeDrawer}
                  color="inherit"
                  size="medium"
                >
                  {messagesIconEl}
                </IconButton>
                <IconButton
                  aria-label="Notifications"
                  color="inherit"
                  size="medium"
                  onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                >
                  {notificationsIconEl}
                </IconButton>
                {profileTriggerButton}
              </Box>
            ) : null}

            {!isMdUp && !token ? (
              <Button component={Link} to="/auth" variant="contained" color="primary" size="small" sx={{ flexShrink: 0 }}>
                Sign in
              </Button>
            ) : null}

            {isMdUp && (
              <Box
                sx={{
                  ml: 'auto',
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{renderDesktopIconNav()}</Box>
                <Divider flexItem orientation="vertical" sx={{ mx: 0.25, alignSelf: 'stretch', opacity: 0.65 }} />
                {token ? (
                  <>
                    <Tooltip title="Messages" arrow enterDelay={300}>
                      <IconButton
                        aria-label="Messages"
                        component={Link}
                        to="/messages"
                        color="inherit"
                        size="medium"
                        sx={{ border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, width: 42, height: 42 }}
                      >
                        {messagesIconEl}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Notifications" arrow enterDelay={300}>
                      <IconButton
                        aria-label="Notifications"
                        color="inherit"
                        size="medium"
                        onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                        sx={{ border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, width: 42, height: 42 }}
                      >
                        {notificationsIconEl}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Create post" arrow enterDelay={300}>
                      <IconButton
                        aria-label="Create post"
                        color="primary"
                        size="medium"
                        onClick={() => openCreatePostModal()}
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '12px',
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.35)}`,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.9 : 0.82) },
                        }}
                      >
                        <RiQuillPenLine aria-hidden fontSize={22} />
                      </IconButton>
                    </Tooltip>
                    {profileTriggerButton}
                  </>
                ) : null}
                {!token ? (
                  <Button component={Link} to="/auth" variant="contained" color="primary" size="medium">
                    Sign in
                  </Button>
                ) : null}
              </Box>
            )}
          </Box>
        </Toolbar>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} slotProps={{ paper: { sx: { width: 296, p: 2 } } }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Navigate
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search posts…"
            value={navSearchQuery}
            onChange={(e) => setNavSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitNavSearch();
                closeDrawer();
              }
            }}
            aria-label="Search posts"
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              submitNavSearch();
              closeDrawer();
            }}
            sx={{ flexShrink: 0 }}
          >
            Go
          </Button>
        </Stack>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>{renderDrawerLinks()}</Box>
        {token ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Inbox & alerts
            </Typography>
            <NavLink to="/messages" onClick={closeDrawer} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <Box component="span" sx={{ ...navSx(isActive) }}>
                  <ForumRoundedIcon fontSize="small" />
                  Messages
                </Box>
              )}
            </NavLink>
            <NavLink to="/notifications" onClick={closeDrawer} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <Box component="span" sx={{ ...navSx(isActive) }}>
                  <NotificationsRoundedIcon fontSize="small" />
                  Notifications
                </Box>
              )}
            </NavLink>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Account
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                  {me?.username ? `@${me.username}` : 'Your account'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  Profile · settings · log out
                </Typography>
              </Box>
              {drawerProfileTrigger}
            </Stack>
          </Box>
        ) : null}
        <Divider sx={{ my: 2 }} />
        {!token ? (
          <Button component={Link} to="/auth" variant="contained" fullWidth onClick={closeDrawer}>
            Sign in
          </Button>
        ) : null}
      </Drawer>
      <Menu
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={() => setNotifAnchorEl(null)}
        slotProps={{ paper: { sx: { width: 340 } } }}
      >
        {recentNotifications.length === 0 ? (
          <MenuItem onClick={() => setNotifAnchorEl(null)}>
            <ListItemText primary="No recent notifications" secondary="You're all caught up." />
          </MenuItem>
        ) : (
          recentNotifications.map((item) => (
            <MenuItem
              key={item.id}
              component={Link}
              to="/notifications"
              onClick={() => setNotifAnchorEl(null)}
            >
              <ListItemText
                primary={item.title}
                secondary={item.message}

              />
            </MenuItem>
          ))
        )}
        <Divider />
        <MenuItem component={Link} to="/notifications" onClick={() => setNotifAnchorEl(null)}>
          <ListItemText primary="View all notifications" />
        </MenuItem>
      </Menu>

      <Menu
        id="profile-account-menu"
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={closeProfileMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: profileMenuPaperSx },
          list: { dense: true, 'aria-label': 'Account menu' },
        }}
      >
        <MenuItem
          disabled
          sx={{
            opacity: 1,
            cursor: 'default',
            '&.Mui-disabled': { opacity: 1 },
            py: 1.25,
          }}
        >
          <ListItemText
            primary={me?.username ? `@${me.username}` : 'Account'}
            secondary="Signed in"
            slotProps={{
              primary: { sx: { fontWeight: 700 } },
              secondary: { sx: { typography: 'caption' } },
            }}
          />
        </MenuItem>
        <Divider />
        <MenuItem component={Link} to="/profile" onClick={() => { closeProfileMenu(); closeDrawer(); }}>
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" aria-hidden />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem component={Link} to="/settings" onClick={() => { closeProfileMenu(); closeDrawer(); }}>
          <ListItemIcon>
            <SettingsRoundedIcon fontSize="small" aria-hidden />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeProfileMenu();
            closeDrawer();
            dispatch(logout());
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" aria-hidden />
          </ListItemIcon>
          <ListItemText primary="Log out" />
        </MenuItem>
      </Menu>
    </>
  );
}
