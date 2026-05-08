import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import { useProfile, useUserDetail } from '../api/hooks';
import PageShell from '../components/PageShell';

export default function ProfilePage() {
  const { userId } = useParams();
  const selfQuery = useProfile();
  const otherQuery = useUserDetail(userId ? Number(userId) : undefined);

  const profile = (userId ? otherQuery.data : selfQuery.data) as {
    id: number;
    username: string;
    role: string;
    profile_title?: string;
    bio?: string;
    email?: string;
  } | undefined;

  if (!profile) {
    return <PageShell><Typography>{(userId ? otherQuery : selfQuery).isLoading ? 'Loading profile...' : 'Profile not found.'}</Typography></PageShell>;
  }

  return (
    <PageShell>
      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4 }}>
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64 }}>{profile.username.slice(0, 1).toUpperCase()}</Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>@{profile.username}</Typography>
              <Typography color="text.secondary">{profile.profile_title || 'BlogXy member'}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip label={profile.role} color="primary" variant="outlined" />
            {profile.email ? <Chip label={profile.email} variant="outlined" /> : null}
          </Stack>
          <Typography variant="body1">{profile.bio || 'No bio provided yet.'}</Typography>
        </Stack>
      </Paper>
    </PageShell>
  );
}
