import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent,
  type Theme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import BlogCommentsPanel from '../components/BlogCommentsPanel';
import PageShell from '../components/PageShell';
import { useInfiniteExploreBlogs, useToggleFavorite, useToggleLike } from '../api/hooks';
import { firstBlogImageUrl, firstBlogVideoUrl } from '../api/mediaUrl';
import type { BlogPost } from '../api/types';
import { useAppSelector } from '../features/auth/hooks';
import { useDebouncedValue } from '../utils/useDebouncedValue';
import { useThrottleFn } from '../utils/useThrottleFn';

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 320);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'ranking'>('ranking');
  const token = useAppSelector((s) => s.auth.accessToken);

  const qParam = searchParams.get('q')?.trim() ?? '';
  useEffect(() => {
    if (!qParam) return;
    setSearchInput(qParam);
    setSearch(qParam);
  }, [qParam]);

  const exploreLoadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data: explorePages,
    isLoading: exploreLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isFetching,
    isError: exploreError,
  } = useInfiniteExploreBlogs({ search, sort });
  const toggleLike = useToggleLike();
  const toggleFavorite = useToggleFavorite();

  const explorePosts = useMemo(
    () => (explorePages?.pages ?? []).flatMap((p) => p.results ?? []),
    [explorePages],
  );
  /** Keeps the previous grid visible while React Query refetches (concurrent UI). */
  const deferredExplorePosts = useDeferredValue(explorePosts);
  const listForGrid = deferredExplorePosts;
  const showExploreRefetchBar = isFetching && !exploreLoading && explorePosts.length > 0;

  const onSortChange = (e: SelectChangeEvent<'ranking' | 'latest'>) => {
    setSort(e.target.value as 'ranking' | 'latest');
  };

  const applySearch = useThrottleFn(() => {
    setSearch(debouncedSearch);
  }, 350);

  useEffect(() => {
    applySearch();
  }, [applySearch, debouncedSearch]);

  useEffect(() => {
    const el = exploreLoadMoreRef.current;
    if (!el || exploreError) {
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
      { root: null, rootMargin: '320px', threshold: 0 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [exploreError, fetchNextPage, hasNextPage, isFetchingNextPage, explorePosts.length]);

  return (
    <PageShell>
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, letterSpacing: -0.6 }}>
        Explore
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: 640 }}>
        {
          "Search posts by keyword. Sort by what's moving or what's newest — same mental model as discovery feeds on larger networks, tuned for long-form posts."
        }
      </Typography>

      <Paper
        elevation={0}
        sx={(theme: Theme) => ({
          px: { xs: 2, md: 3 },
          py: { xs: 2.75, md: 3 },
          mb: { xs: 3, md: 4 },
          borderRadius: 4,
          backgroundImage:
            theme.palette.mode === 'light'
              ? `linear-gradient(125deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main ?? theme.palette.info.main, 0.06)})`
              : 'linear-gradient(120deg,#121b2c,#171f30)',
          border: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Keywords, moods, hashtags…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                },
              }}
              variant="filled"
              label="Search"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <FormControl variant="filled" fullWidth>
              <InputLabel id="explore-sort">Sort</InputLabel>
              <Select variant="filled" labelId="explore-sort" value={sort} label="Sort" onChange={onSortChange}>
                <MenuItem value="ranking">Momentum (likes + chatter)</MenuItem>
                <MenuItem value="latest">Latest drops</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Box sx={{ height: '100%', display: 'flex', gap: 1 }}>
              <Button
                sx={{ flex: 1 }}
                variant="contained"
                disableElevation
                onClick={() => refetch()}
                disabled={isFetching}
                aria-busy={isFetching}
              >
                Apply
              </Button>
              <Button sx={{ px: 0, minWidth: 48 }} variant="text" aria-label="tune">
                <TuneRoundedIcon />
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.25} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1.25 }} useFlexGap>
          <Chip icon={<TuneRoundedIcon fontSize="inherit" />} label="Category filters queued" variant="outlined" />
          <Chip icon={<TrendingUpRoundedIcon fontSize="inherit" />} label="Surface what is trending" variant="outlined" />
        </Stack>
      </Paper>

      {exploreError ? (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          Could not load explore.{' '}
          <Button variant="text" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        </Typography>
      ) : null}

      {exploreLoading && explorePosts.length === 0 ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={`ex-${String(i)}`}>
              <Skeleton variant="rounded" height={428} sx={{ borderRadius: 5 }} animation="wave" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {showExploreRefetchBar ? (
            <LinearProgress
              color="primary"
              sx={{ mb: 2, height: 3, borderRadius: 99, maxWidth: '100%' }}
              aria-label="Updating results"
            />
          ) : null}
          <Grid container spacing={3}>
          {listForGrid.map((blog: BlogPost, idx: number) => (
            <Grid size={{ xs: 12, md: 6 }} key={blog.id}>
              <motion.article
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Paper
                  sx={(theme: Theme) => ({
                    borderRadius: 4,
                    p: { xs: 2.5, md: 3 },
                    minHeight: 360,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.06)}`,
                    boxShadow: `0 20px 60px rgba(12,52,138, ${theme.palette.mode === 'light' ? 0.08 : 0.28})`,
                  })}
                >
                  <Stack spacing={1}>
                    <Typography variant="h6">
                      <Box component={Link} to={`/blogs/${blog.slug}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
                        {blog.title}
                      </Box>
                    </Typography>
                    {firstBlogVideoUrl(blog.media_items) ? (
                      <Box
                        component="video"
                        src={firstBlogVideoUrl(blog.media_items)}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        sx={{
                          width: '100%',
                          maxHeight: 200,
                          borderRadius: 2,
                          bgcolor: 'common.black',
                          objectFit: 'cover',
                        }}
                      />
                    ) : firstBlogImageUrl(blog.media_items) ? (
                      <Box
                        component="img"
                        src={firstBlogImageUrl(blog.media_items)}
                        alt=""
                        loading="lazy"
                        sx={{ width: '100%', maxHeight: 200, borderRadius: 2, objectFit: 'cover' }}
                      />
                    ) : null}
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 72 }}>
                      {blog.content.slice(0, 220)}{blog.content.length > 220 ? '…' : ''}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                    <Chip size="small" variant="outlined" icon={<InsightsRoundedIcon fontSize="inherit" />} label={`${blog.view_count} views`} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      @{blog.author_name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', mt: 0.5 }} useFlexGap>
                    <Tooltip title={token ? 'Open post and comments' : 'Sign in to interact'}>
                      <Button
                        component={Link}
                        to={`/blogs/${blog.slug}`}
                        size="small"
                        variant="outlined"
                        startIcon={<ChatBubbleOutlineRoundedIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        {blog.comments_count} comments
                      </Button>
                    </Tooltip>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary', px: 0.5 }}>
                      <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {blog.view_count}
                      </Typography>
                    </Stack>
                    <Tooltip title={token ? (blog.is_liked ? 'Unlike' : 'Like') : 'Sign in to like'}>
                      <span>
                        <IconButton
                          size="small"
                          disabled={!token}
                          onClick={() => toggleLike.mutate(blog.slug)}
                          aria-label={blog.is_liked ? 'Unlike post' : 'Like post'}
                          sx={{ color: blog.is_liked ? 'error.main' : 'text.secondary' }}
                        >
                          {blog.is_liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650, minWidth: 16 }}>
                      {blog.likes_count}
                    </Typography>
                    {token ? (
                      <Tooltip title={blog.is_favorited ? 'Remove from favourites' : 'Save to favourites'}>
                        <IconButton
                          size="small"
                          aria-label="Toggle favourite"
                          color={blog.is_favorited ? 'primary' : 'default'}
                          onClick={() => toggleFavorite.mutate(blog.slug)}
                        >
                          {blog.is_favorited ? <BookmarkAddedRoundedIcon /> : <BookmarkBorderRoundedIcon />}
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Stack>
                  <Button component={Link} to={`/blogs/${blog.slug}`} variant="contained" size="small" sx={{ mt: 'auto', alignSelf: 'flex-start' }}>
                    Read full post
                  </Button>
                  <BlogCommentsPanel slug={blog.slug} />
                </Paper>
              </motion.article>
            </Grid>
          ))}
          {hasNextPage ? (
            <Grid size={{ xs: 12 }}>
              <Box ref={exploreLoadMoreRef} sx={{ height: 16 }} aria-hidden />
            </Grid>
          ) : null}
          {isFetchingNextPage
            ? Array.from({ length: 2 }).map((_, i) => (
                <Grid size={{ xs: 12, md: 6 }} key={`ex-more-${String(i)}`}>
                  <Skeleton variant="rounded" height={428} sx={{ borderRadius: 5 }} animation="wave" />
                </Grid>
              ))
            : null}
        </Grid>
        </>
      )}

      {!exploreLoading && !exploreError && explorePosts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nothing matched that search yet. Adjust keywords or signal.
        </Typography>
      ) : null}
    </PageShell>
  );
}
