import { alpha, Box, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

import { useHomeFeed, useToggleLike } from '../api/hooks';
import type { BlogPost, HomeFeedResponse } from '../api/types';

import BlogCard from '../components/BlogCard';
import PageShell from '../components/PageShell';
import { useAppSelector } from '../features/auth/hooks';

export default function HomePage() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const { data, isLoading } = useHomeFeed();
  const toggleLike = useToggleLike();

  const feeds = data as HomeFeedResponse | undefined;
  const followingFeed = feeds?.following_feed ?? [];
  const discoveryFeed = feeds?.discovery_feed ?? [];

  const likeIfAuth = token
    ? (blog: BlogPost) => toggleLike.mutateAsync(blog.slug)
    : undefined;

  return (
    <PageShell>
      <Stack spacing={1}>
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 2.4, fontWeight: 800 }}>
          BlogXy Pulse
        </Typography>
        <Typography variant="h3" gutterBottom sx={{ mb: { xs: 1, md: 1.75 } }}>
          Stories from people you follow, plus discoveries from everywhere.
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: { xs: 3, md: 4 }, maxWidth: 720 }}>
          The home timeline prioritizes creators you&apos;ve opted into—then surfaces sharp public voices you may never have bumped into otherwise.
        </Typography>
      </Stack>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`sk-${String(i)}`}>
              <Skeleton variant="rounded" height={312} sx={{ borderRadius: 4 }} animation="wave" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack spacing={6}>
          {token ? (
            <section>
              <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Feed from creators you follow
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Private circle of updates from people whose signal you boosted.
                  </Typography>
                </Box>
              </Stack>
              {followingFeed.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Box
                    sx={(theme) => ({
                      px: { xs: 3, md: 5 },
                      py: { xs: 4, md: 6 },
                      textAlign: 'center',
                      borderRadius: (Number(theme.shape.borderRadius) || 14) * 2,
                      border: `1px dashed ${theme.palette.primary.main}`,
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.04 : 0.12),
                      backdropFilter: 'blur(14px)',
                    })}
                  >
                    <Typography color="text.secondary">
                      Nobody is in your follow graph yet — explore above or head to Explore to scout talent and hit follow.
                    </Typography>
                  </Box>
                </motion.div>
              ) : (
                <Grid container spacing={3}>
                  {followingFeed.map((blog: BlogPost) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`f-${blog.id}`}>
                      <BlogCard blog={blog} onLikeToggle={likeIfAuth ? () => likeIfAuth(blog) : undefined} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </section>
          ) : (
            <Box />
          )}
          <section>
            <Typography variant="h5" gutterBottom>
              Spotlight from everywhere
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {token
                ? 'Public notebooks from authors you aren’t subscribed to keeps your lens wideopen.'
                : 'Public posts powering the homepage while you browse.'}
            </Typography>
            <Grid container spacing={3}>
              {discoveryFeed.map((blog: BlogPost, index: number) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`d-${blog.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10%' }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <BlogCard blog={blog} onLikeToggle={likeIfAuth ? () => likeIfAuth(blog) : undefined} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </section>
        </Stack>
      )}
    </PageShell>
  );
}
