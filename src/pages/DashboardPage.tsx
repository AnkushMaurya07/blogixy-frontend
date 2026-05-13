import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Button, Divider, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import dayjs, { type Dayjs } from 'dayjs';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { useCreatePostModal } from '../context/CreatePostModalContext';
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
import DashboardPetMascot from '../components/DashboardPetMascot';
import PageShell from '../components/PageShell';

export default function DashboardPage() {
  const theme = useTheme();
  const { openCreatePostModal } = useCreatePostModal();
  const [calendarDay, setCalendarDay] = useState<Dayjs | null>(() => dayjs());
  const analyticsQuery = useAnalytics();

  const totals = analyticsQuery.data as { total_posts: number; total_views: number; total_likes: number } | undefined;

  const chartData = useMemo(
    () => [
      { name: 'Posts', value: totals?.total_posts ?? 0 },
      { name: 'Views', value: totals?.total_views ?? 0 },
      { name: 'Likes', value: totals?.total_likes ?? 0 },
    ],
    [totals?.total_likes, totals?.total_posts, totals?.total_views],
  );

  return (
    <PageShell>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'flex-start',
        }}
      >
        <Stack spacing={4} sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 4, fontWeight: 740 }} color="primary.main">
              Author workspace
            </Typography>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 900 }}>
              Operations dashboard — publish, circulate, quantify.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lightweight metrics precede exhaustive GraphQL rollups—we already surface directional truth for author velocity,
              amplification, and reach.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {([
              {
                icon: <CreateRoundedIcon />,
                label: 'My posts published',
                valueKey: 'total_posts' as const,
                subtitle: 'Active inventory',
              },
              {
                icon: <InsightsRoundedIcon />,
                label: 'Audience views captured',
                valueKey: 'total_views' as const,
                subtitle: 'Cumulative glare',
              },
              {
                icon: <FavoriteRoundedIcon />,
                label: 'Likes collected',
                valueKey: 'total_likes' as const,
                subtitle: 'Applause signal',
              },
            ] as const).map((card) => {
              const numeric = totals ? totals[card.valueKey] : undefined;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.label}>
                  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
                    <Paper
                      sx={{
                        p: { xs: 2.75, md: 3 },
                        borderRadius: 4,
                        minHeight: 190,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.75,
                        height: '100%',
                      }}
                    >
                      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          {card.icon}
                        </Box>
                        <Typography variant="caption" sx={{ letterSpacing: 1.35, fontWeight: 700 }} color="text.secondary">
                          {card.subtitle}
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {analyticsQuery.isLoading ? '…' : (numeric ?? 0).toLocaleString()}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {card.label}
                      </Typography>
                      <LinearProgress
                        variant={typeof numeric === 'number' ? 'determinate' : 'indeterminate'}
                        value={numeric ? Math.min(100, (numeric % 180) || 62) : 25}
                        sx={{ mt: 'auto', height: 10, borderRadius: 999 }}
                      />
                    </Paper>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                Audience snapshot
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Live totals from your posts — same numbers as the cards above, shown as a quick comparison.
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 6, right: 8, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.9)} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                    <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} allowDecimals={false} />
                    <RechartsTooltip
                      cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }}
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        backgroundColor: theme.palette.background.paper,
                      }}
                    />
                    <Bar dataKey="value" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Editorial calendar
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Mark a day you want to publish next — native reminders can plug in later.
                </Typography>
                <DateCalendar value={calendarDay} onChange={(v) => setCalendarDay(v)} />
              </Paper>
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Paper sx={{ borderRadius: 4, p: { xs: 3, md: 4 } }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Compose
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  Create posts in a modal with AI drafts, attachments, publish or draft modes, automatic share links, and success confirmations — so you can stay on whatever page you are on.
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
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, xl: 4 }}>
            <Paper sx={{ p: 3.5, borderRadius: 4, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 740, mb: 1 }}>
                Momentum tips
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                Stack a short hook in the first two lines, add one strong visual, and publish on the day you picked in the calendar.
                Deeper cohort charts can land when we wire time-series analytics.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Selected plan date:{' '}
                <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {calendarDay ? calendarDay.format('MMM D, YYYY') : '—'}
                </Box>
              </Typography>
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
              borderRadius: 4,
              border: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`,
              background: (t) =>
                t.palette.mode === 'light'
                  ? `linear-gradient(165deg, ${alpha(t.palette.primary.main, 0.06)} 0%, ${alpha(t.palette.background.paper, 1)} 42%, ${alpha(t.palette.secondary.main, 0.04)} 100%)`
                  : `linear-gradient(165deg, ${alpha(t.palette.primary.main, 0.12)} 0%, ${alpha(t.palette.background.paper, 0.98)} 45%, ${alpha('#1e293b', 0.5)} 100%)`,
              maxHeight: 'inherit',
              overflow: 'hidden',
            }}
          >
            <DashboardPetMascot />
          </Paper>
        </Box>
      </Box>
    </PageShell>
  );
}
