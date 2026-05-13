import { Box, Button, Divider, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useState } from 'react';

import { useBlogComments, useCreateComment } from '../api/hooks';
import { useAppSelector } from '../features/auth/hooks';

type BlogCommentsPanelProps = {
  slug: string;
};

export default function BlogCommentsPanel({ slug }: BlogCommentsPanelProps) {
  const token = useAppSelector((s) => s.auth.accessToken);
  const [content, setContent] = useState('');
  const commentsQuery = useBlogComments(slug);
  const createComment = useCreateComment(slug);

  const items = commentsQuery.data as { id: number; user_name: string; content: string }[] | undefined;

  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}>
        <ChatBubbleRoundedIcon color="secondary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 650 }}>
          Comments
        </Typography>
      </Stack>
      {commentsQuery.isLoading ? (
        <Stack spacing={1}>
          {[0, 1, 2].map((k) => (
            <Skeleton key={k} height={48} sx={{ borderRadius: 2 }} animation="wave" />
          ))}
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          {(items ?? []).slice(0, 4).map((comment) => (
            <motion.div key={comment.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>
              <Box
                sx={(theme) => ({
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backdropFilter: 'blur(18px)',
                })}
              >
                <Typography variant="caption" sx={{ fontWeight: 650 }} color="text.secondary">
                  {comment.user_name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {comment.content}
                </Typography>
              </Box>
            </motion.div>
          ))}
          {(items?.length ?? 0) === 0 && (
            <Typography variant="caption" color="text.secondary">
              Quiet thread — weigh in below.
            </Typography>
          )}
        </Stack>
      )}
      <Divider sx={{ my: 2 }} />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField
          fullWidth
          size="small"
          variant="filled"
          label="Thoughts?"
          placeholder={token ? 'Drop a nuanced take' : 'Sign in to comment'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!token}
        />
        <Button
          variant="contained"
          endIcon={<SendRoundedIcon />}
          disabled={!token || createComment.isPending}
          onClick={async () => {
            if (!content.trim()) {
              return;
            }
            await createComment.mutateAsync(content.trim());
            setContent('');
          }}
          sx={{ minWidth: 140 }}
        >
          Post comment
        </Button>
      </Stack>
    </Box>
  );
}
