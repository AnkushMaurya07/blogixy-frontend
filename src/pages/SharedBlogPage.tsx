import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import { useSharedBlog } from '../api/hooks';
import { absoluteMediaUrl, userAvatarUrl } from '../api/mediaUrl';
import type { BlogPost } from '../api/types';
import PageShell from '../components/PageShell';
import { copyToClipboard, sharedBlogPublicUrl } from '../utils/clipboard';

export default function SharedBlogPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const blogQuery = useSharedBlog(token);
  const blog = blogQuery.data as BlogPost | undefined;
  const mediaItems = blog?.media_items
    ?.filter((item) => item.media_type === 'image')
    .map((item) => ({ ...item, abs: absoluteMediaUrl(item.file) }))
    .filter((item) => item.abs) ?? [];

  if (blogQuery.isLoading) {
    return (
      <PageShell>
        <Typography color="text.secondary">Loading shared post...</Typography>
      </PageShell>
    );
  }

  if (blogQuery.isError || !blog) {
    return (
      <PageShell>
        <Stack spacing={2} sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', py: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            This shared post is unavailable
          </Typography>
          <Typography color="text.secondary">
            The link may be invalid, or the post may no longer be public.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained" startIcon={<ArrowBackRoundedIcon />}>
            Go to Blogixy
          </Button>
        </Stack>
      </PageShell>
    );
  }

  const copyLink = async () => {
    try {
      await copyToClipboard(sharedBlogPublicUrl(token));
      enqueueSnackbar('Shared link copied.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not copy link. Try again.', { variant: 'error' });
    }
  };

  return (
    <PageShell>
      <Stack spacing={2}>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start' }}>
          Back
        </Button>
        <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 4 }}>
          <Stack spacing={2} sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>
              Shared from Blogixy
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar
                component={RouterLink}
                to={`/users/${blog.author}`}
                src={userAvatarUrl(
                  { id: blog.author, username: blog.author_name, avatar: blog.author_avatar ?? null },
                  128,
                )}
                sx={{ width: 48, height: 48, textDecoration: 'none', fontWeight: 700 }}
              >
                {blog.author_name.slice(0, 1).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography component={RouterLink} to={`/users/${blog.author}`} sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none' }}>
                  @{blog.author_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Published {blog.created_at ? new Date(blog.created_at).toLocaleString() : 'recently'}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
              {blog.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Chip label={`${blog.view_count} views`} />
              <Chip label={`${blog.likes_count} likes`} />
              <Chip label={`${blog.comments_count} comments`} />
            </Stack>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
              {blog.content}
            </Typography>
            {mediaItems.length > 0 ? (
              <Stack spacing={2}>
                {mediaItems.map((media) => (
                  <Box key={media.id} component="img" src={media.abs} loading="lazy" alt="" sx={{ width: '100%', borderRadius: 2 }} />
                ))}
              </Stack>
            ) : null}
            <Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={() => void copyLink()} sx={{ alignSelf: 'flex-start' }}>
              Copy shared link
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </PageShell>
  );
}
