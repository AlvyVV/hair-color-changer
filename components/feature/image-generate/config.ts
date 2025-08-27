import type { ImageSize } from './types';

/**
 * 默认图片尺寸选项
 */
export const DEFAULT_IMAGE_SIZES: ImageSize[] = [
  { label: "Square HD", value: "square_hd" },
  { label: "Square", value: "square" },
  { label: "Portrait 4:3", value: "portrait_4_3" },
  { label: "Portrait 16:9", value: "portrait_16_9" },
  { label: "Landscape 4:3", value: "landscape_4_3" },
  { label: "Landscape 16:9", value: "landscape_16_9" }
];

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  // API 端点
  API_ENDPOINTS: {
    generateEndpoint: '/api/flux-image',
    statusEndpoint: '/api/task-status',
  },

  // 默认参数
  DEFAULTS: {
    mode: "text-to-image" as const,
    prompt: "A majestic dragon soaring through a cloudy sky, digital art, highly detailed, vibrant colors",
    imageSize: "landscape_4_3",
    steps: 28,
    guidance: 4.5,
    strength: 0.95,
  },

  // 参数限制
  LIMITS: {
    maxPromptLength: 1000,
    stepsRange: [10, 50] as const,
    guidanceRange: [1, 20] as const,
    strengthRange: [0.1, 1] as const,
    maxFileSize: 10, // 10MB
    supportedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // UI 配置
  UI: {
    estimatedTime: 18,
    creditsRequired: 10,
  },
} as const;