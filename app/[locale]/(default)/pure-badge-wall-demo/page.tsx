'use client';

import {useTranslations} from 'next-intl';
import PureBadgeWall from '@/components/blocks/pure-badge-wall';
import {PureBadgeWall as PureBadgeWallType} from '@/types/blocks/pure-badge-wall';

export default function PureBadgeWallDemo() {
    const t = useTranslations('pure_badge_wall');

    // Mock 数据 - 纯徽章展示
    const mockPureBadgeData: PureBadgeWallType = {
        name: 'pure-badge-wall-demo',
        title: '纯徽章墙',
        description: '直接对徽章图片进行布局，无卡片边框，适合展示合作伙伴 Logo',
        disabled: false,
        showCategories: true,
        columns: 6,
        spacing: 'normal',
        imageFilter: 'grayscale',
        items: [
            // 开发工具
            {
                url: 'https://startupfa.me/s/ai-art-style?utm_source=ai-style.art',
                badgeUrl: 'https://startupfa.me/badges/featured-badge.webp',
                badgeWidth: 171,
                badgeHeight: 54,
            },
            {
                url: 'https://dang.ai/',
                badgeUrl: 'https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png',
                badgeWidth: 120,
                badgeHeight: 54
            },
            {
                url: 'https://twelve.tools',
                badgeUrl: 'https://twelve.tools/badge2-white.svg',
                badgeWidth: 200,
                badgeHeight: 54,
            },
            {
                url: 'https://fazier.com',
                badgeUrl: 'https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light',
                badgeWidth: 250,
                badgeHeight: 54
            },
            {
                url: 'https://turbo0.com/item/ai-dream-scope',
                badgeUrl: 'https://img.turbo0.com/badge-listed-light.svg',
                badgeHeight: 54
            }, {
                url: 'https://goodaitools.com',
                badgeUrl: 'https://goodaitools.com/assets/images/badge.png',
                badgeHeight: 54
            }, {
                url: 'https://magicbox.tools',
                badgeUrl: 'https://magicbox.tools/badge.svg',
                badgeHeight: 54
            }, {
                url: 'https://www.showmebest.ai',
                badgeUrl: 'https://www.showmebest.ai/badge/feature-badge-white.webp',
                badgeHeight: 60
            }
        ]
    };

    // 无分类的紧密布局
    const compactBadgeData: PureBadgeWallType = {
        ...mockPureBadgeData,
        title: '紧密布局',
        description: '更紧密的间距，适合展示更多徽章',
        showCategories: false,
        columns: 8,
        spacing: 'tight',
        imageFilter: 'opacity'
    };

    // 稀疏布局
    const sparseBadgeData: PureBadgeWallType = {
        ...mockPureBadgeData,
        title: '稀疏布局',
        description: '更大的间距，突出每个徽章',
        showCategories: false,
        columns: 4,
        spacing: 'loose',
        imageFilter: 'none',
        items: mockPureBadgeData.items?.slice(0, 8) // 只展示前8个
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">纯徽章墙组件演示</h1>
                    <p className="text-muted-foreground mb-6">
                        这是一个纯图片布局的徽章墙组件，没有卡片边框，直接对徽章图片进行布局。适合展示合作伙伴、技术栈、赞助商等。
                    </p>

                    <div className="bg-card border rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">组件特性</h2>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• 纯图片布局，无卡片边框</li>
                            <li>• 支持 2-10 列响应式网格</li>
                            <li>• 支持三种间距：紧密、正常、稀疏</li>
                            <li>• 支持三种滤镜：无、灰度、透明度</li>
                            <li>• 悬停缩放和颜色恢复效果</li>
                            <li>• 支持分类展示</li>
                            <li>• 自定义徽章尺寸</li>
                        </ul>
                    </div>
                </div>

                {/* 分类展示 */}
                <PureBadgeWall pureBadgeWall={mockPureBadgeData}/>

                {/* 紧密布局 */}
                <PureBadgeWall pureBadgeWall={compactBadgeData}/>

                {/* 稀疏布局 */}
                <PureBadgeWall pureBadgeWall={sparseBadgeData}/>
            </div>
        </div>
    );
}