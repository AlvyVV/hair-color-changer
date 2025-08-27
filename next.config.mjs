import bundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';
import mdx from '@next/mdx';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin();

const withMDX = mdx({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // 现代浏览器优化配置
  compiler: {
    // 移除 console.log (生产环境)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // 实验性功能
  experimental: {
    mdxRs: true,
    // 优化第三方包导入，减少包体积
    optimizePackageImports: [
      // React Icons 优化
      'react-icons/ri',
      
      // Radix UI 组件优化
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog', 
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      
      // AWS SDK 优化
      '@aws-sdk/client-s3',
      '@aws-sdk/lib-storage',
      
      // AI SDK 优化
      '@ai-sdk/provider',
      '@ai-sdk/provider-utils',
      '@ai-sdk/react',
      '@ai-sdk/openai',
      'ai',
      
      // 其他大型库优化
      'embla-carousel-react',
      'embla-carousel-auto-scroll',
      'embla-carousel-fade',
      'next-intl',
      'dayjs',
      'markdown-it',
    ],
  },
  
  // 服务端外部包配置
  serverExternalPackages: [],
  
  images: {
    // 配置 Cloudflare 图像优化
    loader: 'custom',
    loaderFile: './lib/cloudflare-image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  
  async redirects() {
    return [];
  },
  
  // 优化 webpack 配置
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 改善HMR性能
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    
    // 生产环境优化
    if (!dev && !isServer) {
      // 配置模块解析优化
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }
      config.resolve.alias = {
        ...config.resolve.alias,
        // 使用现代版本的库
        'react/jsx-runtime': 'react/jsx-runtime',
      };
      
      // 优化代码分割
      if (config.optimization && config.optimization.splitChunks) {
        config.optimization.splitChunks.cacheGroups = {
          ...config.optimization.splitChunks.cacheGroups,
          // 现代浏览器 vendor chunk
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000, // 244KB
          },
        };
      }
    }
    
    return config;
  },
};

// 合并 MDX 配置
export default withBundleAnalyzer(withNextIntl(withMDX(nextConfig)));