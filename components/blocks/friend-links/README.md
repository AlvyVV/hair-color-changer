# FriendLinks 友情链接组件

## 概述

FriendLinks 是一个用于展示友情链接的 React 组件，支持分类显示、徽章图片、响应式布局和国际化。

## 特性

- 🔗 友情链接展示
- 📂 支持分类展示 
- 🖼️ 支持徽章图片，可自定义尺寸
- 📱 响应式网格布局 (2/3/4/6列)
- 🎨 悬停动画效果
- 🌍 国际化支持
- ⚡ 使用主题中最小字号 (text-xs)

## 使用方法

```tsx
import FriendLinks from '@/components/blocks/friend-links';
import { FriendLinks as FriendLinksType } from '@/types/blocks/friend-links';

const friendLinksData: FriendLinksType = {
  name: 'friend-links',
  title: '友情链接',
  description: '感谢这些优秀的网站和工具',
  showCategories: true,
  columns: 3,
  items: [
    {
      name: 'GitHub',
      url: 'https://github.com',
      description: '全球最大的代码托管平台',
      badgeUrl: 'https://github.com/fluidicon.png',
      badgeWidth: 32,
      badgeHeight: 32,
      category: '开发工具',
      title: '访问 GitHub'
    }
  ]
};

export default function MyPage() {
  return <FriendLinks friendLinks={friendLinksData} />;
}
```

## Props 参数

### FriendLinks

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| name | string | - | 组件唯一标识 |
| title | string | - | 主标题 |
| description | string | - | 描述文字 |
| disabled | boolean | false | 是否禁用组件 |
| items | FriendLinkItem[] | - | 友链数据数组 |
| className | string | - | 自定义样式类名 |
| showCategories | boolean | false | 是否显示分类 |
| columns | 2 \| 3 \| 4 \| 6 | 3 | 网格列数 |

### FriendLinkItem

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| name | string | - | 站点名称 |
| url | string | - | 链接地址 |
| description | string | - | 站点描述 |
| badgeUrl | string | - | 徽章图片地址 |
| badgeWidth | number | 32 | 徽章宽度 |
| badgeHeight | number | 32 | 徽章高度 |
| title | string | - | 链接标题（hover 提示） |
| category | string | - | 分类名称 |

## 示例

### 基础用法

```tsx
<FriendLinks 
  friendLinks={{
    title: '友情链接',
    description: '我们的合作伙伴',
    columns: 4,
    items: [
      {
        name: 'Example Site',
        url: 'https://example.com',
        description: '示例网站',
        badgeUrl: '/badge.png'
      }
    ]
  }} 
/>
```

### 分类展示

```tsx
<FriendLinks 
  friendLinks={{
    title: '友情链接',
    showCategories: true,
    items: [
      {
        name: 'GitHub',
        url: 'https://github.com',
        category: '开发工具',
        badgeUrl: '/github-badge.png'
      },
      {
        name: 'Figma', 
        url: 'https://figma.com',
        category: '设计工具',
        badgeUrl: '/figma-badge.png'
      }
    ]
  }} 
/>
```

## 样式定制

组件使用 Tailwind CSS 构建，支持主题切换。主要使用以下样式：

- 字体: 使用主题中最小字号 `text-xs`
- 颜色: 使用主题颜色变量
- 布局: 响应式网格布局
- 动画: hover 缩放和颜色变化

## 国际化

组件支持国际化，需要在翻译文件中添加相应的键值：

```json
{
  "friend_links": {
    "default_category": "友好站点",
    "visit": "访问",
    "no_links": "暂无友链"
  }
}
```

## 演示页面

访问 `/friend-links-demo` 查看完整的组件演示效果。