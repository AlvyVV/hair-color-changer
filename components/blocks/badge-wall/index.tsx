'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeWall as BadgeWallType } from '@/types/blocks/badge-wall';
import { cn } from '@/lib/utils';

export default function BadgeWall({ badgeWall }: { badgeWall: BadgeWallType }) {
  if (badgeWall.disabled) {
    return null;
  }

  return (
    <section id={badgeWall.name} className={cn("py-16", badgeWall.className)}>
      <div className="container mx-auto">
        {/* Header */}
        {(badgeWall.title || badgeWall.description) && (
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 mb-12">
            {badgeWall.title && (
              <h2 className="mb-2 text-pretty text-3xl font-bold lg:text-4xl text-center">
                {badgeWall.title}
              </h2>
            )}
            {badgeWall.description && (
              <p className="max-w-2xl text-muted-foreground lg:text-lg text-center">
                {badgeWall.description}
              </p>
            )}
          </div>
        )}

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 items-center justify-items-center">
          {badgeWall.items?.map((item, index) => {
            const badgeContent = (
              <div className="group relative flex items-center justify-center p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background/80 transition-all duration-200 hover:scale-105">
                <Image
                  src={item.imageUrl}
                  alt={item.alt || item.hrefTitle || `Badge ${index + 1}`}
                  width={item.width || 120}
                  height={item.height || 40}
                  className="max-w-full h-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-200"
                  sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 180px"
                />
                {item.hrefTitle && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-2">
                    <p className="text-xs text-center text-muted-foreground font-medium">
                      {item.hrefTitle}
                    </p>
                  </div>
                )}
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                  title={item.hrefTitle || `Badge ${index + 1}`}
                >
                  {badgeContent}
                </Link>
              );
            }

            return (
              <div key={index} className="w-full">
                {badgeContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}