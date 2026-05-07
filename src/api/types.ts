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
