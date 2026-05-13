import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import type { Theme } from '@mui/material/styles';

export type NotificationLike = {
  notification_type?: string;
  title?: string;
  message?: string;
};

export type NotificationVisualTone = 'warning' | 'primary' | 'error' | 'info' | 'secondary' | 'success';

export function getToneMain(theme: Theme, tone: NotificationVisualTone): string {
  switch (tone) {
    case 'warning':
      return theme.palette.warning.main;
    case 'error':
      return theme.palette.error.main;
    case 'info':
      return theme.palette.info.main;
    case 'secondary':
      return theme.palette.secondary.main;
    case 'success':
      return theme.palette.success.main;
    default:
      return theme.palette.primary.main;
  }
}

/**
 * Maps API notification rows to an icon + tone for list / menu display.
 * Draft vs published blog both use `system` — disambiguate with `title`.
 */
export function getNotificationVisual(note: NotificationLike): { Icon: SvgIconComponent; tone: NotificationVisualTone } {
  const t = (note.notification_type ?? '').toLowerCase();
  const title = (note.title ?? '').toLowerCase();
  const message = (note.message ?? '').toLowerCase();

  if (t === 'message' || title.includes('message')) {
    return { Icon: MarkEmailUnreadRoundedIcon, tone: 'warning' };
  }
  if (t === 'like' || title.includes('like')) {
    return { Icon: FavoriteRoundedIcon, tone: 'error' };
  }
  if (t === 'comment' || title.includes('comment')) {
    return { Icon: ChatBubbleOutlineRoundedIcon, tone: 'primary' };
  }
  if (t === 'share' || title.includes('shared')) {
    return { Icon: ShareRoundedIcon, tone: 'secondary' };
  }
  if (t === 'follow' || title.includes('follow')) {
    return { Icon: PersonAddAlt1RoundedIcon, tone: 'success' };
  }
  if (t === 'system' && (title.includes('draft') || message.includes('draft'))) {
    return { Icon: EditNoteRoundedIcon, tone: 'info' };
  }
  if (t === 'system' && (title.includes('published') || title.includes('blog'))) {
    return { Icon: ArticleRoundedIcon, tone: 'primary' };
  }
  return { Icon: NotificationsActiveRoundedIcon, tone: 'primary' };
}
