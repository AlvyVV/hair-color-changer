# PureBadgeWall 纯徽章墙组件

## 概述

PureBadgeWall 是一个纯图片布局的徽章墙组件，专门用于展示合作伙伴 Logo、技术栈、赞助商等徽章。**无卡片边框，直接对徽章图片进行布局**。

## 特性

- 🏷️ 纯图片布局，无卡片装饰
- 📊 支持 2-10 列响应式网格
- 📏 支持三种间距：紧密、正常、稀疏
- 🎨 支持三种滤镜：无、灰度、透明度
- 🔍 悬停缩放和颜色恢复效果
- 📂 支持分类展示
- 📐 自定义徽章尺寸
- 🌍 国际化支持

## 使用方法

```tsx
import PureBadgeWall from '@/components/blocks/pure-badge-wall';
import { PureBadgeWall as PureBadgeWallType } from '@/types/blocks/pure-badge-wall';

const badgeData: PureBadgeWallType = {
  name: 'partners',
  title: '合作伙伴',
  description: '感谢这些优秀的合作伙伴',
  columns: 6,
  spacing: 'normal',
  imageFilter: 'grayscale',
  items: [
    {
      url: 'https://figma.com',
      badgeUrl: 'https://static.figma.com/app/icon/1/favicon.ico',
      badgeWidth: 120,
      badgeHeight: 40,
      category: '设计工具',
      title: '访问 Figma'
    }
  ]
};

export default function PartnersPage() {
  return <PureBadgeWall pureBadgeWall={badgeData} />;
}
```

## Props 参数

### PureBadgeWall

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| name | string | - | 组件唯一标识 |
| title | string | - | 主标题 |
| description | string | - | 描述文字 |
| disabled | boolean | false | 是否禁用组件 |
| items | PureBadgeItem[] | - | 徽章数据数组 |
| className | string | - | 自定义样式类名 |
| showCategories | boolean | false | 是否显示分类 |
| columns | 2\|3\|4\|5\|6\|8\|10 | 6 | 网格列数 |
| spacing | 'tight'\|'normal'\|'loose' | 'normal' | 间距大小 |
| imageFilter | 'none'\|'grayscale'\|'opacity' | 'grayscale' | 图片滤镜 |

### PureBadgeItem

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| url | string | - | 链接地址 |
| badgeUrl | string | - | 徽章图片地址 |
| badgeWidth | number | 120 | 徽章宽度 |
| badgeHeight | number | 40 | 徽章高度 |
| title | string | - | 链接标题（hover 提示） |
| alt | string | - | 图片 alt 属性 |
| category | string | - | 分类名称 |

## 使用示例

### 基础用法 - 纯图片展示

```tsx
<PureBadgeWall 
  pureBadgeWall={{
    title: '技术栈',
    columns: 8,
    spacing: 'tight',
    imageFilter: 'grayscale',
    items: [
      {
        url: 'https://nextjs.org',
        badgeUrl: 'https://nextjs.org/favicon.ico',
        badgeWidth: 100,
        badgeHeight: 30,
        title: 'Next.js'
      },
      {
        url: 'https://reactjs.org',
        badgeUrl: 'https://reactjs.org/favicon.ico',
        badgeWidth: 100,
        badgeHeight: 30,
        title: 'React'
      }
    ]
  }} 
/>
```

### 分类展示

```tsx
<PureBadgeWall 
  pureBadgeWall={{
    title: '合作伙伴',
    showCategories: true,
    columns: 6,
    spacing: 'normal',
    imageFilter: 'opacity',
    items: [
      {
        url: 'https://github.com',
        badgeUrl: 'https://github.com/fluidicon.png',
        category: '开发工具',
        title: 'GitHub'
      },
      {
        url: 'https://figma.com',
        badgeUrl: 'https://static.figma.com/app/icon/1/favicon.ico',
        category: '设计工具', 
        title: 'Figma'
      }
    ]
  }} 
/>
```

### 不同布局配置

```tsx
// 紧密布局 - 适合展示大量小徽章
<PureBadgeWall 
  pureBadgeWall={{
    columns: 10,
    spacing: 'tight',
    imageFilter: 'none',
    items: badges
  }} 
/>

// 稀疏布局 - 突出重要合作伙伴
<PureBadgeWall 
  pureBadgeWall={{
    columns: 4,
    spacing: 'loose',
    imageFilter: 'grayscale',
    items: importantPartners
  }} 
/>
```

## 设计特点

### 纯图片布局
- **无边框无背景**：直接展示徽章图片，无卡片装饰
- **专注内容**：让徽章本身成为焦点
- **适用场景**：合作伙伴、技术栈、赞助商展示

### 响应式网格
- **灵活列数**：2-10列可选，适应不同屏幕尺寸
- **自动适配**：在小屏幕上自动减少列数

### 视觉效果
- **滤镜选项**：灰度、透明度、无滤镜
- **悬停效果**：缩放变大 + 滤镜恢复
- **间距控制**：紧密、正常、稀疏三档

## 样式定制

组件使用 Tailwind CSS 构建：

```css
/* 间距样式 */
.tight { gap: 0.5rem; }    /* 8px */
.normal { gap: 1rem; }     /* 16px */
.loose { gap: 1.5rem; }    /* 24px */

/* 滤镜样式 */
.grayscale { filter: grayscale(100%); }
.grayscale:hover { filter: grayscale(0%); }

.opacity { opacity: 0.7; }
.opacity:hover { opacity: 1; }
```

## 国际化

需要在翻译文件中添加：

```json
{
  "pure_badge_wall": {
    "default_category": "合作伙伴",
    "no_badges": "暂无徽章"
  }
}
```

## 演示页面

访问 `/pure-badge-wall-demo` 查看完整的组件演示效果，包含不同布局和配置的展示。

## 与 BadgeWall 组件的区别

| 特性 | PureBadgeWall | BadgeWall |
|------|---------------|-----------|
| 布局风格 | 纯图片，无装饰 | 卡片式布局 |
| 适用场景 | 合作伙伴、技术栈 | 认证徽章、奖项 |
| 视觉重点 | 徽章本身 | 整体卡片 |
| 间距控制 | 3档可选 | 固定间距 |
| 列数选择 | 2-10列 | 2-6列 |