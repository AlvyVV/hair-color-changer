export interface BadgeWallItem {
  imageUrl: string;
  width?: number;
  height?: number;
  hrefTitle?: string;
  href?: string;
  alt?: string;
}

export interface BadgeWall {
  name?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
  items?: BadgeWallItem[];
  className?: string;
}