import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useAiGenerateDraft, useCreateBlog, useCreateShareLink, useUploadBlogMedia } from '../api/hooks';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (typeof d.detail === 'string') return d.detail;
      if (Array.isArray(d.detail) && d.detail.length > 0) {
        const first = d.detail[0];
        if (first && typeof first === 'object' && 'msg' in first) return String((first as { msg: unknown }).msg);
      }
      if (typeof d.message === 'string') return d.message;
    }
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Try again.';
}

type CreatePostModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [form, setForm] = useState({ title: '', content: '', is_published: true });
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  const createBlogMutation = useCreateBlog();
  const uploadMediaMutation = useUploadBlogMedia();
  const shareMutation = useCreateShareLink();
  const aiGenerateMutation = useAiGenerateDraft();

  useEffect(() => {
    if (!open) {
      return;
    }
    setForm({ title: '', content: '', is_published: true });
    setMediaType('image');
    setMediaFile(null);
    setAiPrompt('');
  }, [open]);

  const handleClose = () => {
    if (createBlogMutation.isPending || uploadMediaMutation.isPending || shareMutation.isPending) {
      return;
    }
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleTrim = form.title.trim();
    const contentTrim = form.content.trim();
    if (!titleTrim || !contentTrim) {
      enqueueSnackbar('Add a title and body before publishing.', { variant: 'warning' });
      return;
    }

    try {
      const createdBlog = await createBlogMutation.mutateAsync({
        title: titleTrim,
        content: contentTrim,
        is_published: form.is_published,
      });

      if (mediaFile) {
        await uploadMediaMutation.mutateAsync({
          blogId: createdBlog.id,
          file: mediaFile,
          mediaType,
        });
      }

      let shareUrl: string | undefined;
      try {
        const share = await shareMutation.mutateAsync(createdBlog.slug);
        shareUrl = share.public_url as string | undefined;
        if (shareUrl) {
          await navigator.clipboard.writeText(shareUrl).catch(() => {});
        }
      } catch {
        /* share link is optional */
      }

      const published = Boolean(form.is_published);
      const primary =
        published
          ? `Published: “${createdBlog.title}”.`
          : `Draft saved: “${createdBlog.title}”.`;
      const secondary = shareUrl ? ' Share link copied to clipboard.' : '';

      enqueueSnackbar(`${primary}${secondary}`, {
        variant: 'success',
        autoHideDuration: published ? 8000 : 6000,
        action: (key) => (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to={`/blogs/${createdBlog.slug}`}
              color="inherit"
              size="small"
              onClick={() => closeSnackbar(key)}
            >
              View post
            </Button>
            <Button type="button" color="inherit" size="small" onClick={() => closeSnackbar(key)}>
              Dismiss
            </Button>
          </Stack>
        ),
      });

      onClose();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), { variant: 'error' });
    }
  };

  const busy = createBlogMutation.isPending || uploadMediaMutation.isPending || shareMutation.isPending;
  const aiBusy = aiGenerateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            position: 'relative',
            borderRadius: 3,
            backgroundImage: 'none',
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            maxHeight: 'min(92vh, 880px)',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {aiBusy ? <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }} color="primary" /> : null}

      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pr: 1, flexShrink: 0 }}>
        <Box>
          <Typography component="span" variant="h6" sx={{ fontWeight: 800 }}>
            New post
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Write here — your feed updates as soon as you publish.
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={handleClose} disabled={busy} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Box
        component="form"
        onSubmit={submit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        <DialogContent
          dividers
          sx={{
            pt: 1,
            flex: '1 1 auto',
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          <Stack spacing={2.25}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
              Optional: <strong>Generate</strong> fills title and body from a small server template (
              <code style={{ fontSize: '0.78em' }}>blogixy-draft-v1</code>
              ) — not a live LLM. Edit before you publish.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                label="AI prompt (optional)"
                variant="filled"
                placeholder="e.g. a short post about weekend photography…"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                disabled={busy || aiBusy}
              />
              <Button
                type="button"
                variant="outlined"
                sx={{ flexShrink: 0, alignSelf: { sm: 'center' } }}
                disabled={busy || aiBusy || !aiPrompt.trim()}
                onClick={async () => {
                  try {
                    const draft = await aiGenerateMutation.mutateAsync({
                      prompt: aiPrompt.trim(),
                      tone: 'professional',
                      length: 'medium',
                    });
                    setForm((prev) => ({
                      ...prev,
                      title: (draft.title as string) ?? prev.title,
                      content: (draft.content as string) ?? prev.content,
                    }));
                    enqueueSnackbar('Draft generated — review and edit before publishing.', { variant: 'info' });
                  } catch (err) {
                    enqueueSnackbar(getErrorMessage(err), { variant: 'error' });
                  }
                }}
              >
                {aiBusy ? 'Working…' : 'Generate'}
              </Button>
            </Stack>

            <TextField
              label="Title"
              variant="filled"
              fullWidth
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              disabled={busy || aiBusy}
            />
            <TextField
              label="Body"
              variant="filled"
              multiline
              minRows={6}
              fullWidth
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              disabled={busy || aiBusy}
            />
            <FormControlLabel
              label="Publish immediately"
              sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', fontWeight: 600 } }}
              control={
                <Switch
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  disabled={busy || aiBusy}
                />
              }
            />
            <TextField
              select
              variant="filled"
              label="Lead media type"
              helperText={mediaFile ? mediaFile.name : 'Optional — uploads after the post is created'}
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
              disabled={busy || aiBusy}
            >
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="video">Video</MenuItem>
            </TextField>
            <Button variant="outlined" component="label" disabled={busy || aiBusy} sx={{ alignSelf: 'flex-start' }}>
              Attach file ({mediaType})
              <input
                hidden
                type="file"
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
              />
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            flexShrink: 0,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.98),
          }}
        >
          <Button type="button" onClick={handleClose} disabled={busy} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<CreateRoundedIcon />} disabled={busy || aiBusy}>
            {busy ? 'Saving…' : form.is_published ? 'Publish' : 'Save draft'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
