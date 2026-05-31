import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRemoveAlt1RoundedIcon from '@mui/icons-material/PersonRemoveAlt1Rounded';
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
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import {
  useCreateComment,
  useCreateShareLink,
  useProfile,
  useSendBlogToUsers,
  useToggleFavorite,
  useToggleFollow,
  useToggleLike,
  useUserDetail,
} from '../api/hooks';
import { absoluteMediaUrl, userAvatarUrl } from '../api/mediaUrl';
import type { BlogPost, UserProfile } from '../api/types';
import PageShell from '../components/PageShell';
import { useAppSelector } from '../features/auth/hooks';
import { apiClient } from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { blogPublicUrl, copyToClipboard } from '../utils/clipboard';

export default function BlogDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [shareContent, setShareContent] = useState('Thought you might like this.');
  const [receiverId, setReceiverId] = useState<number | ''>('');
  const [commentInput, setCommentInput] = useState('');
  const [liked, setLiked] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

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

  const selfQuery = useProfile();
  const blog = blogQuery.data as BlogPost | undefined;
  const selfProfile = selfQuery.data as UserProfile | undefined;
  const viewingOwnPost = Boolean(blog && selfProfile && blog.author === selfProfile.id);
  const authorQuery = useUserDetail(
    token && blog?.author && !viewingOwnPost ? blog.author : undefined,
  );

  const createShare = useCreateShareLink();
  const sendBlog = useSendBlogToUsers();
  const toggleLike = useToggleLike();
  const toggleFavorite = useToggleFavorite();
  const toggleFollow = useToggleFollow();
  const createComment = useCreateComment(slug);

  const comments = (commentsQuery.data as { id: number; user_name: string; content: string }[] | undefined) ?? [];

  useEffect(() => {
    setLiked(Boolean(blog?.is_liked));
  }, [blog?.id, blog?.is_liked]);

  useEffect(() => {
    if (authorQuery.data) {
      setIsFollowingAuthor(Boolean(authorQuery.data.is_following));
    }
  }, [authorQuery.data?.id, authorQuery.data?.is_following]);

  const mediaItems = useMemo(() => blog?.media_items?.map((item) => ({ ...item, abs: absoluteMediaUrl(item.file) })) ?? [], [blog]);
  const hasImageMedia = Boolean(blog?.media_items?.some((m) => m.media_type === 'image'));
  const firstVideoHero = mediaItems.find((m) => m.media_type === 'video');

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
      <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 4 }}>
        {!hasImageMedia && firstVideoHero ? (
          <Box
            component="video"
            controls
            playsInline
            preload="metadata"
            src={firstVideoHero.abs}
            sx={{
              width: '100%',
              display: 'block',
              maxHeight: { xs: 280, sm: 360 },
              objectFit: 'cover',
              bgcolor: 'common.black',
            }}
          />
        ) : null}
        <Stack spacing={2} sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              rowGap: 1,
            }}
          >
            <Avatar
              component={RouterLink}
              to={`/users/${blog.author}`}
              src={userAvatarUrl(
                { id: blog.author, username: blog.author_name, avatar: blog.author_avatar ?? null },
                128,
              )}
              sx={{
                width: 48,
                height: 48,
                textDecoration: 'none',
                fontWeight: 700,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { opacity: 0.92 },
              }}
            >
              {blog.author_name.slice(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                component={RouterLink}
                to={`/users/${blog.author}`}
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: 'text.primary',
                  display: 'inline-block',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                @{blog.author_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Published {blog.created_at ? new Date(blog.created_at).toLocaleString() : 'recently'}
              </Typography>
            </Box>
            {token && !viewingOwnPost ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
                <Button
                  variant={isFollowingAuthor ? 'outlined' : 'contained'}
                  size="small"
                  startIcon={isFollowingAuthor ? <PersonRemoveAlt1RoundedIcon /> : <PersonAddAlt1RoundedIcon />}
                  disabled={toggleFollow.isPending}
                  onClick={() => {
                    toggleFollow.mutate(blog.author, {
                      onSuccess: (data) => {
                        setIsFollowingAuthor(Boolean(data.following));
                        enqueueSnackbar(data.following ? 'Following this user.' : 'Unfollowed.', {
                          variant: 'success',
                        });
                      },
                      onError: () => {
                        enqueueSnackbar('Could not update follow status.', { variant: 'error' });
                      },
                    });
                  }}
                  sx={{ textTransform: 'none', fontWeight: 650 }}
                >
                  {toggleFollow.isPending ? 'Updating…' : isFollowingAuthor ? 'Unfollow' : 'Follow'}
                </Button>
                <Button
                  component={RouterLink}
                  to={`/users/${blog.author}`}
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: 'none', fontWeight: 650 }}
                >
                  View profile
                </Button>
              </Stack>
            ) : null}
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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color={liked ? 'error' : 'primary'}
              startIcon={liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
              disabled={!token}
              onClick={() => {
                setLiked((v) => !v);
                toggleLike.mutate(slug);
              }}
            >
              {liked ? 'Liked' : 'Like'}
            </Button>
            <Button
              variant="outlined"
              disabled={!token}
              startIcon={blog.is_favorited ? <BookmarkAddedRoundedIcon /> : <BookmarkBorderRoundedIcon />}
              onClick={() => toggleFavorite.mutate(slug)}
            >
              {blog.is_favorited ? 'Saved' : 'Save to favourites'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareRoundedIcon />}
              disabled={createShare.isPending}
              onClick={async () => {
                const url = blogPublicUrl(slug);
                try {
                  if (token) {
                    await createShare.mutateAsync(slug).catch(() => undefined);
                  }
                  await copyToClipboard(url);
                  enqueueSnackbar('Link copied to clipboard.', { variant: 'success' });
                } catch {
                  enqueueSnackbar('Could not copy link. Try again.', { variant: 'error' });
                }
              }}
            >
              Copy share link
            </Button>
          </Stack>

          {token && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                Send to a friend/followed user
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { xs: 'stretch', sm: 'flex-end' } }}
              >
                <TextField
                  select
                  label="User"
                  value={receiverId}
                  onChange={(e) => setReceiverId(Number(e.target.value))}
                  sx={{ width: { xs: '100%', sm: 220 }, flexShrink: 0 }}
                >
                  <MenuItem value="">Choose user</MenuItem>
                  {((usersQuery.data as { id: number; username: string }[] | undefined) ?? []).map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Message"
                  value={shareContent}
                  onChange={(e) => setShareContent(e.target.value)}
                  sx={{ flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}
                />
                <Button
                  variant="contained"
                  startIcon={<SendRoundedIcon />}
                  disabled={!receiverId || sendBlog.isPending}
                  onClick={() => {
                    if (!receiverId) return;
                    sendBlog.mutate(
                      { slug, receiver_ids: [Number(receiverId)], content: shareContent },
                      {
                        onSuccess: () => {
                          enqueueSnackbar('Post sent.', { variant: 'success' });
                          setReceiverId('');
                        },
                        onError: () => {
                          enqueueSnackbar('Could not send post. Try again.', { variant: 'error' });
                        },
                      },
                    );
                  }}
                  sx={{
                    flexShrink: 0,
                    alignSelf: { xs: 'stretch', sm: 'auto' },
                    minWidth: { sm: 132 },
                    height: 56,
                    px: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    '& .MuiButton-startIcon': { mr: 1 },
                  }}
                >
                  {sendBlog.isPending ? 'Sending…' : 'Send'}
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
