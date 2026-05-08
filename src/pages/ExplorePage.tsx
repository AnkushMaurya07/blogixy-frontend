import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ModeCommentRoundedIcon from '@mui/icons-material/ModeCommentRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
  type Theme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import BlogCommentsPanel from '../components/BlogCommentsPanel';
import PageShell from '../components/PageShell';
import { useExploreBlogs, useToggleLike } from '../api/hooks';
import type { BlogPost } from '../api/types';
import { useAppSelector } from '../features/auth/hooks';
import { useDebouncedValue } from '../utils/useDebouncedValue';
import { useThrottleFn } from '../utils/useThrottleFn';

export default function ExplorePage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 320);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'ranking'>('ranking');
  const token = useAppSelector((s) => s.auth.accessToken);

  const { data, isLoading, refetch, isFetching } = useExploreBlogs({ search, sort });
  const toggleLike = useToggleLike();

  const onSortChange = (e: SelectChangeEvent<'ranking' | 'latest'>) => {
    setSort(e.target.value as 'ranking' | 'latest');
  };

  const applySearch = useThrottleFn(() => {
    setSearch(debouncedSearch);
  }, 350);

  useEffect(() => {
    applySearch();
  }, [applySearch, debouncedSearch]);

  return (
    <PageShell>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Explore galaxy of posts
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Search by keyword, rank by freshness or engagement. Category filters landing soon.
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
              <InputLabel id="explore-sort">Signal</InputLabel>
              <Select variant="filled" labelId="explore-sort" value={sort} label="Signal" onChange={onSortChange}>
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

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={`ex-${String(i)}`}>
              <Skeleton variant="rounded" height={428} sx={{ borderRadius: 5 }} animation="wave" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {(data as BlogPost[] | undefined)?.map((blog: BlogPost, idx: number) => (
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
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 72 }}>
                      {blog.content.slice(0, 220)}{blog.content.length > 220 ? '…' : ''}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', '& .MuiChip-root': { borderRadius: 2 } }}>
                    <Chip size="medium" variant="filled" icon={<InsightsRoundedIcon fontSize="inherit" />} label={`${blog.view_count} views`} />
                    <Chip variant="filled" icon={<FavoriteBorderRoundedIcon />} label={`${blog.likes_count} likes`} />
                    <Chip variant="filled" icon={<ModeCommentRoundedIcon />} label={`${blog.comments_count} comments`} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    By @{blog.author_name}
                  </Typography>
                  <Button
                    sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                    variant="outlined"
                    endIcon={<FavoriteBorderRoundedIcon />}
                    disabled={!token}
                    onClick={async () => {
                      if (!token) {
                        return;
                      }
                      await toggleLike.mutateAsync(blog.slug);
                      refetch();
                    }}
                  >
                    Toggle applause
                  </Button>
                  <Button component={Link} to={`/blogs/${blog.slug}`} variant="text" size="small" sx={{ px: 0 }}>
                    Open full blog
                  </Button>
                  <BlogCommentsPanel slug={blog.slug} />
                </Paper>
              </motion.article>
            </Grid>
          ))}
        </Grid>
      )}
    </PageShell>
  );
}
