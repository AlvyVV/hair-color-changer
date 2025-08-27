'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PureBadgeWall as PureBadgeWallType } from '@/types/blocks/pure-badge-wall';
import { cn } from '@/lib/utils';

export default function PureBadgeWall({ pureBadgeWall }: { pureBadgeWall: PureBadgeWallType }) {
  const t = useTranslations('pure_badge_wall');
  
  if (pureBadgeWall.disabled) {
    return null;
  }

  // 按分类分组
  const groupedItems = pureBadgeWall.showCategories && pureBadgeWall.items 
    ? pureBadgeWall.items.reduce((groups, item) => {
        const category = item.category || t('default_category');
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      }, {} as Record<string, typeof pureBadgeWall.items>)
    : { '': pureBadgeWall.items || [] };

  // 网格列数样式
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    8: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8',
    10: 'grid-cols-5 sm:grid-cols-8 lg:grid-cols-10'
  };

  // 间距样式
  const spacingClass = {
    tight: 'gap-2',
    normal: 'gap-4',
    loose: 'gap-6'
  };

  // 图片滤镜样式
  const filterClass = {
    none: '',
    grayscale: 'filter grayscale hover:grayscale-0',
    opacity: 'opacity-70 hover:opacity-100'
  };

  return (
    <section id={pureBadgeWall.name} className={cn("py-16", pureBadgeWall.className)}>
      <div className="container mx-auto">
        {/* Header */}
        {(pureBadgeWall.title || pureBadgeWall.description) && (
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 mb-12">
            {pureBadgeWall.title && (
              <h2 className="mb-2 text-pretty text-3xl font-bold lg:text-4xl text-center">
                {pureBadgeWall.title}
              </h2>
            )}
            {pureBadgeWall.description && (
              <p className="max-w-2xl text-muted-foreground lg:text-lg text-center">
                {pureBadgeWall.description}
              </p>
            )}
          </div>
        )}

        {/* Badge Wall Content */}
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              {/* Category Title */}
              {pureBadgeWall.showCategories && category && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-center text-muted-foreground">
                    {category}
                  </h3>
                  <div className="w-16 h-px bg-border mx-auto mt-2"></div>
                </div>
              )}

              {/* Pure Badge Grid - 直接对图片进行布局 */}
              <div className={cn(
                "grid items-center justify-items-center",
                gridCols[pureBadgeWall.columns || 6],
                spacingClass[pureBadgeWall.spacing || 'normal']
              )}>
                {items?.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.title || `Visit ${item.url}`}
                    className="block transition-transform duration-200 hover:scale-110"
                  >
                    <Image
                      src={item.badgeUrl}
                      alt={item.alt || item.title || `Badge ${index + 1}`}
                      width={item.badgeWidth || 120}
                      height={item.badgeHeight || 40}
                      className={cn(
                        "max-w-full h-auto object-contain transition-all duration-200",
                        filterClass[pureBadgeWall.imageFilter || 'grayscale']
                      )}
                      sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, (max-width: 1024px) 120px, 140px"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(!pureBadgeWall.items || pureBadgeWall.items.length === 0) && (
          <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-sm">{t('no_badges')}</p>
          </div>
        )}
      </div>
    </section>
  );
}