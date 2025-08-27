import { Button, Image, Announcement } from "@/types/blocks/base";

export interface Hero3D {
  name?: string;
  disabled?: boolean;
  announcement?: Announcement;
  title?: string;
  highlightText?: string;
  description?: string;
  buttons?: Button[];
  image?: Image;
  tip?: string;
  showHappyUsers?: boolean;
  showBadge?: boolean;
  list?: Image[];  // 新增图片列表字段
}