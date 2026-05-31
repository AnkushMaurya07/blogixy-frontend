import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRemoveAlt1RoundedIcon from '@mui/icons-material/PersonRemoveAlt1Rounded';
import BookmarkAddedRoundedIcon from '@mui/icons-material/BookmarkAddedRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import {
  useFavoriteBlogs,
  useProfile,
  useToggleFavorite,
  useToggleFollow,
  useToggleLike,
  useUpdateProfile,
  useUserBlogs,
  useUserDetail,
  useUsernameAvailability,
} from '../api/hooks';
import { userAvatarUrl } from '../api/mediaUrl';
import type { BlogPost, FavoriteEntry, UserProfile } from '../api/types';

import FeedPost from '../components/FeedPost';
import PageShell from '../components/PageShell';
import { useAppSelector } from '../features/auth/hooks';

function formatProfileUpdateError(err: unknown): string {
  const res =
    err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { status?: number; data?: unknown } }).response
      : undefined;
  if (!res?.data) {
    return err instanceof Error && err.message ? err.message : 'Could not update profile.';
  }
  const d = res.data;
  if (typeof d === 'string') return d;
  if (typeof d === 'object' && d !== null) {
    const o = d as Record<string, unknown>;
    if (typeof o.detail === 'string' && o.detail) return o.detail;
    if (Array.isArray(o.detail) && o.detail.length) {
      const first = o.detail[0];
      if (typeof first === 'string') return first;
    }
    for (const v of Object.values(o)) {
      if (Array.isArray(v) && v.length && typeof v[0] === 'string') return v[0];
      if (typeof v === 'string' && v) return v;
    }
  }
  return 'Could not update profile.';
}

function ProfileFeedSkeleton() {
  const theme = useTheme();
  return (
    <Stack spacing={0}>
      {[0, 1, 2].map((i) => (
        <Stack
          key={i}
          spacing={1.5}
          sx={{
            flexDirection: 'row',
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }}
        >
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="35%" height={18} sx={{ mb: 1 }} />
            <Skeleton width="75%" height={22} sx={{ mb: 0.5 }} />
            <Skeleton width="100%" height={16} />
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2, mt: 1.5 }} />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export default function ProfilePage() {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  const { userId } = useParams();
  const token = useAppSelector((s) => s.auth.accessToken);

  const [profileTab, setProfileTab] = useState<'posts' | 'saved'>('posts');
  const [usernameDraft, setUsernameDraft] = useState('');
  const [titleDraft, setTitleDraft] = useState('');
  const [bioDraft, setBioDraft] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const selfQuery = useProfile();
  const otherQuery = useUserDetail(userId ? Number(userId) : undefined);

  const viewingOther = Boolean(userId);
  const profile = (viewingOther ? otherQuery.data : selfQuery.data) as UserProfile | undefined;
  const isLoadingProfile = viewingOther ? otherQuery.isLoading : selfQuery.isLoading;

  const blogsQuery = useUserBlogs(profile?.id);
  const favoritesQuery = useFavoriteBlogs();
  const toggleLike = useToggleLike();
  const toggleFavorite = useToggleFavorite();
  const toggleFollow = useToggleFollow();
  const updateProfile = useUpdateProfile();

  const nameCheck = useUsernameAvailability(usernameDraft, profile?.username ?? '');

  const likeIfAuth = token ? (blog: BlogPost) => toggleLike.mutateAsync(blog.slug) : undefined;
  const favoriteIfAuth = token ? (blog: BlogPost) => toggleFavorite.mutateAsync(blog.slug) : undefined;

  const posts = blogsQuery.data ?? [];
  const savedEntries = (favoritesQuery.data ?? []) as FavoriteEntry[];
  const isFollowing = Boolean(viewingOther && profile?.is_following);

  useEffect(() => {
    if (profile && !viewingOther) {
      setUsernameDraft(profile.username);
      setTitleDraft(profile.profile_title ?? '');
      setBioDraft(profile.bio ?? '');
    }
  }, [profile?.id, profile?.username, profile?.profile_title, profile?.bio, viewingOther]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const usernameTrimmed = usernameDraft.trim();
  const usernameUnchanged = profile ? usernameTrimmed === profile.username : true;
  const usernameChecking = !usernameUnchanged && nameCheck.isFetching;
  const usernameTaken = !usernameUnchanged && nameCheck.data?.available === false;
  const usernameValid = usernameUnchanged || nameCheck.data?.available === true;
  const canSaveProfile =
    Boolean(profile) &&
    !viewingOther &&
    usernameTrimmed.length > 0 &&
    usernameValid &&
    !usernameChecking &&
    !updateProfile.isPending;

  const avatarSrc =
    avatarPreviewUrl ||
    (profile
      ? userAvatarUrl(
          { id: profile.id, username: profile.username, avatar: profile.avatar ?? null },
          176,
        )
      : undefined);

  if (isLoadingProfile && !profile) {
    return (
      <PageShell>
        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4 }}>
          <Stack spacing={2} sx={{ flexDirection: 'row', alignItems: 'center' }}>
            <Skeleton variant="circular" width={88} height={88} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="50%" height={32} />
              <Skeleton width="30%" height={20} sx={{ mt: 1 }} />
            </Box>
          </Stack>
        </Paper>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <Typography>{viewingOther ? 'Profile not found.' : 'Could not load profile.'}</Typography>
      </PageShell>
    );
  }

  const handleSaveProfile = async () => {
    if (!canSaveProfile || !profile) return;
    // eslint-disable-next-line no-console -- intentional debug trace
    console.log('[ProfilePage] saveProfile start', {
      userId: profile.id,
      username: usernameTrimmed,
      hasNewAvatar: Boolean(avatarFile),
    });
    try {
      await updateProfile.mutateAsync({
        username: usernameTrimmed,
        profile_title: titleDraft,
        bio: bioDraft,
        avatar: avatarFile ?? undefined,
      });
      setAvatarFile(null);
      // eslint-disable-next-line no-console -- intentional debug trace
      console.log('[ProfilePage] saveProfile success');
      enqueueSnackbar('Profile updated.', { variant: 'success' });
    } catch (err: unknown) {
      // eslint-disable-next-line no-console -- intentional debug trace
      console.error('[ProfilePage] saveProfile failed', err, formatProfileUpdateError(err));
      enqueueSnackbar(formatProfileUpdateError(err), { variant: 'error' });
    }
  };

  return (
    <PageShell>
      <Stack spacing={2.5}>
        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, overflow: 'hidden' }}>
          <Stack spacing={2} sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' } }}>
            <Box sx={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 88,
                  height: 88,
                  fontSize: '2rem',
                  fontWeight: 800,
                  border: `3px solid ${alpha(theme.palette.divider, 0.2)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
              >
                {profile.username.slice(0, 1).toUpperCase()}
              </Avatar>
              {!viewingOther ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setAvatarFile(f);
                      e.target.value = '';
                    }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Change profile picture"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: 'absolute',
                      right: -4,
                      bottom: -4,
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      boxShadow: 2,
                    }}
                  >
                    <CameraAltRoundedIcon fontSize="small" />
                  </IconButton>
                </>
              ) : null}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                @{profile.username}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                {profile.profile_title || 'Blogixy member'}
              </Typography>
            </Box>
            {viewingOther && token && profile.id && selfQuery.data?.id !== profile.id ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}>
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  startIcon={isFollowing ? <PersonRemoveAlt1RoundedIcon /> : <PersonAddAlt1RoundedIcon />}
                  disabled={toggleFollow.isPending}
                  onClick={() => {
                    toggleFollow.mutate(profile.id, {
                      onSuccess: (data) => {
                        enqueueSnackbar(data.following ? 'Following this user.' : 'Unfollowed.', {
                          variant: 'success',
                        });
                      },
                      onError: () => {
                        enqueueSnackbar('Could not update follow status.', { variant: 'error' });
                      },
                    });
                  }}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {toggleFollow.isPending ? 'Updating…' : isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
                <Button
                  component={RouterLink}
                  to={`/messages?with=${profile.id}`}
                  variant="outlined"
                  startIcon={<ChatRoundedIcon />}
                >
                  Message
                </Button>
              </Stack>
            ) : null}
          </Stack>
          <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <Chip label={profile.role} color="primary" variant="outlined" />
            {profile.email && !viewingOther ? (
              <Chip label={profile.email} variant="outlined" size="small" />
            ) : null}
          </Stack>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7 }}>
            {profile.bio || 'No bio yet.'}
          </Typography>
        </Paper>

        {!viewingOther ? (
          <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Edit profile
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={usernameDraft}
                onChange={(e) => setUsernameDraft(e.target.value)}
                autoComplete="username"
                fullWidth
                variant="filled"
                error={usernameTaken}
                helperText={
                  usernameTaken
                    ? 'That username is already taken.'
                    : usernameChecking
                      ? 'Checking availability…'
                      : usernameUnchanged
                        ? 'Your current username'
                        : usernameValid
                          ? 'Username is available'
                          : ' '
                }
              />
              <TextField
                label="Profile title"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                fullWidth
                variant="filled"
              />
              <TextField
                label="Bio"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                fullWidth
                multiline
                minRows={3}
                variant="filled"
              />
              <Button variant="contained" disabled={!canSaveProfile} onClick={() => void handleSaveProfile()}>
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </Stack>
          </Paper>
        ) : null}

        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 0, sm: 3 },
            overflow: 'hidden',
            border: { sm: `1px solid ${alpha(theme.palette.divider, 0.14)}` },
            mx: { xs: -2.5, sm: 0 },
          }}
        >
          {!viewingOther ? (
            <Tabs
              value={profileTab}
              onChange={(_, v) => setProfileTab(v)}
              variant="fullWidth"
              sx={{
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                '& .MuiTab-root': { minHeight: 48, fontWeight: 700 },
              }}
            >
              <Tab value="posts" icon={<ArticleOutlinedIcon />} iconPosition="start" label="Posts" />
              <Tab value="saved" icon={<BookmarkAddedRoundedIcon />} iconPosition="start" label="Saved" />
            </Tabs>
          ) : (
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.95),
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Posts
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Everything @{profile.username} shared
              </Typography>
            </Box>
          )}

          {(viewingOther || profileTab === 'posts') && (
            <>
              {!viewingOther ? (
                <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                  <Typography variant="caption" color="text.secondary">
                    Your published and draft posts (drafts only visible to you)
                  </Typography>
                </Box>
              ) : null}
              {blogsQuery.isLoading ? (
                <ProfileFeedSkeleton />
              ) : posts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                  No posts yet.
                </Typography>
              ) : (
                posts.map((blog: BlogPost, i: number) => (
                  <FeedPost
                    key={blog.id}
                    blog={blog}
                    onLikeToggle={likeIfAuth ? () => likeIfAuth(blog) : undefined}
                    onFavoriteToggle={favoriteIfAuth ? () => favoriteIfAuth(blog) : undefined}
                    showDivider={i < posts.length - 1}
                  />
                ))
              )}
            </>
          )}

          {!viewingOther && profileTab === 'saved' && (
            <>
              {favoritesQuery.isLoading ? (
                <ProfileFeedSkeleton />
              ) : savedEntries.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                  No saved posts yet. Bookmark posts from your feed or explore to find them here.
                </Typography>
              ) : (
                savedEntries.map((entry: FavoriteEntry, i: number) => {
                  const blog = { ...entry.blog, is_favorited: true };
                  return (
                    <FeedPost
                      key={entry.blog.id}
                      blog={blog}
                      onLikeToggle={likeIfAuth ? () => likeIfAuth(blog) : undefined}
                      onFavoriteToggle={favoriteIfAuth ? () => favoriteIfAuth(blog) : undefined}
                      showDivider={i < savedEntries.length - 1}
                    />
                  );
                })
              )}
            </>
          )}
        </Paper>
      </Stack>
    </PageShell>
  );
}
