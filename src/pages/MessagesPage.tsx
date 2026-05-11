import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
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
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';

import PageShell from '../components/PageShell';
import type { ConversationSummary, Message } from '../api/types';
import {
  useConversations,
  useDeleteMessage,
  useMessages,
  useProfile,
  useSendMessage,
  useSuggestedUsers,
  useToggleFollow,
  useUpdateMessage,
} from '../api/hooks';

type SuggestionsRailProps = {
  loading?: boolean;
  suggestions: { id: number; username: string }[];
  followMutation: ReturnType<typeof useToggleFollow>;
  slim?: boolean;
};

function SuggestionsRail({ loading, suggestions, followMutation, slim }: SuggestionsRailProps) {
  const theme = useTheme();
  return (
    <Paper sx={{ p: slim ? 1.75 : 2, borderRadius: 3, minHeight: slim ? 'unset' : 460 }}>
      {!slim && (
        <>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              mb: 0.75,
              letterSpacing: '-0.02em',
              pb: 1,
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
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
  const [searchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [message, setMessage] = useState('');

  const profileQuery = useProfile();
  const conversationsQuery = useConversations();
  const suggestedQuery = useSuggestedUsers();
  const messagesQuery = useMessages(selectedUserId);
  const followMutation = useToggleFollow();
  const sendMutation = useSendMessage();
  const updateMessage = useUpdateMessage();
  const deleteMessage = useDeleteMessage();

  const meId = (profileQuery.data as { id?: number } | undefined)?.id;

  useEffect(() => {
    const raw = searchParams.get('with');
    if (!raw) return;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0 && Number.isInteger(parsed)) {
      setSelectedUserId(parsed);
    }
  }, [searchParams]);

  const conversations = conversationsQuery.data as ConversationSummary[] | undefined;

  const suggestions = suggestedQuery.data as { id: number; username: string }[] | undefined;

  const sortedMessages = useMemo(() => {
    const raw = (messagesQuery.data as Message[]) ?? [];
    return [...raw].reverse();
  }, [messagesQuery.data]);

  const selectedConversation = conversations?.find((row) => row.user_id === selectedUserId);

  const threadHeader = (
    <Stack direction="row" spacing={1.25} sx={{ pb: 2, alignItems: 'center', flexShrink: 0 }}>
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
          <Box component={Link} to={selectedConversation ? `/users/${selectedConversation.user_id}` : '#'} sx={{ color: 'inherit', textDecoration: 'none' }}>
            @{selectedConversation?.username ?? 'conversation'}
          </Box>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Messages are stored on the server as plain text (HTTPS in transit).
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <PageShell>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 1,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          fontSize: { xs: theme.typography.pxToRem(26), md: theme.typography.pxToRem(30) },
          background: `linear-gradient(115deg, ${theme.palette.text.primary}, ${alpha(theme.palette.primary.main, 0.95)})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Messaging studio
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: { xs: 3, md: 4 } }}>
        Your inbox stays focused on actual threads. Suggested people live in their own rail—never mixed with chat history.
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
            <Stack direction="row" sx={{ mb: 1.25, justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
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
                          {(conv.unread_count ?? 0) > 0 && (
                            <Chip size="small" color="error" label={`${conv.unread_count} new`} />
                          )}
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

        <Grid
          size={{ xs: 12, md: 8, lg: 5 }}
          sx={{ display: { xs: selectedUserId ? 'block' : 'none', md: 'block' }, minWidth: 0 }}
        >
          <Paper
            sx={{
              borderRadius: 3,
              minHeight: 460,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 2, md: 2.75 },
              minWidth: 0,
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
                <Box
                  sx={{
                    flex: '1 1 auto',
                    minHeight: 280,
                    minWidth: 0,
                    width: '100%',
                    height: { xs: 'min(52vh, 440px)', md: 380 },
                    pr: 0.5,
                  }}
                >
                  {messagesQuery.isLoading ? (
                    <Stack spacing={1}>
                      {[0, 1, 2, 3].map((key) => (
                        <Skeleton key={key} height={72} sx={{ borderRadius: 2 }} />
                      ))}
                    </Stack>
                  ) : sortedMessages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Still quiet—say hi first.
                    </Typography>
                  ) : (
                    <Virtuoso
                      key={selectedUserId}
                      style={{ height: '100%', width: '100%' }}
                      data={sortedMessages}
                      initialTopMostItemIndex={Math.max(0, sortedMessages.length - 1)}
                      followOutput="smooth"
                      itemContent={(_index, msg) => {
                        const mine = meId === msg.sender;
                        return (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: mine ? 'flex-end' : 'flex-start',
                              mb: 1.25,
                              px: 0.5,
                              width: '100%',
                              minWidth: 0,
                              boxSizing: 'border-box',
                            }}
                          >
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ maxWidth: '100%', minWidth: 0 }}
                            >
                              <Box
                                sx={{
                                  maxWidth: 'min(520px, 88%)',
                                  width: 'max-content',
                                  minWidth: 0,
                                  boxSizing: 'border-box',
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
                                <Typography
                                  variant="body2"
                                  sx={{
                                    whiteSpace: 'pre-wrap',
                                    overflowWrap: 'break-word',
                                    wordBreak: 'normal',
                                  }}
                                >
                                  {msg.content}
                                </Typography>
                                {msg.message_type === 'blog_share' && msg.shared_blog_slug ? (
                                  <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>
                                    Shared blog:{' '}
                                    <Box component={Link} to={`/blogs/${msg.shared_blog_slug}`} sx={{ color: 'inherit' }}>
                                      {msg.shared_blog_title || msg.shared_blog_slug}
                                    </Box>
                                  </Typography>
                                ) : null}
                                {mine ? (
                                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                    <IconButton
                                      size="small"
                                      onClick={async () => {
                                        const updated = prompt('Edit message', msg.content);
                                        if (!updated || updated === msg.content) return;
                                        await updateMessage.mutateAsync({ id: msg.id, content: updated });
                                      }}
                                    >
                                      <EditRoundedIcon fontSize="inherit" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => deleteMessage.mutate(msg.id)}>
                                      <DeleteRoundedIcon fontSize="inherit" />
                                    </IconButton>
                                  </Stack>
                                ) : null}
                              </Box>
                            </motion.div>
                          </Box>
                        );
                      }}
                    />
                  )}
                </Box>
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
        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800, letterSpacing: '-0.02em' }}>
          People you may know
        </Typography>
        <SuggestionsRail slim loading={suggestedQuery.isLoading} suggestions={suggestions ?? []} followMutation={followMutation} />
      </Box>
    </PageShell>
  );
}
