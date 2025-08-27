const normalizeSrc = (src: string) => {
  return src.startsWith('/') ? src.slice(1) : src;
};

export default function cloudflareLoader({ 
  src, 
  width, 
  quality 
}: { 
  src: string; 
  width: number; 
  quality?: number 
}) {
  // 开发环境直接返回原图
  if (process.env.NODE_ENV === 'development') {
    return src;
  }

  // 确保宽度在合理范围内，避免下载过大图片
  const optimizedWidth = Math.min(width, 1920); // 最大宽度限制
  
  // 根据设备像素比调整质量
  const imageQuality = quality || getOptimalQuality(optimizedWidth);
  
  // Cloudflare Image Resizing 参数
  const params = [
    `width=${optimizedWidth}`,
    `quality=${imageQuality}`,
    'format=auto', // 自动选择最佳格式 (WebP/AVIF)
    'fit=scale-down', // 不放大小图片
    'sharpen=1', // 轻微锐化
  ];

  // 针对移动端进一步优化
  if (optimizedWidth <= 480) {
    params.push('dpr=2'); // 移动端支持 2x 显示
  }

  const paramsString = params.join(',');
  return `/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`;
}

/**
 * 根据图片宽度获取最优质量
 * 小图片可以用稍高质量，大图片降低质量节省带宽
 */
function getOptimalQuality(width: number): number {
  if (width <= 200) return 85; // 小图标/头像
  if (width <= 400) return 80; // 中等图片
  if (width <= 800) return 75; // 较大图片
  return 70; // 超大图片
}