import type {MetadataRoute} from 'next';
import {locales} from '@/i18n/locale';

export interface SitemapEntry {
    url: string;
    lastModified?: string;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

/**
 * 生成完整的站点地图条目
 */
export async function generateSitemapEntries(locale: string, baseUrl: string): Promise<MetadataRoute.Sitemap> {
    try {
        // 并行获取所有类型的条目
        const [baseEntries] = await Promise.all([
            Promise.resolve(getBaseSitemapEntries(locale, baseUrl)),
        ]);
        console.info(`生成 ${locale} 语言的站点地图:`);
        // 合并所有条目
        return [...baseEntries];
    } catch (error) {
        console.error(`生成 ${locale} 语言的站点地图失败:`, error);
        // 返回基础条目作为降级处理
        return getBaseSitemapEntries(locale, baseUrl);
    }
}

/**
 * 生成基础站点地图条目
 */
export function getBaseSitemapEntries(locale: string, baseUrl: string): SitemapEntry[] {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    return [
        {
            url: `${baseUrl}${localePrefix}`,
        }
    ];
}

/**
 * 验证语言代码是否支持
 */
export function isValidLocale(locale: string): boolean {
    return locales.includes(locale);
}
