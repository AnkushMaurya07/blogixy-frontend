import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ModeCommentRoundedIcon from '@mui/icons-material/ModeCommentRounded';
import { Box, Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

import { blogCoverImageUrl } from '../api/mediaUrl';
import type { BlogPost } from '../api/types';

type BlogCardProps = {
  blog: BlogPost;
  onLikeToggle?: () => void;
};

export default function BlogCard({ blog, onLikeToggle }: BlogCardProps) {
  const theme = useTheme();
  const cover = blogCoverImageUrl(blog, { width: 800, height: 450 });

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${alpha(theme.palette.divider ?? theme.palette.text.primary, 0.06)}`,
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 12px 50px rgba(23,52,117,0.08)'
              : '0 18px 64px rgba(1, 5, 10, 0.6)',
          overflow: 'hidden',
          backgroundImage:
            theme.palette.mode === 'light'
              ? 'linear-gradient(160deg,#ffffff,#f9fbfe)'
              : 'linear-gradient(170deg,#151c2b,#141b29)',
        }}
      >
        <Box
          sx={{
            lineHeight: 0,
            maxHeight: 220,
            overflow: 'hidden',
            borderBottom: `1px solid ${alpha(theme.palette.divider ?? '#000', 0.08)}`,
          }}
        >
          <Box
            component="img"
            loading="lazy"
            decoding="async"
            src={cover}
            alt=""
            sx={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, pt: 2.5, pb: 1 }}>
          <Stack spacing={1.75}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography component="h3" variant="h6">
                <Box
                  component={RouterLink}
                  to={`/blogs/${blog.slug}`}
                  sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
                >
                  {blog.title}
                </Box>
              </Typography>
              <Chip
                size="small"
                label={blog.is_published ? 'Public' : 'Draft'}
                sx={{ flexShrink: 0 }}
                variant="outlined"
              />
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '5.75rem',
              }}
            >
              {blog.content}
            </Typography>
            <Button component={RouterLink} to={`/blogs/${blog.slug}`} size="small" sx={{ alignSelf: 'flex-start', px: 0 }}>
              Read full post
            </Button>
            <Stack direction="row" spacing={2} sx={{ '& .MuiChip-root': { borderRadius: 2 } }}>
              <Chip variant="filled" icon={<InsightsRoundedIcon fontSize="inherit" />} label={`${blog.view_count} views`} />
              <Chip variant="filled" icon={<FavoriteBorderRoundedIcon fontSize="inherit" />} label={`${blog.likes_count} likes`} />
              <Chip variant="filled" icon={<ModeCommentRoundedIcon fontSize="inherit" />} label={`${blog.comments_count}`} />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              @{blog.author_name}
            </Typography>
          </Stack>
        </CardContent>
        {onLikeToggle ? (
          <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
            <Button
              variant="outlined"
              size="medium"
              fullWidth
              color="secondary"
              endIcon={<FavoriteBorderRoundedIcon />}
              onClick={() => onLikeToggle()}
            >
              Like or unlike
            </Button>
          </CardActions>
        ) : (
          <Box sx={{ height: theme.spacing(1) }} />
        )}
      </Card>
    </motion.article>
  );
}
