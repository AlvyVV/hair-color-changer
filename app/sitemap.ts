import { generateSitemapEntries } from '@/lib/sitemap-utils';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || '';

    // 生成英文版本的完整站点地图作为主 sitemap
    return generateSitemapEntries('en', baseUrl);
}
