import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Avatar, Box, ButtonBase, IconButton, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { firstBlogImageUrl, userAvatarUrl } from '../api/mediaUrl';
import type { BlogPost } from '../api/types';

function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = Date.now();
  const diffSec = (now - d.getTime()) / 1000;
  if (diffSec < 45) return 'now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type FeedPostProps = {
  blog: BlogPost;
  onLikeToggle?: () => void;
  onFavoriteToggle?: () => void;
  /** Show bottom divider (set false on last item in a list) */
  showDivider?: boolean;
};

export default function FeedPost({ blog, onLikeToggle, onFavoriteToggle, showDivider = true }: FeedPostProps) {
  const theme = useTheme();
  const [likeBurst, setLikeBurst] = useState(false);
  const [liked, setLiked] = useState(Boolean(blog.is_liked));
  const [favorited, setFavorited] = useState(Boolean(blog.is_favorited));
  useEffect(() => {
    setLiked(Boolean(blog.is_liked));
  }, [blog.id, blog.is_liked]);
  useEffect(() => {
    setFavorited(Boolean(blog.is_favorited));
  }, [blog.id, blog.is_favorited]);
  const imageSrc = firstBlogImageUrl(blog.media_items);
  const hasMedia = Boolean(imageSrc);
  const relative = formatRelativeTime(blog.created_at);
  const avatarSrc = userAvatarUrl({
    id: blog.author,
    username: blog.author_name,
    avatar: blog.author_avatar ?? null,
  }, 96);

  const handleLike = () => {
    if (!onLikeToggle) return;
    setLiked((v) => !v);
    setLikeBurst(true);
    window.setTimeout(() => setLikeBurst(false), 420);
    void onLikeToggle();
  };

  const handleFavorite = () => {
    if (!onFavoriteToggle) return;
    setFavorited((v) => !v);
    onFavoriteToggle();
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.75, sm: 2 },
          borderRadius: 0,
          border: 'none',
          borderBottom: showDivider ? `1px solid ${alpha(theme.palette.divider, 0.12)}` : 'none',
          backgroundImage: 'none',
          transition: 'background-color 0.18s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.035 : 0.065),
          },
        }}
      >
        <Stack spacing={1.5} sx={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Avatar
            component={RouterLink}
            to={`/users/${blog.author}`}
            src={avatarSrc}
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              textDecoration: 'none',
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.primary.main,
              border: `2px solid ${alpha(theme.palette.background.paper, 0.9)}`,
              boxShadow: `0 0 0 1px ${alpha(theme.palette.divider, 0.4)}`,
              '&:hover': { opacity: 0.92 },
            }}
          >
            {blog.author_name?.slice(0, 1).toUpperCase() ?? '?'}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack spacing={0.75} sx={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', mb: 0.25 }}>
              <Typography
                component={RouterLink}
                to={`/users/${blog.author}`}
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                @{blog.author_name ?? 'author'}
              </Typography>
              {relative ? (
                <Typography variant="caption" color="text.secondary" component="span">
                  · {relative}
                </Typography>
              ) : null}
              {!blog.is_published ? (
                <Typography
                  variant="caption"
                  sx={{
                    px: 0.75,
                    py: 0.1,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.warning.main, 0.18),
                    color: 'warning.main',
                    fontWeight: 600,
                  }}
                >
                  Draft
                </Typography>
              ) : null}
            </Stack>

            <Typography
              component={RouterLink}
              to={`/blogs/${blog.slug}`}
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                fontSize: theme.typography.pxToRem(17),
                color: 'text.primary',
                textDecoration: 'none',
                display: 'block',
                mb: 0.75,
                letterSpacing: '-0.03em',
                lineHeight: 1.35,
                pl: 1.25,
                borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.55)}`,
                '&:hover': {
                  color: 'primary.main',
                  borderLeftColor: theme.palette.primary.main,
                },
              }}
            >
              {blog.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.55,
                mb: 1.25,
              }}
            >
              {blog.content}
            </Typography>

            {hasMedia ? (
              <RouterLink to={`/blogs/${blog.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
                    maxHeight: { xs: 280, sm: 360 },
                    bgcolor: alpha(theme.palette.common.black, theme.palette.mode === 'light' ? 0.04 : 0.25),
                  }}
                >
                  <Box
                    component="img"
                    loading="lazy"
                    decoding="async"
                    src={imageSrc}
                    alt=""
                    sx={{
                      width: '100%',
                      display: 'block',
                      objectFit: 'cover',
                      maxHeight: { xs: 280, sm: 360 },
                    }}
                  />
                </Box>
              </RouterLink>
            ) : null}

            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              sx={{
                flexWrap: 'wrap',
                alignItems: 'center',
                mt: '20px',
                pt: '12px',
                rowGap: 1,
              }}
            >
              <ButtonBase
                component={RouterLink}
                to={`/blogs/${blog.slug}`}
                aria-label={`Open post — ${blog.comments_count} comments`}
                sx={{
                  display: 'inline-flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 0.75,
                  borderRadius: 99,
                  px: 1,
                  py: 0.5,
                  color: 'text.secondary',
                  textDecoration: 'none',
                  font: 'inherit',
                  verticalAlign: 'middle',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
                }}
              >
                <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 20, display: 'block' }} />
                <Typography component="span" variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  {blog.comments_count}
                </Typography>
              </ButtonBase>

              <Box
                sx={{
                  display: 'inline-flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 0.75,
                  color: 'text.secondary',
                  pl: 0.25,
                  minHeight: 34,
                }}
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 20, display: 'block' }} />
                <Typography variant="body2" component="span" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  {blog.view_count}
                </Typography>
              </Box>

              <Box sx={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 0.25 }}>
                <IconButton
                  size="small"
                  onClick={handleLike}
                  disabled={!onLikeToggle}
                  aria-label={liked ? 'Unlike post' : 'Like post'}
                  sx={{
                    borderRadius: 99,
                    color: liked || likeBurst ? 'error.main' : 'text.secondary',
                    transition: 'transform 0.2s ease',
                    transform: likeBurst ? 'scale(1.15)' : 'scale(1)',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: 'error.main',
                    },
                  }}
                >
                  {liked || likeBurst ? (
                    <FavoriteRoundedIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <FavoriteBorderRoundedIcon sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
                <Typography variant="body2" component="span" sx={{ fontWeight: 650, color: 'text.secondary', minWidth: 20, lineHeight: 1 }}>
                  {blog.likes_count}
                </Typography>
              </Box>

              {onFavoriteToggle ? (
                <IconButton
                  size="small"
                  onClick={handleFavorite}
                  aria-label={favorited ? 'Remove from favourites' : 'Add to favourites'}
                  sx={{
                    borderRadius: 99,
                    color: favorited ? 'primary.main' : 'text.secondary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                    },
                  }}
                >
                  {favorited ? (
                    <BookmarkAddedRoundedIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <BookmarkBorderRoundedIcon sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </motion.article>
  );
}
