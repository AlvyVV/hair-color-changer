import { generateSitemapEntries, isValidLocale } from '@/lib/sitemap-utils';
import type { MetadataRoute } from 'next';
import { getLocale } from 'next-intl/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const locale = await getLocale();
    // 验证语言代码是否支持
    if (!isValidLocale(locale)) {
        console.warn(`不支持的语言代码: ${locale}，回退到英文`);
        return generateSitemapEntries('en', process.env.NEXT_PUBLIC_WEB_URL || '');
    }

    // 基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || '';

    // 生成对应语言的完整站点地图
    return generateSitemapEntries(locale, baseUrl);
}
