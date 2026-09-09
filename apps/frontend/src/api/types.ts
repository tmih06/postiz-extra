export interface UserProfile {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role?: string;
  totalChannels?: number;
  tier?: string;
  admin?: boolean;
  isLifetime?: boolean;
  streakSince?: string | null;
}

export interface CustomerProfile {
  id: string;
  name: string;
  orgId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChannelIntegration {
  id: string;
  name: string;
  picture?: string | null;
  providerIdentifier: string;
  type: string;
  disabled: boolean;
  refreshNeeded: boolean;
  inBetweenSteps: boolean;
  customerId?: string | null;
  customer?: CustomerProfile | null;
  postingTimes?: string;
  additionalSettings?: string;
}

export interface MediaItem {
  id: string;
  path: string;
  name?: string;
}

export interface PostContentItem {
  id?: string;
  content: string;
  image?: MediaItem[];
  delay?: number;
}

export interface YoutubeSettings {
  title: string;
  type: 'public' | 'private' | 'unlisted';
  selfDeclaredMadeForKids?: 'no' | 'yes';
  tags?: Array<{ value: string; label: string }>;
  thumbnail?: MediaItem;
}

export interface TikTokSettings {
  title?: string;
  privacy_level:
    | 'PUBLIC_TO_EVERYONE'
    | 'MUTUAL_FOLLOW_FRIENDS'
    | 'FOLLOWER_OF_CREATOR'
    | 'SELF_ONLY';
  duet: boolean;
  stitch: boolean;
  comment: boolean;
  autoAddMusic: 'yes' | 'no';
}

export interface FacebookSettings {
  preset?: string;
}

export interface InstagramSettings {
  post_type: 'post' | 'story';
  is_trial_reel?: boolean;
}

export type PlatformSettings =
  | YoutubeSettings
  | TikTokSettings
  | FacebookSettings
  | InstagramSettings
  | Record<string, unknown>;

export interface PostSubmissionItem {
  integration: { id: string };
  value: PostContentItem[];
  settings?: Record<string, unknown>;
  group?: string;
}

export interface CreatePostPayload {
  type: 'draft' | 'schedule' | 'now' | 'update';
  date: string;
  shortLink: boolean;
  tags: Array<{ value: string; label: string }>;
  posts: PostSubmissionItem[];
  order?: string;
  republish?: boolean;
}

export interface PostDetailItem {
  id: string;
  group: string;
  publishDate: string;
  status: string;
  state?: string;
  releaseId?: string | null;
  integration: ChannelIntegration;
  content: PostContentItem[];
  settings?: Record<string, unknown>;
}

export interface PostGroup {
  id: string;
  group?: string;
  date: string;
  type: 'draft' | 'schedule' | 'now' | 'update';
  status?: string;
  posts: PostDetailItem[];
}

export interface PostsListResponse {
  posts: PostGroup[];
  total?: number;
}

export interface UploadedMedia {
  id: string;
  path: string;
  name: string;
}

export interface MediaListResponse {
  media: UploadedMedia[];
  total?: number;
}

export interface ApiClientConfig {
  baseUrl?: string;
  onUnauthorized?: () => void;
}
