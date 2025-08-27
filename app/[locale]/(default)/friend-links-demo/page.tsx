'use client';

import { useTranslations } from 'next-intl';
import FriendLinks from '@/components/blocks/friend-links';
import { FriendLinks as FriendLinksType } from '@/types/blocks/friend-links';

export default function FriendLinksDemo() {
  const t = useTranslations('friend_links');

  // Mock 数据
  const mockFriendLinksData: FriendLinksType = {
    name: 'friend-links-demo',
    title: '友情链接',
    description: '感谢这些优秀的网站和工具，它们让开发变得更加便捷',
    disabled: false,
    showCategories: true,
    columns: 3,
    items: [
      // 开发工具类
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: '全球最大的代码托管平台',
        badgeUrl: 'https://github.com/fluidicon.png',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '开发工具',
        title: '访问 GitHub - 代码托管平台'
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description: '现代化的前端部署平台',
        badgeUrl: 'https://vercel.com/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '开发工具',
        title: '访问 Vercel - 前端部署'
      },
      {
        name: 'Next.js',
        url: 'https://nextjs.org',
        description: 'React 框架，用于构建全栈应用',
        badgeUrl: 'https://nextjs.org/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '开发工具',
        title: '访问 Next.js 官网'
      },
      
      // AI 工具类
      {
        name: 'OpenAI',
        url: 'https://openai.com',
        description: '人工智能研究实验室',
        badgeUrl: 'https://openai.com/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: 'AI 工具',
        title: '访问 OpenAI'
      },
      {
        name: 'Claude AI',
        url: 'https://claude.ai',
        description: 'Anthropic 开发的 AI 助手',
        badgeUrl: 'https://claude.ai/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: 'AI 工具',
        title: '访问 Claude AI'
      },
      {
        name: 'Midjourney',
        url: 'https://midjourney.com',
        description: 'AI 图像生成工具',
        badgeUrl: 'https://midjourney.com/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: 'AI 工具',
        title: '访问 Midjourney'
      },
      
      // 设计资源类  
      {
        name: 'Figma',
        url: 'https://figma.com',
        description: '协作式界面设计工具',
        badgeUrl: 'https://static.figma.com/app/icon/1/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '设计资源',
        title: '访问 Figma'
      },
      {
        name: 'Unsplash',
        url: 'https://unsplash.com',
        description: '免费高质量图片素材',
        badgeUrl: 'https://unsplash.com/favicon-32x32.png',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '设计资源',
        title: '访问 Unsplash'
      },
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        description: '实用优先的 CSS 框架',
        badgeUrl: 'https://tailwindcss.com/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '设计资源',
        title: '访问 Tailwind CSS'
      },

      // 友好站点类
      {
        name: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        description: '权威的 Web 开发文档',
        badgeUrl: 'https://developer.mozilla.org/favicon-48x48.png',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '学习资源',
        title: '访问 MDN Web Docs'
      },
      {
        name: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        description: '程序员问答社区',
        badgeUrl: 'https://stackoverflow.com/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '学习资源',
        title: '访问 Stack Overflow'
      },
      {
        name: 'Dev.to',
        url: 'https://dev.to',
        description: '开发者社区博客平台',
        badgeUrl: 'https://dev.to/favicon.ico',
        badgeWidth: 32,
        badgeHeight: 32,
        category: '学习资源',
        title: '访问 Dev.to'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">友情链接组件演示</h1>
          <p className="text-muted-foreground mb-6">
            这是一个展示友情链接组件功能的演示页面，包含分类显示、图标展示和响应式布局。
          </p>
          
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">组件特性</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 支持分类显示友链</li>
              <li>• 支持自定义徽章图片尺寸</li>
              <li>• 支持自定义链接标题</li>
              <li>• 响应式网格布局 (2/3/4/6列)</li>
              <li>• 悬停动画效果</li>
              <li>• 国际化支持</li>
              <li>• 使用主题中最小字号 (text-xs)</li>
            </ul>
          </div>
        </div>

        {/* 友链组件展示 */}
        <FriendLinks friendLinks={mockFriendLinksData} />
        
        {/* 不分类的展示 */}
        <FriendLinks 
          friendLinks={{
            ...mockFriendLinksData,
            title: '简洁模式',
            description: '不显示分类的友链展示',
            showCategories: false,
            columns: 4
          }} 
        />
      </div>
    </div>
  );
}