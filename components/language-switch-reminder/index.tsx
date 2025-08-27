'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { localeNames, locales } from '@/i18n/locale';
import Icon from '@/components/icon';

const STORAGE_KEY = 'language_reminder_dismissed';

export default function LanguageSwitchReminder() {
  const [isVisible, setIsVisible] = useState(false);
  const [suggestedLocale, setSuggestedLocale] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const t = useTranslations();
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // 检测浏览器语言并映射到支持的语言
  const detectBrowserLanguage = (): string => {
    if (typeof window === 'undefined') return '';
    
    const browserLang = navigator.language.toLowerCase();
    
    // 完全匹配
    if (locales.includes(browserLang as any)) {
      return browserLang;
    }
    
    // 部分匹配（例如 zh-cn -> zh-CN）
    const normalizedLang = browserLang.replace('-', '-').toUpperCase();
    for (const locale of locales) {
      if (locale.toUpperCase() === normalizedLang) {
        return locale;
      }
    }
    
    // 语言代码匹配（例如 zh -> zh-CN）
    const langCode = browserLang.split('-')[0];
    const mappings: Record<string, string> = {
      'zh': 'zh-CN',
      'en': 'en',
      'fr': 'fr',
      'es': 'es',
    };
    
    return mappings[langCode] || '';
  };

  // 检查是否需要显示提醒
  useEffect(() => {
    const checkShouldShowReminder = () => {
      try {
        // 检查是否已被用户关闭
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (dismissed === 'true') return;

        const suggested = detectBrowserLanguage();
        
        // 如果检测到的语言与当前语言不同，且是支持的语言
        if (suggested && suggested !== currentLocale && locales.includes(suggested as any)) {
          setSuggestedLocale(suggested);
          setIsVisible(true);
          setIsAnimating(true);
          
          // 20秒后自动消失
          setTimeout(() => {
            handleDismiss();
          }, 20000);
        }
      } catch (error) {
        // 静默处理 localStorage 错误
      }
    };

    checkShouldShowReminder();
  }, [currentLocale]);

  // 切换语言
  const handleSwitchLanguage = () => {
    if (!suggestedLocale) return;
    
    let newPathName = pathname.replace(`/${currentLocale}`, `/${suggestedLocale}`);
    if (!newPathName.startsWith(`/${suggestedLocale}`)) {
      newPathName = `/${suggestedLocale}${newPathName}`;
    }
    
    // 记录用户选择
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      // 静默处理错误
    }
    
    router.push(newPathName);
  };

  // 暂不切换
  const handleNotNow = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      // 静默处理错误
    }
    handleDismiss();
  };

  // 关闭提醒
  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // 如果不可见，不渲染
  if (!isVisible || !suggestedLocale) {
    return null;
  }

  const suggestedLanguageName = localeNames[suggestedLocale] || suggestedLocale;

  return (
    <div 
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isAnimating 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-card/98 border border-border/30 backdrop-blur-sm shadow-lg rounded-xl mx-4 max-w-md w-full sm:max-w-2xl">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* 左侧内容 */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-base">🌐</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('language_reminder.detected')}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {suggestedLanguageName}
                </span>
              </div>
            </div>
            
            {/* 右侧按钮组 */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* 主要按钮 - 切换语言 */}
              <button
                onClick={handleSwitchLanguage}
                className="flex items-center justify-center border enabled:cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border-transparent h-8 rounded-lg text-xs relative bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-initial px-6 font-medium shadow-sm hover:shadow-md transition-all group"
              >
                <span className="relative z-10">
                  {t('language_reminder.switch_to', { language: suggestedLanguageName })}
                </span>
                <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
                <span className="absolute inset-0 rounded-md bg-primary/20 animate-pulse"></span>
              </button>
              
              {/* 暂不切换按钮 */}
              <button
                onClick={handleNotNow}
                className="flex items-center justify-center border font-medium enabled:cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border-transparent hover:bg-primary/10 h-8 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                {t('language_reminder.not_now')}
              </button>
              
              {/* 关闭按钮 */}
              <button
                onClick={handleDismiss}
                className="flex items-center justify-center border font-medium enabled:cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border-transparent hover:bg-primary/10 size-9 rounded-lg h-7 w-7 text-muted-foreground hover:text-foreground -mr-2"
              >
                <Icon name="RiCloseLine" className="h-3.5 w-3.5" />
                <span className="sr-only">{t('language_reminder.close')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}