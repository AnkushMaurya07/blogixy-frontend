import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import PageShell from '../components/PageShell';
import type { ConversationSummary } from '../api/types';
import {
  useConversations,
  useFollowUser,
  useMessages,
  useProfile,
  useSendMessage,
  useSuggestedUsers,
} from '../api/hooks';

type SuggestionsRailProps = {
  loading?: boolean;
  suggestions: { id: number; username: string }[];
  followMutation: ReturnType<typeof useFollowUser>;
  slim?: boolean;
};

function SuggestionsRail({ loading, suggestions, followMutation, slim }: SuggestionsRailProps) {
  const theme = useTheme();
  return (
    <Paper sx={{ p: slim ? 1.75 : 2, borderRadius: 3, minHeight: slim ? 'unset' : 460 }}>
      {!slim && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 750, mb: 0.75 }}>
            People you may know
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Lightweight suggestions for following—not merged into your inbox.
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      {loading ? (
        [0, 1, 2].map((key) => <Skeleton key={key} height={92} sx={{ mb: slim ? 1.5 : 2, borderRadius: 2 }} />)
      ) : (
        <Stack spacing={2}>
          {suggestions.map((user) => (
            <motion.div key={user.id} layout whileHover={{ translateY: slim ? -1 : -3 }}>
              <Paper variant="outlined" sx={{ p: slim ? 1.5 : 1.75, borderRadius: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2) }}>
                    {user.username.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 650 }}>{user.username}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Fresh voice outside your graph
                    </Typography>
                  </Stack>
                  <Chip
                    icon={<PersonAddAlt1RoundedIcon />}
                    label="Follow"
                    variant="outlined"
                    size={slim ? 'small' : 'medium'}
                    onClick={() => followMutation.mutate(user.id)}
                    clickable
                  />
                </Stack>
              </Paper>
            </motion.div>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export default function MessagesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [message, setMessage] = useState('');

  const profileQuery = useProfile();
  const conversationsQuery = useConversations();
  const suggestedQuery = useSuggestedUsers();
  const messagesQuery = useMessages(selectedUserId);
  const followMutation = useFollowUser();
  const sendMutation = useSendMessage();

  const meId = (profileQuery.data as { id?: number } | undefined)?.id;

  const conversations = conversationsQuery.data as ConversationSummary[] | undefined;

  const suggestions = suggestedQuery.data as { id: number; username: string }[] | undefined;

  const sortedMessages = useMemo(() => {
    const raw = (messagesQuery.data as { id: number; sender: number; content: string; sender_name: string }[]) ?? [];
    return [...raw].reverse();
  }, [messagesQuery.data]);

  const selectedConversation = conversations?.find((row) => row.user_id === selectedUserId);

  const threadHeader = (
    <Stack direction="row" spacing={1.25} sx={{ pb: 2, alignItems: 'center' }}>
      {isMobile && (
        <IconButton size="small" aria-label="Back to inbox" onClick={() => setSelectedUserId(undefined)}>
          <ArrowBackIosNewRoundedIcon />
        </IconButton>
      )}
      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main' }}>
        {(selectedConversation?.username ?? '?').slice(0, 1).toUpperCase()}
      </Avatar>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 650 }}>
          @{selectedConversation?.username ?? 'conversation'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Live thread • encrypted transport coming soon
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <PageShell>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
        Messaging studio
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: { xs: 3, md: 4 } }}>
        Your inbox stays focused on actual threads. Suggested humans live in their own rail—never mixed with chat history.
      </Typography>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'stretch' }}>
        <Grid
          size={{ xs: 12, md: 4, lg: 4 }}
          sx={{ display: { xs: selectedUserId ? 'none' : 'block', md: 'block' } }}
        >
          <Paper
            sx={{
              p: 2,
              height: '100%',
              minHeight: 420,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack direction="row" sx={{ mb: 1.25, justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Conversations
              </Typography>
              <Chip size="small" label={`${conversations?.length ?? 0} active`} color="primary" variant="outlined" />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {conversationsQuery.isLoading ? (
              <Stack spacing={1.5}>
                {[0, 1, 2].map((k) => (
                  <Skeleton key={k} height={72} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : (conversations ?? []).length === 0 ? (
              <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', px: 2 }}>
                <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 650 }}>
                    Inbox zero vibes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    When someone sends you a message—or you start a thread—it will appear here cleanly, without suggested users hiding the signal.
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <List disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
                {(conversations ?? []).map((conv) => (
                  <motion.div key={conv.user_id} layout whileTap={{ scale: 0.997 }}>
                    <ListItemButton
                      selected={conv.user_id === selectedUserId}
                      onClick={() => {
                        setSelectedUserId(conv.user_id);
                      }}
                      sx={{ borderRadius: 2, mb: 1 }}
                    >
                      <Stack spacing={0.5} sx={{ width: '100%' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>
                            @{conv.username}
                          </Typography>
                          {conv.last_sender_id !== meId && (
                            <Chip size="small" color="warning" variant="outlined" label="Inbound" />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {conv.last_message_preview}
                        </Typography>
                      </Stack>
                    </ListItemButton>
                  </motion.div>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 5 }} sx={{ display: { xs: selectedUserId ? 'block' : 'none', md: 'block' } }}>
          <Paper
            sx={{
              borderRadius: 3,
              minHeight: 460,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 2, md: 2.75 },
            }}
          >
            {!selectedUserId ? (
              <Stack spacing={2} sx={{ flex: 1, textAlign: 'center', px: { xs: 2, md: 6 }, justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6">Choose a thread</Typography>
                <Typography variant="body2" color="text.secondary">
                  Only live conversations appear in this column. Suggested people stay on the far right so your mental model stays tidy.
                </Typography>
              </Stack>
            ) : (
              <>
                {threadHeader}
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1} sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                  {messagesQuery.isLoading ? (
                    [0, 1, 2, 3].map((key) => <Skeleton key={key} height={72} sx={{ borderRadius: 2 }} />)
                  ) : sortedMessages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Still quiet—say hi first.
                    </Typography>
                  ) : (
                    sortedMessages.map((msg) => {
                      const mine = meId === msg.sender;
                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                            <Box
                              sx={{
                                maxWidth: '78%',
                                bgcolor: mine ? 'primary.main' : alpha(theme.palette.text.primary, theme.palette.mode === 'light' ? 0.06 : 0.12),
                                color: mine ? theme.palette.primary.contrastText : theme.palette.text.primary,
                                borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                px: 2,
                                py: 1.25,
                              }}
                            >
                              <Typography variant="caption" sx={{ opacity: mine ? 0.9 : 0.7, display: 'block', mb: 0.5 }}>
                                @{msg.sender_name}
                              </Typography>
                              <Typography variant="body2">{msg.content}</Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      );
                    })
                  )}
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ pt: 2 }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Compose"
                    placeholder="Thoughtful, succinct, kind."
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <IconButton
                    aria-label="send message"
                    color="primary"
                    sx={{
                      alignSelf: { md: 'center' },
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.22) },
                    }}
                    onClick={async () => {
                      if (!selectedUserId || !message.trim()) {
                        return;
                      }
                      await sendMutation.mutateAsync({ receiver: selectedUserId, content: message.trim() });
                      setMessage('');
                      await messagesQuery.refetch();
                    }}
                  >
                    <SendRoundedIcon />
                  </IconButton>
                </Stack>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <SuggestionsRail loading={suggestedQuery.isLoading} suggestions={suggestions ?? []} followMutation={followMutation} />
        </Grid>
      </Grid>

      <Box sx={{ display: { xs: 'block', lg: 'none' }, mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          People you may know
        </Typography>
        <SuggestionsRail slim loading={suggestedQuery.isLoading} suggestions={suggestions ?? []} followMutation={followMutation} />
      </Box>
    </PageShell>
  );
}
