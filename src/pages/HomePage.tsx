import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  useFavoriteBlogs,
  useInfiniteHomeFeed,
  useProfile,
  useSuggestedUsers,
  useToggleFavorite,
  useToggleFollow,
  useToggleLike,
} from '../api/hooks';
import type { BlogPost, FavoriteEntry, UserProfile } from '../api/types';
import { userAvatarUrl } from '../api/mediaUrl';

import FeedPost from '../components/FeedPost';
import PageShell from '../components/PageShell';
import { useCreatePostModal } from '../context/CreatePostModalContext';
import { useAppSelector } from '../features/auth/hooks';

function FeedLineSkeleton() {
  const theme = useTheme();
  return (
    <Stack spacing={1.5} sx={{ flexDirection: 'row', p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
        <Skeleton width="90%" height={24} sx={{ mb: 0.5 }} />
        <Skeleton width="100%" height={18} />
        <Skeleton width="100%" height={18} sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" width="100%" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    </Stack>
  );
}

export default function HomePage() {
  const theme = useTheme();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [feedTab, setFeedTab] = useState(0);

  const mainFeedAll = useInfiniteHomeFeed({ section: 'all', enabled: !token || feedTab === 0 });
  const activeHomeFeed = !token || feedTab === 0 ? mainFeedAll : null;

  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const toggleLike = useToggleLike();
  const toggleFavorite = useToggleFavorite();
  const favoritesQuery = useFavoriteBlogs();
  const profileQuery = useProfile();
  const suggestedQuery = useSuggestedUsers();
  const toggleFollow = useToggleFollow();

  const timelinePosts = useMemo(
    () => activeHomeFeed?.data?.pages.flatMap((p) => p.results) ?? [],
    [activeHomeFeed?.data],
  );

  const feedError = Boolean(activeHomeFeed?.isError);
  const feedLoading = Boolean(activeHomeFeed?.isLoading);
  const hasNextPage = Boolean(activeHomeFeed?.hasNextPage);
  const isFetchingNextPage = Boolean(activeHomeFeed?.isFetchingNextPage);
  const fetchNextPage = activeHomeFeed?.fetchNextPage;

  useEffect(() => {
    const el = loadMoreSentinelRef.current;
    if (!activeHomeFeed || !fetchNextPage) {
      return;
    }
    if (!el || feedError) {
      return;
    }
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: '280px', threshold: 0 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [
    activeHomeFeed,
    feedError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    timelinePosts.length,
  ]);

  const favoriteEntries = (favoritesQuery.data as FavoriteEntry[] | undefined) ?? [];
  const favouriteBlogs = favoriteEntries.map((e) => e.blog);

  const likeIfAuth = token
    ? (blog: BlogPost) => toggleLike.mutateAsync(blog.slug)
    : undefined;
  const favoriteIfAuth = token
    ? (blog: BlogPost) => toggleFavorite.mutateAsync(blog.slug)
    : undefined;

  const suggestions =
    (suggestedQuery.data as { id: number; username: string; avatar?: string | null }[] | undefined) ?? [];
  const sidebarSuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  const profile = profileQuery.data as UserProfile | undefined;
  const { openCreatePostModal } = useCreatePostModal();

  const showTimelineInfinite = (!token || feedTab === 0) && !feedError;

  const refetchFeed = () => void activeHomeFeed?.refetch();

  const renderTimelineList = () => (
    <>
      {timelinePosts.map((blog: BlogPost, i: number) => (
        <FeedPost
          key={blog.id}
          blog={blog}
          onLikeToggle={likeIfAuth ? () => likeIfAuth(blog) : undefined}
          onFavoriteToggle={favoriteIfAuth ? () => favoriteIfAuth(blog) : undefined}
          showDivider={i < timelinePosts.length - 1}
        />
      ))}
      {showTimelineInfinite && hasNextPage ? (
        <Box ref={loadMoreSentinelRef} sx={{ height: 24, flexShrink: 0 }} aria-hidden />
      ) : null}
      {showTimelineInfinite && isFetchingNextPage ? (
        <Stack>
          <FeedLineSkeleton />
          <FeedLineSkeleton />
        </Stack>
      ) : null}
    </>
  );

  return (
    <PageShell>
      <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ maxWidth: { md: 680 }, mx: { md: 'auto' }, width: '100%' }}>
          <Stack spacing={0}>
            {/* Feed shell — Twitter / X style list container */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: { xs: 0, sm: 3 },
                overflow: 'hidden',
                border: { xs: 'none', sm: `1px solid ${alpha(theme.palette.divider, 0.14)}` },
                bgcolor: 'background.paper',
                mx: { xs: -2.5, sm: 0 },
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.75,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  position: 'sticky',
                  top: { md: 72 },
                  zIndex: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.92),
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    width: '100%',
                    minHeight: 40,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: theme.typography.pxToRem(22),
                      letterSpacing: '-0.04em',
                      m: 0,
                      lineHeight: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      background: `linear-gradient(120deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.92 : 1)} 120%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Home
                  </Typography>
                  {token ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disableElevation
                      startIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: '1.125rem !important' }} />}
                      onClick={() => openCreatePostModal()}
                      sx={{
                        flexShrink: 0,
                        minHeight: 34,
                        py: 0.375,
                        px: 1.125,
                        fontWeight: 700,
                        fontSize: theme.typography.pxToRem(13),
                        borderRadius: 2,
                        textTransform: 'none',
                        lineHeight: 1,
                      }}
                    >
                      Post
                    </Button>
                  ) : (
                    <Button
                      component={RouterLink}
                      to="/auth"
                      variant="outlined"
                      size="small"
                      sx={{ flexShrink: 0, alignSelf: 'center', textTransform: 'none' }}
                    >
                      Sign in
                    </Button>
                  )}
                </Box>
              </Box>

              {token && suggestions.length > 0 ? (
                <Box
                  sx={{
                    mt: '20px',
                    py: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.02 : 0.06),
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      px: 2,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      display: 'block',
                      mb: 1.5,
                      color: 'primary.main',
                      fontSize: theme.typography.pxToRem(11),
                    }}
                  >
                    People to connect
                  </Typography>
                  <Stack
                    spacing={2}
                    sx={{
                      flexDirection: 'row',
                      overflowX: 'auto',
                      px: 2,
                      pb: 0.5,
                      scrollbarWidth: 'none',
                      '&::-webkit-scrollbar': { display: 'none' },
                    }}
                  >
                    <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                      <Avatar
                        role="button"
                        aria-label="Create new post"
                        onClick={() => openCreatePostModal()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openCreatePostModal();
                          }
                        }}
                        tabIndex={0}
                        sx={{
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 0.5,
                          mt: 2,
                          border: `3px solid ${theme.palette.primary.main}`,
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          cursor: 'pointer',
                        }}
                      >
                        <AddCircleOutlineRoundedIcon />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 650, maxWidth: 72, display: 'block' }} noWrap>
                        New post
                      </Typography>
                    </Box>
                    {profile?.username ? (
                      <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                        <Avatar
                          component={RouterLink}
                          to="/profile"
                          src={userAvatarUrl(
                            {
                              id: profile.id,
                              username: profile.username,
                              avatar: profile.avatar ?? null,
                            },
                            128,
                          )}
                          sx={{
                            width: 64,
                            height: 64,
                            mx: 'auto',
                            mb: 0.5,
                            fontWeight: 800,
                            border: `3px solid ${alpha(theme.palette.secondary.main, 0.5)}`,
                          }}
                        >
                          {profile.username.slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 650, maxWidth: 72, display: 'block' }} noWrap>
                          Your story
                        </Typography>
                      </Box>
                    ) : null}
                    {suggestions.slice(0, 12).map((u) => (
                      <Box key={u.id} sx={{ textAlign: 'center', flexShrink: 0 }}>
                        <Avatar
                          component={RouterLink}
                          to={`/users/${u.id}`}
                          src={userAvatarUrl(
                            { id: u.id, username: u.username, avatar: u.avatar ?? null },
                            128,
                          )}
                          sx={{
                            width: 64,
                            height: 64,
                            mx: 'auto',
                            mb: 0.5,
                            fontWeight: 800,
                            border: `3px solid ${alpha(theme.palette.divider, 0.25)}`,
                          }}
                        >
                          {u.username.slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 650, maxWidth: 72, display: 'block' }} noWrap>
                          @{u.username}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : null}

              {token ? (
                <Tabs
                  value={feedTab}
                  onChange={(_, v: number) => setFeedTab(v)}
                  variant="fullWidth"
                  sx={{
                    minHeight: 48,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minHeight: 48 },
                  }}
                >
                  <Tab label="Feed" />
                  <Tab label="Saved" />
                </Tabs>
              ) : null}

              <Box sx={{ px: { xs: 0, sm: 0 }, pt: '20px' }}>
                {feedError ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                      Could not load your feed.
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => refetchFeed()}>
                      Retry
                    </Button>
                  </Box>
                ) : feedLoading && timelinePosts.length === 0 ? (
                  <Stack>
                    <FeedLineSkeleton />
                    <FeedLineSkeleton />
                    <FeedLineSkeleton />
                  </Stack>
                ) : token ? (
                  feedTab === 0 ? (
                    timelinePosts.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'inline-flex',
                              justifyContent: 'center',
                              mb: 2.5,
                            }}
                          >
                            {[0, 1, 2].map((i) => (
                              <Avatar
                                key={i}
                                sx={{
                                  width: 56,
                                  height: 56,
                                  ml: i > 0 ? -2 : 0,
                                  zIndex: 3 - i,
                                  border: '3px solid',
                                  borderColor: 'background.paper',
                                  fontWeight: 800,
                                  bgcolor: alpha(theme.palette.primary.main, 0.25 + i * 0.12),
                                }}
                              >
                                <AlternateEmailRoundedIcon sx={{ opacity: 0.85 }} />
                              </Avatar>
                            ))}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                            Nothing on the feed yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 400, mx: 'auto', lineHeight: 1.65 }}>
                            When the community publishes posts, they show up here automatically. Ask an admin to run the demo seed or open Explore.
                          </Typography>
                          <Stack spacing={1.5} sx={{ flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', mb: 1 }}>
                            <Button component={RouterLink} to="/explore" variant="contained" size="medium" fullWidth sx={{ maxWidth: 280, mx: 'auto' }}>
                              Explore posts
                            </Button>
                            <Button
                              variant="outlined"
                              size="medium"
                              fullWidth
                              sx={{ maxWidth: 280, mx: 'auto' }}
                              onClick={() => setFeedTab(1)}
                            >
                              Saved posts
                            </Button>
                          </Stack>
                        </motion.div>
                      </Box>
                    ) : (
                      renderTimelineList()
                    )
                  ) : favoritesQuery.isLoading ? (
                    <Stack>
                      <FeedLineSkeleton />
                      <FeedLineSkeleton />
                    </Stack>
                  ) : favouriteBlogs.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                        No favourites yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto', lineHeight: 1.65 }}>
                        Tap the bookmark on any post to save it here. Home shows everyone’s public posts in one stream.
                      </Typography>
                      <Button component={RouterLink} to="/explore" variant="contained" size="small">
                        Browse posts
                      </Button>
                    </Box>
                  ) : (
                    favouriteBlogs.map((blog: BlogPost, i: number) => (
                      <FeedPost
                        key={blog.id}
                        blog={blog}
                        onLikeToggle={likeIfAuth ? () => likeIfAuth(blog) : undefined}
                        onFavoriteToggle={favoriteIfAuth ? () => favoriteIfAuth(blog) : undefined}
                        showDivider={i < favouriteBlogs.length - 1}
                      />
                    ))
                  )
                ) : timelinePosts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                    No public posts to show yet.
                  </Typography>
                ) : (
                  renderTimelineList()
                )}
              </Box>
            </Paper>

            {!token ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2, px: 1 }}>
                Sign in to follow people, save favourites, and like posts.
              </Typography>
            ) : null}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'sticky', top: 96 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  mb: 1.5,
                  pb: 1,
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                  display: 'inline-block',
                  width: '100%',
                }}
              >
                What&apos;s Blogixy?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                Short-form social blogging: scroll a feed, tap into full posts, comment, like, and DM a post to a friend — same muscle memory as Instagram or X.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Button component={RouterLink} to="/explore" variant="outlined" fullWidth size="small" sx={{ mb: 1 }}>
                Explore
              </Button>
              {token ? (
                <>
                  <Button component={RouterLink} to="/messages" variant="outlined" fullWidth size="small" sx={{ mb: 2 }}>
                    Messages
                  </Button>

                  {sidebarSuggestions.length > 0 ? (
                    <>
                      <Typography
                        variant="overline"
                        sx={{
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          display: 'block',
                          mb: 1.5,
                          color: 'primary.main',
                          fontSize: theme.typography.pxToRem(11),
                        }}
                      >
                        Who to follow
                      </Typography>
                      <Stack spacing={1.5}>
                        {sidebarSuggestions.map((u) => (
                          <Stack key={u.id} spacing={1.25} sx={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar
                              component={RouterLink}
                              to={`/users/${u.id}`}
                              src={userAvatarUrl(
                                { id: u.id, username: u.username, avatar: u.avatar ?? null },
                                80,
                              )}
                              sx={{
                                width: 40,
                                height: 40,
                                fontWeight: 700,
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              }}
                            >
                              {u.username.slice(0, 1).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                component={RouterLink}
                                to={`/users/${u.id}`}
                                sx={{ fontWeight: 700, textDecoration: 'none', color: 'text.primary', display: 'block' }}
                                noWrap
                              >
                                @{u.username}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => toggleFollow.mutateAsync(u.id)}
                              disabled={toggleFollow.isPending}
                              sx={{ minWidth: 76, borderRadius: 99 }}
                            >
                              Follow
                            </Button>
                          </Stack>
                        ))}
                      </Stack>
                    </>
                  ) : null}
                </>
              ) : (
                <Button component={RouterLink} to="/auth" variant="contained" fullWidth size="small">
                  Get started
                </Button>
              )}
            </Paper>

            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                <Chip label="Tips" size="small" sx={{ mr: 0.75, height: 22 }} />
                One feed mixes all authors (except your posts). Save posts to the Saved tab with the bookmark.
              </Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </PageShell>
  );
}
