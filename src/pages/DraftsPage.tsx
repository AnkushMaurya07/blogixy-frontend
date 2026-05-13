import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useMyDrafts, useUpdateBlog } from '../api/hooks';
import type { BlogPost } from '../api/types';
import PageShell from '../components/PageShell';

export default function DraftsPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const draftsQuery = useMyDrafts();
  const updateBlog = useUpdateBlog();

  const rows = draftsQuery.data?.results ?? [];
  const [editOpen, setEditOpen] = useState(false);
  const [active, setActive] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!editOpen || !active) return;
    setTitle(active.title);
    setContent(active.content);
  }, [editOpen, active]);

  const openEdit = (blog: BlogPost) => {
    setActive(blog);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setActive(null);
  };

  const save = async (publish: boolean) => {
    if (!active) return;
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) {
      enqueueSnackbar('Title and body are required.', { variant: 'warning' });
      return;
    }
    try {
      await updateBlog.mutateAsync({
        slug: active.slug,
        title: t,
        content: c,
        is_published: publish,
      });
      enqueueSnackbar(publish ? 'Published successfully.' : 'Draft saved.', { variant: 'success' });
      closeEdit();
    } catch {
      enqueueSnackbar('Could not save changes.', { variant: 'error' });
    }
  };

  return (
    <PageShell>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: '0.12em', fontWeight: 780 }}>
          Your workspace
        </Typography>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 850 }}>
          Draft posts
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
          Unpublished posts you have saved. Open one to edit, keep it as a draft, or publish when it is ready.
        </Typography>
      </Stack>

      {draftsQuery.isLoading ? (
        <Stack spacing={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            No drafts yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Save a post without &quot;Publish immediately&quot; from the create dialog, and it will show up here.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Back to home
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {rows.map((blog) => (
            <Paper
              key={blog.id}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { sm: 'flex-start' },
                justifyContent: 'space-between',
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {blog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, mb: 1 }} noWrap>
                  {blog.content.slice(0, 160)}
                  {blog.content.length > 160 ? '…' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated {blog.updated_at ? new Date(blog.updated_at).toLocaleString() : '—'}
                </Typography>
              </Box>
              <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} sx={{ flexShrink: 0 }}>
                <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => openEdit(blog)}>
                  Edit
                </Button>
                <Button component={RouterLink} to={`/blogs/${blog.slug}`} variant="text" size="small">
                  Preview
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={editOpen} onClose={() => !updateBlog.isPending && closeEdit()} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>Edit draft</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField label="Title" fullWidth variant="filled" value={title} onChange={(e) => setTitle(e.target.value)} disabled={updateBlog.isPending} />
            <TextField
              label="Body"
              fullWidth
              multiline
              minRows={8}
              variant="filled"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={updateBlog.isPending}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={closeEdit} disabled={updateBlog.isPending} color="inherit">
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveRoundedIcon />}
            disabled={updateBlog.isPending}
            onClick={() => void save(false)}
          >
            Save draft
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishRoundedIcon />}
            disabled={updateBlog.isPending}
            onClick={() => void save(true)}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
