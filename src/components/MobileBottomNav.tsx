import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import { Badge, BottomNavigation, BottomNavigationAction, Menu, MenuItem, Paper } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useConversations } from '../api/hooks';
import { useCreatePostModal } from '../context/CreatePostModalContext';
import { useAppSelector } from '../features/auth/hooks';
import type { ConversationSummary } from '../api/types';

/** Padding applied under main content on small screens so the fixed bar does not cover scroll-end. */
export const MOBILE_BOTTOM_NAV_EXTRA_PX = 88;

export default function MobileBottomNav() {
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const token = useAppSelector((s) => s.auth.accessToken);
  const { openCreatePostModal } = useCreatePostModal();
  const { data: conversations } = useConversations();
  const [writeMenuAnchor, setWriteMenuAnchor] = useState<null | HTMLElement>(null);

  const messageUnread = useMemo(
    () =>
      (conversations as ConversationSummary[] | undefined)?.reduce(
        (sum, c) => sum + (c.unread_count ?? 0),
        0,
      ) ?? 0,
    [conversations],
  );

  const navValue = useMemo((): number | false => {
    const p = location.pathname;
    if (p === '/') return 0;
    if (p.startsWith('/explore')) return 1;
    if (!token) {
      if (p.startsWith('/auth')) return 2;
      return false;
    }
    if (p.startsWith('/dashboard')) return 2;
    if (p.startsWith('/drafts')) return -1;
    if (p.startsWith('/messages')) return 3;
    if (p.startsWith('/profile') || p.startsWith('/users/')) return 4;
    return false;
  }, [location.pathname, token]);

  if (!downMd) return null;

  const messagesIcon =
    messageUnread > 0 ? (
      <Badge badgeContent={messageUnread > 99 ? '99+' : messageUnread} color="error" max={99}>
        <ForumRoundedIcon />
      </Badge>
    ) : (
      <ForumRoundedIcon />
    );

  return (
    <Paper
      component="nav"
      elevation={12}
      square
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar - 1,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(14px)',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      {!token ? (
        <BottomNavigation
          value={navValue === false ? -1 : navValue}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-root': { minWidth: 0, maxWidth: 'none', px: 0.5 },
            '& .MuiBottomNavigationAction-label': { fontSize: '0.6875rem', opacity: { xs: 0.95, md: 1 } },
          }}
        >
          <BottomNavigationAction
            label="Home"
            icon={<HomeRoundedIcon />}
            component={Link}
            to="/"
          />
          <BottomNavigationAction
            label="Explore"
            icon={<ExploreRoundedIcon />}
            component={Link}
            to="/explore"
          />
          <BottomNavigationAction
            label="Sign in"
            icon={<LoginRoundedIcon />}
            component={Link}
            to="/auth"
          />
        </BottomNavigation>
      ) : (
        <BottomNavigation
          value={navValue === false ? -1 : navValue}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-root': { minWidth: 0, maxWidth: 'none', px: 0.35 },
            '& .MuiBottomNavigationAction-label': { fontSize: '0.625rem' },
          }}
        >
          <BottomNavigationAction
            label="Home"
            icon={<HomeRoundedIcon />}
            component={Link}
            to="/"
          />
          <BottomNavigationAction
            label="Explore"
            icon={<ExploreRoundedIcon />}
            component={Link}
            to="/explore"
          />
          <BottomNavigationAction
            label="Write"
            icon={<EditNoteRoundedIcon />}
            onClick={(e) => setWriteMenuAnchor(e.currentTarget)}
          />
          <Menu
            anchorEl={writeMenuAnchor}
            open={Boolean(writeMenuAnchor)}
            onClose={() => setWriteMenuAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <MenuItem
              onClick={() => {
                openCreatePostModal();
                setWriteMenuAnchor(null);
              }}
            >
              <CreateRoundedIcon fontSize="small" sx={{ mr: 1 }} />
              Create post
            </MenuItem>
            <MenuItem component={Link} to="/drafts" onClick={() => setWriteMenuAnchor(null)}>
              <EditNoteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
              Draft posts
            </MenuItem>
          </Menu>
          <BottomNavigationAction label="Messages" icon={messagesIcon} component={Link} to="/messages" />
          <BottomNavigationAction
            label="You"
            icon={<PersonRoundedIcon />}
            component={Link}
            to="/profile"
          />
        </BottomNavigation>
      )}
    </Paper>
  );
}
