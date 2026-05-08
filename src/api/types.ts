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

export type HomeFeedResponse = {
  following_feed: BlogPost[];
  discovery_feed: BlogPost[];
};

export type ConversationSummary = {
  user_id: number;
  username: string;
  last_message_preview: string;
  last_at: string;
  last_sender_id: number;
};
