import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
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
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateBlog, useCreateShareLink, useUploadBlogMedia } from '../api/hooks';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

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
      const fileErr = d.file;
      if (Array.isArray(fileErr) && fileErr[0]) return String(fileErr[0]);
      if (typeof fileErr === 'string') return fileErr;
    }
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Try again.';
}

function mediaTypeFromFile(file: File): 'image' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

type CreatePostModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [form, setForm] = useState({ title: '', content: '', is_published: true });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const createBlogMutation = useCreateBlog();
  const uploadMediaMutation = useUploadBlogMedia();
  const shareMutation = useCreateShareLink();

  useEffect(() => {
    if (!open) {
      return;
    }
    setForm({ title: '', content: '', is_published: true });
    setMediaFile(null);
    setMediaPreviewUrl(null);
  }, [open]);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [mediaFile]);

  const handleClose = () => {
    if (createBlogMutation.isPending || uploadMediaMutation.isPending || shareMutation.isPending) {
      return;
    }
    onClose();
  };

  const onPickFile = (list: FileList | null) => {
    const file = list?.[0];
    if (!file) {
      setMediaFile(null);
      return;
    }
    const mt = mediaTypeFromFile(file);
    const max = mt === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > max) {
      enqueueSnackbar(
        mt === 'video' ? 'Video must be 20MB or smaller.' : 'Image must be 10MB or smaller.',
        { variant: 'warning' },
      );
      setMediaFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setMediaFile(file);
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
        const mediaType = mediaTypeFromFile(mediaFile);
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
      const primary = published ? `Published: “${createdBlog.title}”.` : `Draft saved: “${createdBlog.title}”.`;
      const secondary = shareUrl ? ' Share link copied to clipboard.' : '';

      enqueueSnackbar(`${primary}${secondary}`, {
        variant: 'success',
        autoHideDuration: published ? 8000 : 6000,
        action: (key) => (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Button
              type="button"
              color="inherit"
              size="small"
              onClick={() => {
                closeSnackbar(key);
                navigate(`/blogs/${createdBlog.slug}`);
              }}
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

      <Box component="form" onSubmit={submit} noValidate sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
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
              disabled={busy}
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
              disabled={busy}
            />
            <FormControlLabel
              label="Publish immediately"
              sx={{ '& .MuiFormControlLabel-label': { typography: 'body2', fontWeight: 600 } }}
              control={
                <Switch
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  disabled={busy}
                />
              }
            />

            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/*,video/*"
              onChange={(e) => onPickFile(e.target.files)}
            />
            <Box
              role="button"
              tabIndex={0}
              onClick={() => !busy && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (!busy && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              sx={{
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.04 : 0.08),
                py: 3,
                px: 2,
                textAlign: 'center',
                cursor: busy ? 'default' : 'pointer',
                opacity: busy ? 0.6 : 1,
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                '&:hover': !busy
                  ? {
                      borderColor: alpha(theme.palette.primary.main, 0.65),
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.07 : 0.12),
                    }
                  : {},
              }}
            >
              <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Click to upload image or video
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Type is detected from the file. Max 10MB images, 20MB videos.
              </Typography>
              {mediaFile ? (
                <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 600 }} color="primary">
                  {mediaFile.name} ({mediaTypeFromFile(mediaFile) === 'video' ? 'Video' : 'Image'})
                </Typography>
              ) : null}
              {mediaFile && mediaPreviewUrl ? (
                <Box
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    maxHeight: 320,
                    bgcolor: alpha(theme.palette.common.black, 0.04),
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {mediaTypeFromFile(mediaFile) === 'video' ? (
                    <Box
                      component="video"
                      src={mediaPreviewUrl}
                      controls
                      playsInline
                      preload="metadata"
                      sx={{ width: '100%', maxHeight: 320, display: 'block', objectFit: 'contain', bgcolor: 'common.black' }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={mediaPreviewUrl}
                      alt=""
                      sx={{ width: '100%', maxHeight: 320, display: 'block', objectFit: 'contain', verticalAlign: 'middle' }}
                    />
                  )}
                </Box>
              ) : null}
              {mediaFile ? (
                <Button
                  type="button"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove attachment
                </Button>
              ) : null}
            </Box>
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
          <Button type="submit" variant="contained" startIcon={<CreateRoundedIcon />} disabled={busy}>
            {busy ? 'Saving…' : form.is_published ? 'Publish' : 'Save draft'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
