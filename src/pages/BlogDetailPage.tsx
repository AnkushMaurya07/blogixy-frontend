import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useCreateComment, useCreateShareLink, useSendBlogToUsers, useToggleLike } from '../api/hooks';
import { absoluteMediaUrl } from '../api/mediaUrl';
import type { BlogPost } from '../api/types';
import PageShell from '../components/PageShell';
import { useAppSelector } from '../features/auth/hooks';
import { apiClient } from '../api/client';
import { useQuery } from '@tanstack/react-query';

export default function BlogDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [shareContent, setShareContent] = useState('Thought you might like this.');
  const [receiverId, setReceiverId] = useState<number | ''>('');
  const [commentInput, setCommentInput] = useState('');

  const blogQuery = useQuery({
    queryKey: ['blog-detail', slug],
    queryFn: async () => (await apiClient.get(`/blogs/${slug}/`)).data,
    enabled: Boolean(slug),
  });
  const commentsQuery = useQuery({
    queryKey: ['blog-detail-comments', slug],
    queryFn: async () => (await apiClient.get(`/blogs/${slug}/comments/`)).data,
    enabled: Boolean(slug),
  });
  const usersQuery = useQuery({
    queryKey: ['share-users', slug],
    queryFn: async () => (await apiClient.get('/auth/users/')).data,
    enabled: Boolean(token),
  });

  const createShare = useCreateShareLink();
  const sendBlog = useSendBlogToUsers();
  const toggleLike = useToggleLike();
  const createComment = useCreateComment(slug);

  const blog = blogQuery.data as BlogPost | undefined;
  const comments = (commentsQuery.data as { id: number; user_name: string; content: string }[] | undefined) ?? [];

  const mediaItems = useMemo(() => blog?.media_items?.map((item) => ({ ...item, abs: absoluteMediaUrl(item.file) })) ?? [], [blog]);

  if (!blog) {
    return (
      <PageShell>
        <Typography>{blogQuery.isLoading ? 'Loading blog...' : 'Blog not found.'}</Typography>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Button variant="text" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar>{blog.author_name.slice(0, 1).toUpperCase()}</Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>@{blog.author_name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Published {blog.created_at ? new Date(blog.created_at).toLocaleString() : 'recently'}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{blog.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            <Chip label={`${blog.view_count} views`} />
            <Chip label={`${blog.likes_count} likes`} />
            <Chip label={`${blog.comments_count} comments`} />
          </Stack>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{blog.content}</Typography>
          {mediaItems.length > 0 && (
            <Stack spacing={2}>
              {mediaItems.map((media) => (
                <Box key={media.id}>
                  {media.media_type === 'image' ? (
                    <Box component="img" src={media.abs} loading="lazy" alt="blog-media" sx={{ width: '100%', borderRadius: 2 }} />
                  ) : (
                    <Box component="video" controls src={media.abs} sx={{ width: '100%', borderRadius: 2 }} />
                  )}
                </Box>
              ))}
            </Stack>
          )}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <Button variant="outlined" startIcon={<FavoriteBorderRoundedIcon />} disabled={!token} onClick={() => toggleLike.mutate(slug)}>
              Like
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareRoundedIcon />}
              disabled={!token}
              onClick={async () => {
                const link = await createShare.mutateAsync(slug);
                if (link?.public_url) {
                  await navigator.clipboard.writeText(link.public_url);
                }
              }}
            >
              Copy share link
            </Button>
          </Stack>

          {token && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Send to a friend/followed user</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <TextField
                  select
                  fullWidth
                  label="User"
                  value={receiverId}
                  onChange={(e) => setReceiverId(Number(e.target.value))}
                >
                  <MenuItem value="">Choose user</MenuItem>
                  {((usersQuery.data as { id: number; username: string }[] | undefined) ?? []).map((user) => (
                    <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Message"
                  value={shareContent}
                  onChange={(e) => setShareContent(e.target.value)}
                />
                <Button
                  variant="contained"
                  startIcon={<SendRoundedIcon />}
                  onClick={() => {
                    if (!receiverId) return;
                    sendBlog.mutate({ slug, receiver_ids: [Number(receiverId)], content: shareContent });
                  }}
                >
                  Send
                </Button>
              </Stack>
            </Paper>
          )}

          <Divider />
          <Typography variant="h6">Comments</Typography>
          <Stack spacing={1.2}>
            {comments.map((comment) => (
              <Paper key={comment.id} variant="outlined" sx={{ p: 1.25 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>@{comment.user_name}</Typography>
                <Typography variant="body2">{comment.content}</Typography>
              </Paper>
            ))}
          </Stack>
          {token && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField fullWidth label="Write comment" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} />
              <Button
                variant="contained"
                endIcon={<LaunchRoundedIcon />}
                onClick={async () => {
                  if (!commentInput.trim()) return;
                  await createComment.mutateAsync(commentInput.trim());
                  setCommentInput('');
                  commentsQuery.refetch();
                }}
              >
                Post
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </PageShell>
  );
}
