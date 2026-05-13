import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import dayjs, { type Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useAnalytics } from '../api/hooks';
import type { BlogAnalytics } from '../api/types';
import DashboardPetMascot from '../components/DashboardPetMascot';
import PageShell from '../components/PageShell';
import { useCreatePostModal } from '../context/CreatePostModalContext';

dayjs.extend(relativeTime);

const cardMotion = {
  whileHover: { y: -4 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

export default function DashboardPage() {
  const theme = useTheme();
  const { openCreatePostModal } = useCreatePostModal();
  const [calendarDay, setCalendarDay] = useState<Dayjs | null>(() => dayjs());
  const analyticsQuery = useAnalytics();
  const data = analyticsQuery.data as BlogAnalytics | undefined;

  const chartData = useMemo(
    () => [
      { name: 'Posts', value: data?.total_posts ?? 0 },
      { name: 'Views', value: data?.total_views ?? 0 },
      { name: 'Likes', value: data?.total_likes ?? 0 },
      { name: 'Comments', value: data?.total_comments ?? 0 },
    ],
    [data?.total_comments, data?.total_likes, data?.total_posts, data?.total_views],
  );

  const statCards = useMemo(
    () =>
      [
        {
          icon: <CreateRoundedIcon />,
          label: 'Total posts',
          value: data?.total_posts,
          hint: 'Published inventory',
        },
        {
          icon: <InsightsRoundedIcon />,
          label: 'Total views',
          value: data?.total_views,
          hint: 'Reads across your work',
        },
        {
          icon: <ChatBubbleOutlineRoundedIcon />,
          label: 'Comments',
          value: data?.total_comments,
          hint: 'Public conversation depth',
        },
        {
          icon: <FavoriteRoundedIcon />,
          label: 'Total likes',
          value: data?.total_likes,
          hint: 'Engagement signal',
        },
      ] as const,
    [data?.total_comments, data?.total_likes, data?.total_posts, data?.total_views],
  );

  return (
    <PageShell>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, md: 3.5 },
          alignItems: 'flex-start',
        }}
      >
        <Stack spacing={{ xs: 3.5, md: 4 }} sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.12em', fontWeight: 780 }} color="primary.main">
              Author analytics
            </Typography>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 850, letterSpacing: '-0.03em', mt: 0.5 }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, lineHeight: 1.7 }}>
              Track how your posts perform in one place: reach, spotlight content, and recent activity at a glance.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            {statCards.map((card) => {
              const numeric = typeof card.value === 'number' ? card.value : undefined;
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
                  <motion.div {...cardMotion}>
                    <Paper
                      sx={{
                        p: { xs: 2.5, md: 2.75 },
                        borderRadius: 3,
                        minHeight: 168,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        height: '100%',
                      }}
                    >
                      <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          {card.icon}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 650, letterSpacing: '0.04em' }}>
                          {card.hint}
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {analyticsQuery.isLoading ? '…' : (numeric ?? 0).toLocaleString()}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>
                        {card.label}
                      </Typography>
                      <LinearProgress
                        variant={typeof numeric === 'number' ? 'determinate' : 'indeterminate'}
                        value={numeric ? Math.min(100, (numeric % 200) || 55) : 28}
                        sx={{ mt: 'auto', height: 8, borderRadius: 999 }}
                      />
                    </Paper>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.25 }}>
                  Public engagement
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average views per post — useful when your catalog grows.
                </Typography>
              </Box>
              <Chip
                icon={<TrendingUpRoundedIcon />}
                label={analyticsQuery.isLoading ? '…' : `${data?.avg_views_per_post ?? 0} avg views / post`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}
              />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ width: '100%', height: { xs: 260, sm: 300 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.85)} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} allowDecimals={false} />
                  <RechartsTooltip
                    cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }}
                    contentStyle={{
                      borderRadius: 12,
                      border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
                      backgroundColor: theme.palette.background.paper,
                    }}
                  />
                  <Bar dataKey="value" fill={theme.palette.primary.main} radius={[10, 10, 0, 0]} maxBarSize={52} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, height: '100%' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <VisibilityRoundedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Most viewed post
                  </Typography>
                </Stack>
                {analyticsQuery.isLoading ? (
                  <Typography color="text.secondary">Loading…</Typography>
                ) : data?.most_viewed_post ? (
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.45 }}>
                      {data.most_viewed_post.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Chip label={`${data.most_viewed_post.view_count.toLocaleString()} views`} size="small" color="primary" />
                    </Stack>
                    <Button component={RouterLink} to={`/blogs/${data.most_viewed_post.slug}`} variant="contained" sx={{ alignSelf: 'flex-start' }}>
                      Open post
                    </Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Publish a post to see your top performer here.
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <UpdateRoundedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Recent activity
                  </Typography>
                </Stack>
                {analyticsQuery.isLoading ? (
                  <Typography color="text.secondary">Loading…</Typography>
                ) : (data?.recent_activity?.length ?? 0) === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No posts yet — your latest work will show up here with views, likes, and comments.
                  </Typography>
                ) : (
                  <Stack spacing={0} sx={{ flex: 1, overflow: 'auto', maxHeight: { xs: 360, lg: 420 } }}>
                    {data!.recent_activity.map((row, idx) => (
                      <Box key={row.slug}>
                        {idx > 0 ? <Divider sx={{ my: 1.25 }} /> : null}
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                            <Typography
                              component={RouterLink}
                              to={`/blogs/${row.slug}`}
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                textDecoration: 'none',
                                flex: 1,
                                minWidth: 0,
                                lineHeight: 1.45,
                                '&:hover': { color: 'primary.main' },
                              }}
                            >
                              {row.title}
                            </Typography>
                            {!row.is_published ? <Chip label="Draft" size="small" variant="outlined" /> : null}
                          </Stack>
                          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                            <Chip size="small" variant="outlined" label={`${row.view_count} views`} />
                            <Chip size="small" variant="outlined" label={`${row.like_count} likes`} />
                            <Chip size="small" variant="outlined" label={`${row.comment_count} comments`} />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {row.created_at ? `Published ${dayjs(row.created_at).fromNow()}` : ''}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, height: '100%', minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                    Editorial calendar
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pick your next publish date — reminders can plug in later.
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      minWidth: 0,
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      pb: 0.5,
                    }}
                  >
                    <Box sx={{ minWidth: 300, maxWidth: '100%', mx: 'auto' }}>
                      <DateCalendar
                        value={calendarDay}
                        onChange={(v) => setCalendarDay(v)}
                        sx={{
                          width: '100%',
                          maxWidth: '100%',
                          '& .MuiPickersCalendarHeader-root': {
                            px: 0.5,
                            margin: 0,
                            maxWidth: '100%',
                          },
                          '& .MuiPickersArrowSwitcher-root': { flexShrink: 0 },
                          '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': {
                            justifyContent: 'space-between',
                          },
                          '& .MuiDayCalendar-weekContainer': { mx: 0 },
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ borderRadius: 3, p: { xs: 2.75, md: 3.25 }, height: '100%' }}>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Compose
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Open the editor with drafts, media, and publish controls — without leaving your flow.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CreateRoundedIcon />}
                    onClick={() => openCreatePostModal()}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Create post
                  </Button>
                  <Divider />
                  <Typography variant="caption" color="text.secondary">
                    Plan date:{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {calendarDay ? calendarDay.format('MMM D, YYYY') : '—'}
                    </Box>
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>

        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: { md: 300, lg: 340 },
            flexShrink: 0,
            position: 'sticky',
            top: (t) => `calc(${t.mixins.toolbar.minHeight}px + ${t.spacing(2)})`,
            alignSelf: 'flex-start',
            maxHeight: (t) => `calc(100vh - ${t.mixins.toolbar.minHeight}px - ${t.spacing(4)})`,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              minHeight: 460,
              display: 'flex',
              flexDirection: 'column',
              p: { md: 2.5 },
              borderRadius: 3,
              maxHeight: 'inherit',
              overflow: 'hidden',
              background: (t) =>
                t.palette.mode === 'light'
                  ? `linear-gradient(165deg, ${alpha(t.palette.primary.main, 0.06)} 0%, ${alpha(t.palette.background.paper, 1)} 42%, ${alpha(t.palette.secondary.main, 0.04)} 100%)`
                  : `linear-gradient(165deg, ${alpha(t.palette.primary.main, 0.12)} 0%, ${alpha(t.palette.background.paper, 0.98)} 45%, ${alpha('#1e293b', 0.5)} 100%)`,
            }}
          >
            <DashboardPetMascot />
          </Paper>
        </Box>
      </Box>
    </PageShell>
  );
}
