'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FriendLinks as FriendLinksType } from '@/types/blocks/friend-links';
import { cn } from '@/lib/utils';
import Icon from '@/components/icon';

export default function FriendLinks({ friendLinks }: { friendLinks: FriendLinksType }) {
  const t = useTranslations('friend_links');
  
  if (friendLinks.disabled) {
    return null;
  }

  // 按分类分组
  const groupedItems = friendLinks.showCategories && friendLinks.items 
    ? friendLinks.items.reduce((groups, item) => {
        const category = item.category || t('default_category');
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      }, {} as Record<string, typeof friendLinks.items>)
    : { '': friendLinks.items || [] };

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  };

  return (
    <section id={friendLinks.name} className={cn("py-16", friendLinks.className)}>
      <div className="container mx-auto">
        {/* Header */}
        {(friendLinks.title || friendLinks.description) && (
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 mb-12">
            {friendLinks.title && (
              <div className="flex items-center gap-2 mb-2">
                <Icon name="RiHeartLine" className="size-5 text-primary" />
                <h2 className="text-pretty text-3xl font-bold lg:text-4xl text-center">
                  {friendLinks.title}
                </h2>
              </div>
            )}
            {friendLinks.description && (
              <p className="max-w-2xl text-muted-foreground lg:text-lg text-center">
                {friendLinks.description}
              </p>
            )}
          </div>
        )}

        {/* Friend Links Content */}
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              {/* Category Title */}
              {friendLinks.showCategories && category && (
                <div className="flex items-center gap-2 mb-6">
                  <Icon name="RiGlobalLine" className="size-4 text-primary" />
                  <h3 className="text-xl font-semibold">{category}</h3>
                  <div className="flex-1 h-px bg-border ml-4"></div>
                </div>
              )}

              {/* Links Grid */}
              <div className={cn(
                "grid gap-4",
                gridCols[friendLinks.columns || 3]
              )}>
                {items?.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.title || `${t('visit')} ${item.name}`}
                    className="group relative flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    {/* Badge Image */}
                    {item.badgeUrl && (
                      <div className="shrink-0">
                        <Image
                          src={item.badgeUrl}
                          alt={`${item.name} badge`}
                          width={item.badgeWidth || 32}
                          height={item.badgeHeight || 32}
                          className="object-contain rounded"
                          sizes="32px"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        <Icon name="RiExternalLinkLine" className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Link Icon */}
                    <div className="shrink-0">
                      <Icon name="RiLinksLine" className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(!friendLinks.items || friendLinks.items.length === 0) && (
          <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
            <Icon name="RiGlobalLine" className="size-12 opacity-50" />
            <p className="text-sm">{t('no_links')}</p>
          </div>
        )}
      </div>
    </section>
  );
}