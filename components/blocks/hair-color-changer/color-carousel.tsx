'use client';

import React, { useState } from 'react';
import type { HairColorOption } from '@/types/blocks/hair-color-changer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';

interface ColorCarouselProps {
  colors: HairColorOption[];
  categoryName: string;
  selectedColors: string[];
  onColorSelect: (colorId: string) => void;
  disabled?: boolean;
}

export function ColorCarousel({
  colors,
  categoryName,
  selectedColors,
  onColorSelect,
  disabled = false,
}: ColorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / 80) || 12;
  const maxIndex = Math.max(0, colors.length - itemsPerPage);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const visibleColors = colors.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      {/* 走马灯容器 */}
      <div className="relative flex items-center gap-4">
        {/* 分组名称 */}
        <div className="flex-shrink-0 w-20">
          <h4 className="font-medium text-sm text-gray-700">
            {categoryName}
          </h4>
        </div>
        
        {/* 左侧导航按钮 */}
        {currentIndex > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={disabled}
            className="flex-shrink-0 rounded-full w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border shadow-sm"
          >
            <Icon name="RiArrowLeftSLine" className="h-4 w-4" />
          </Button>
        )}

        {/* 色卡网格 */}
        <div className="flex-1 overflow-hidden">
          <div 
            className="flex gap-2 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 72}px)` }}
          >
            {colors.map((color) => (
              <div
                key={color.id}
                className="flex-shrink-0"
                style={{ width: '64px' }}
              >
                <button
                  onClick={() => onColorSelect(color.id)}
                  disabled={disabled}
                  className={cn(
                    'relative group rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden w-full transform-gpu',
                    selectedColors.includes(color.id)
                      ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' 
                      : 'border-gray-200 hover:border-orange-300 hover:shadow-md',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={color.imageUrl}
                      alt={color.name}
                      fill
                      className="object-cover"
                    />
                    {selectedColors.includes(color.id) && (
                      <>
                        <div className="absolute inset-0 bg-orange-500/20" />
                        <div className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <Icon name="RiCheckLine" className="h-2.5 w-2.5 text-white" />
                        </div>
                      </>
                    )}
                    {color.isPopular && (
                      <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* 右侧导航按钮 */}
        {currentIndex < maxIndex && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={disabled}
            className="flex-shrink-0 rounded-full w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border shadow-sm"
          >
            <Icon name="RiArrowRightSLine" className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}