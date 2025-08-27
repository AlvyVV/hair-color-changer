'use client';

import { useEffect, useState } from 'react';
import { getBrowserCategory, BrowserCategory } from '@/lib/browser-support';

interface ModernLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minCategory?: BrowserCategory;
}

/**
 * 现代浏览器组件加载器
 * 根据浏览器能力动态加载组件
 */
export function ModernLoader({ 
  children, 
  fallback = null, 
  minCategory = BrowserCategory.CAPABLE 
}: ModernLoaderProps) {
  const [browserCategory, setBrowserCategory] = useState<BrowserCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 客户端检测浏览器能力
    const category = getBrowserCategory();
    setBrowserCategory(category);
    setIsLoading(false);
  }, []);

  // SSR 期间显示加载状态
  if (isLoading) {
    return (
      <div className="animate-pulse bg-muted rounded h-8 w-32" />
    );
  }

  // 根据浏览器能力决定渲染内容
  const shouldRenderModern = browserCategory && 
    (browserCategory === BrowserCategory.MODERN || 
     (minCategory === BrowserCategory.CAPABLE && browserCategory === BrowserCategory.CAPABLE));

  return shouldRenderModern ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook: 获取浏览器能力信息
 */
export function useBrowserCapability() {
  const [capability, setCapability] = useState<{
    category: BrowserCategory | null;
    isModern: boolean;
    isLoading: boolean;
  }>({
    category: null,
    isModern: false,
    isLoading: true
  });

  useEffect(() => {
    const category = getBrowserCategory();
    setCapability({
      category,
      isModern: category === BrowserCategory.MODERN,
      isLoading: false
    });
  }, []);

  return capability;
}