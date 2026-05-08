import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import TopicRoundedIcon from '@mui/icons-material/TopicRounded';
import { Box, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../api/hooks';
import PageShell from '../components/PageShell';

type NotificationRow = { id: number; title: string; message: string; is_read: boolean; created_at?: string };

export default function NotificationsPage() {
  const theme = useTheme();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const rows = (
    data as (NotificationRow & {
      notification_type?: string;
      actor_name?: string;
      target_blog_slug?: string;
    })[] | undefined
  ) ?? [];

  return (
    <PageShell>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Stack spacing={1}>
          <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 3, fontWeight: 780 }}>
            Live briefings
          </Typography>
          <Typography variant="h4">Notifications</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
            Incoming messages ping here instantly—paired with richer context from posts and moderation events.
          </Typography>
        </Stack>
        <Button variant="outlined" onClick={() => markAllRead.mutate()} sx={{ alignSelf: { md: 'flex-start' } }}>
          Mark all read
        </Button>
      </Stack>

      <Stack spacing={2}>
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`n-sk-${String(i)}`} height={96} variant="rounded" sx={{ borderRadius: 4 }} animation="wave" />
          ))}
        {!isLoading &&
          rows.map((note, idx) => {
            const isMessageAlert = (note.notification_type ?? note.title).toLowerCase().includes('message');
            return (
              <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.035 }}>
                <Paper
                  sx={{
                    px: { xs: 2, md: 2.5 },
                    py: { xs: 2, md: 2.25 },
                    borderRadius: 3,
                    display: 'flex',
                    gap: { xs: 2, md: 2.5 },
                    alignItems: 'flex-start',
                    borderLeft: `4px solid ${
                      isMessageAlert ? theme.palette.warning.light : alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.5 : 0.8)
                    }`,
                  }}
                >
                  <Box
                    sx={{
                      mt: 0.5,
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor:
                        theme.palette.mode === 'light'
                          ? alpha(theme.palette.primary.main, 0.06)
                          : alpha(theme.palette.primary.main, 0.16),
                      color: theme.palette.primary.main,
                    }}
                  >
                    {isMessageAlert ? <MarkEmailUnreadRoundedIcon /> : note.title.includes('published') ? <TopicRoundedIcon /> : <NotificationsActiveRoundedIcon />}
                  </Box>
                  <Stack sx={{ flex: 1 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {note.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        {isMessageAlert ? <Chip variant="filled" label="Messaging" color="warning" /> : null}
                        <Chip variant="outlined" label={note.is_read ? 'Read' : 'New'} />
                      </Stack>
                    </Stack>
                      {note.actor_name ? (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                          Triggered by @{note.actor_name}
                        </Typography>
                      ) : null}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {note.message}
                    </Typography>
                      {note.target_blog_slug ? (
                        <Typography variant="caption" sx={{ mt: 0.75 }}>
                          Blog: {note.target_blog_slug}
                        </Typography>
                      ) : null}
                    {!note.is_read && (
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                        <Button variant="text" sx={{ alignSelf: { md: 'flex-start' } }} onClick={() => markRead.mutate(note.id)}>
                          Mark as read
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </motion.div>
            );
          })}
        {!isLoading && rows.length === 0 ? (
          <Paper sx={{ p: 8, borderRadius: 4, textAlign: 'center' }}>
            <Typography variant="subtitle1">No notifications queued</Typography>
            <Typography variant="body2" color="text.secondary">
              Compose a message—or publish—to spark telemetry here.
            </Typography>
          </Paper>
        ) : null}
      </Stack>
    </PageShell>
  );
}
