export type RoleType = 'reader' | 'author' | 'business';

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  role: RoleType;
  profile_title?: string;
  bio?: string;
};

export type BlogPayload = {
  title: string;
  content: string;
  is_published: boolean;
};

export type BlogMediaItem = {
  id: number;
  media_type: 'image' | 'video';
  file: string;
  uploaded_at: string;
};

export type BlogPost = {
  id: number;
  author: number;
  author_name: string;
  /** Absolute URL when set, else null — use `userAvatarUrl` for feed display. */
  author_avatar?: string | null;
  /** Present when API includes favorite context for the current user. */
  is_favorited?: boolean;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
  media_items?: BlogMediaItem[];
  view_count: number;
  likes_count: number;
  comments_count: number;
  ranking_score?: number;
  created_at?: string;
  updated_at?: string;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: RoleType;
  profile_title?: string;
  bio?: string;
  avatar?: string | null;
};

/** Paginated home timeline (following + discover merged for auth users). */
export type PaginatedHomeFeedResponse = {
  results: BlogPost[];
  count: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

export type FavoriteEntry = {
  favorited_at: string;
  blog: BlogPost;
};

export type ConversationSummary = {
  user_id: number;
  username: string;
  last_message_preview: string;
  last_at: string;
  last_sender_id: number;
  unread_count?: number;
};

export type Message = {
  id: number;
  sender: number;
  sender_name: string;
  receiver: number;
  receiver_name: string;
  message_type: 'text' | 'blog_share';
  content: string;
  shared_blog?: number | null;
  shared_blog_slug?: string;
  shared_blog_title?: string;
  is_read: boolean;
  edited_at?: string | null;
  deleted_at?: string | null;
  is_deleted: boolean;
  created_at: string;
};

export type NotificationItem = {
  id: number;
  notification_type: 'message' | 'comment' | 'like' | 'follow' | 'share' | 'system';
  title: string;
  message: string;
  actor?: number | null;
  actor_name?: string;
  target_blog?: number | null;
  target_blog_slug?: string;
  target_message?: number | null;
  payload?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};
