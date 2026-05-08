import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { useAnalytics, useCreateBlog, useCreateShareLink, useUploadBlogMedia } from '../api/hooks';
import PageShell from '../components/PageShell';

export default function DashboardPage() {
  const theme = useTheme();
  const [form, setForm] = useState({ title: '', content: '', is_published: true });
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const createBlogMutation = useCreateBlog();
  const uploadMediaMutation = useUploadBlogMedia();
  const shareMutation = useCreateShareLink();
  const analyticsQuery = useAnalytics();

  const totals = analyticsQuery.data as { total_posts: number; total_views: number; total_likes: number } | undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdBlog = await createBlogMutation.mutateAsync(form);
    if (mediaFile) {
      await uploadMediaMutation.mutateAsync({
        blogId: createdBlog.id,
        file: mediaFile,
        mediaType,
      });
    }
    const share = await shareMutation.mutateAsync(createdBlog.slug);
    setShareUrl(share.public_url);
    setForm({ title: '', content: '', is_published: true });
    setMediaFile(null);
  };

  return (
    <PageShell>
      <Stack spacing={4}>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: 4, fontWeight: 740 }} color="primary.main">
            Author workspace
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 900 }}>
            Operations dashboard — publish, circulate, quantify.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lightweight metrics precede exhaustive GraphQL rollups—we already surface directional truth for author velocity,
            amplification, and reach.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {([
            {
              icon: <CreateRoundedIcon />,
              label: 'My posts published',
              valueKey: 'total_posts' as const,
              subtitle: 'Active inventory',
            },
            {
              icon: <InsightsRoundedIcon />,
              label: 'Audience views captured',
              valueKey: 'total_views' as const,
              subtitle: 'Cumulative glare',
            },
            {
              icon: <FavoriteRoundedIcon />,
              label: 'Likes collected',
              valueKey: 'total_likes' as const,
              subtitle: 'Applause signal',
            },
          ] as const).map((card) => {
            const numeric = totals ? totals[card.valueKey] : undefined;
            return (
              <Grid size={{ xs: 12, md: 4 }} key={card.label}>
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
                  <Paper
                    sx={{
                      p: { xs: 2.75, md: 3 },
                      borderRadius: 4,
                      minHeight: 190,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.75,
                    }}
                  >
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography variant="caption" sx={{ letterSpacing: 1.35, fontWeight: 700 }} color="text.secondary">
                        {card.subtitle}
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {analyticsQuery.isLoading ? '…' : (numeric ?? 0).toLocaleString()}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {card.label}
                    </Typography>
                    <LinearProgress
                      variant={typeof numeric === 'number' ? 'determinate' : 'indeterminate'}
                      value={numeric ? Math.min(100, (numeric % 180) || 62) : 25}
                      sx={{ mt: 'auto', height: 10, borderRadius: 999 }}
                    />
                  </Paper>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Stack direction="row" spacing={2} sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 3, md: 4 }, pb: 2, alignItems: 'center' }}>
                <BoltRoundedIcon color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Editor
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Compose with intent—media payloads route through your CDN plan later.
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Box component="form" onSubmit={submit} sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Title"
                  variant="filled"
                  fullWidth
                  value={form.title}
                  placeholder="Operational clarity or poetic chaos"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <TextField label="Essay body" variant="filled" multiline minRows={6} placeholder="Sharpen with structure…" fullWidth value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                <FormControlLabel
                  label="Immediate publish?"
                  sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', fontWeight: 620 } }}
                  control={
                    <Switch checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                  }
                />
                <TextField
                  select
                  variant="filled"
                  label="Lead media type"
                  helperText={mediaFile ? mediaFile.name : 'Optional — attaches after creation'}
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                >
                  <MenuItem value="image">Image hero</MenuItem>
                  <MenuItem value="video">Video embed</MenuItem>
                </TextField>
                <Button variant="outlined" component="label">
                  Attach media ({mediaType})
                  <input hidden type="file" onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)} />
                </Button>
                <Button variant="contained" size="large" type="submit" startIcon={<CreateRoundedIcon />}>
                  Forge story
                </Button>
              </Box>
              {shareUrl ? (
                <Box sx={(t) => ({ px: { xs: 3, md: 4 }, py: { xs: 2, md: 3 }, bgcolor: alpha(t.palette.success.main, 0.06) })}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Share permalink
                  </Typography>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere', fontFamily: theme.typography.fontFamily }}>
                    <a href={shareUrl}>{shareUrl}</a>
                  </Typography>
                </Box>
              ) : null}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, xl: 4 }}>
            <Paper sx={{ p: 3.5, borderRadius: 4, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 740, mb: 1 }}>
                Graph roadmap
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Dedicated GraphQL façade will expose deeper cohort metrics (cohort retention + surface-level virality)—for now REST
                analytics stay crisp and deterministic.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Upcoming overlays: anomaly detection on engagement spikes & automated digest exports.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </PageShell>
  );
}
