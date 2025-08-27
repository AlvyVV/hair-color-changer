export interface PureBadgeItem {
  url: string;
  badgeUrl: string;
  badgeWidth?: number;
  badgeHeight?: number;
  title?: string;
  alt?: string;
  category?: string;
}

export interface PureBadgeWall {
  name?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
  items?: PureBadgeItem[];
  className?: string;
  showCategories?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6 | 8 | 10;
  spacing?: 'tight' | 'normal' | 'loose';
  imageFilter?: 'none' | 'grayscale' | 'opacity';
}