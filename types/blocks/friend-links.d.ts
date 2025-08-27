export interface FriendLinkItem {
  name: string;
  url: string;
  description?: string;
  badgeUrl?: string;
  badgeWidth?: number;
  badgeHeight?: number;
  title?: string;
  category?: string;
}

export interface FriendLinks {
  name?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
  items?: FriendLinkItem[];
  className?: string;
  showCategories?: boolean;
  columns?: 2 | 3 | 4 | 6;
}