/**
 * 现代浏览器特性检测和差异化加载策略
 * 用于运行时判断是否需要 polyfill 和降级处理
 */

// 现代浏览器特性检测
export const ModernBrowserFeatures = {
  // ES6+ 功能检测
  supportsES6Classes: () => {
    try {
      // 检测原生 class 支持
      new Function('class Test {}')();
      return true;
    } catch {
      return false;
    }
  },

  supportsAsyncAwait: () => {
    try {
      // 检测 async/await 支持
      new Function('async function test() { await Promise.resolve(); }')();
      return true;
    } catch {
      return false;
    }
  },

  supportsArrowFunctions: () => {
    try {
      // 检测箭头函数支持
      new Function('const test = () => {}')();
      return true;
    } catch {
      return false;
    }
  },

  supportsTemplateStrings: () => {
    try {
      // 检测模板字符串支持
      new Function('const test = `template ${1}`')();
      return true;
    } catch {
      return false;
    }
  },

  supportsDestructuring: () => {
    try {
      // 检测解构赋值支持
      new Function('const [a, b] = [1, 2]; const {c} = {c: 3}')();
      return true;
    } catch {
      return false;
    }
  },

  // 现代 DOM API 检测
  supportsIntersectionObserver: () => {
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  },

  supportsFetch: () => {
    return typeof window !== 'undefined' && 'fetch' in window;
  },

  supportsCustomElements: () => {
    return typeof window !== 'undefined' && 'customElements' in window;
  },

  // CSS 功能检测
  supportsCSS: {
    grid: () => {
      if (typeof window === 'undefined') return false;
      const div = document.createElement('div');
      return 'grid' in div.style;
    },
    
    flexbox: () => {
      if (typeof window === 'undefined') return false;
      const div = document.createElement('div');
      return 'flex' in div.style;
    },
    
    customProperties: () => {
      if (typeof window === 'undefined') return false;
      return window.CSS && CSS.supports && CSS.supports('--test', 'value');
    },
    
    containerQueries: () => {
      if (typeof window === 'undefined') return false;
      return window.CSS && CSS.supports && CSS.supports('container-type', 'inline-size');
    }
  }
};

// 浏览器能力评分
export const getBrowserCapabilityScore = (): number => {
  if (typeof window === 'undefined') return 0;

  let score = 0;
  const features = ModernBrowserFeatures;

  // ES6+ 功能 (每项 20 分，共 100 分)
  if (features.supportsES6Classes()) score += 20;
  if (features.supportsAsyncAwait()) score += 20;
  if (features.supportsArrowFunctions()) score += 20;
  if (features.supportsTemplateStrings()) score += 20;
  if (features.supportsDestructuring()) score += 20;

  // 现代 API (每项 10 分，共 30 分)
  if (features.supportsIntersectionObserver()) score += 10;
  if (features.supportsFetch()) score += 10;
  if (features.supportsCustomElements()) score += 10;

  // CSS 功能 (每项 5 分，共 20 分)
  if (features.supportsCSS.grid()) score += 5;
  if (features.supportsCSS.flexbox()) score += 5;
  if (features.supportsCSS.customProperties()) score += 5;
  if (features.supportsCSS.containerQueries()) score += 5;

  return Math.min(score, 150); // 最高 150 分
};

// 浏览器分类
export const BrowserCategory = {
  MODERN: 'modern',      // 120+ 分
  CAPABLE: 'capable',    // 80-119 分
  LEGACY: 'legacy'       // < 80 分
} as const;

export type BrowserCategory = typeof BrowserCategory[keyof typeof BrowserCategory];

export const getBrowserCategory = (): BrowserCategory => {
  const score = getBrowserCapabilityScore();
  
  if (score >= 120) return BrowserCategory.MODERN;
  if (score >= 80) return BrowserCategory.CAPABLE;
  return BrowserCategory.LEGACY;
};

// 条件加载策略
export const ConditionalLoading = {
  // 动态导入现代功能
  async loadModernFeature<T>(
    modernLoader: () => Promise<T>,
    legacyLoader: () => Promise<T>
  ): Promise<T> {
    const category = getBrowserCategory();
    
    try {
      if (category === BrowserCategory.MODERN) {
        return await modernLoader();
      } else {
        return await legacyLoader();
      }
    } catch (error) {
      console.warn('Feature loading failed, falling back to legacy:', error);
      return await legacyLoader();
    }
  },

  // 条件 polyfill 加载
  async loadPolyfillIfNeeded(feature: string, polyfillLoader: () => Promise<void>) {
    const needsPolyfill = !this.checkFeatureSupport(feature);
    
    if (needsPolyfill) {
      try {
        await polyfillLoader();
      } catch (error) {
        console.warn(`Failed to load polyfill for ${feature}:`, error);
      }
    }
  },

  // 功能支持检测
  checkFeatureSupport(feature: string): boolean {
    const features = ModernBrowserFeatures;
    
    switch (feature) {
      case 'fetch':
        return features.supportsFetch();
      case 'intersectionObserver':
        return features.supportsIntersectionObserver();
      case 'customElements':
        return features.supportsCustomElements();
      case 'css-grid':
        return features.supportsCSS.grid();
      case 'css-custom-properties':
        return features.supportsCSS.customProperties();
      default:
        return false;
    }
  }
};

// 性能监控
export const PerformanceMonitor = {
  // 记录加载时间
  markFeatureLoad(feature: string, isModern: boolean) {
    if (typeof window !== 'undefined' && window.performance?.mark) {
      const mark = `${feature}-${isModern ? 'modern' : 'legacy'}-loaded`;
      window.performance.mark(mark);
    }
  },

  // 获取加载指标
  getLoadingMetrics() {
    if (typeof window === 'undefined' || !window.performance?.getEntriesByType) {
      return {};
    }

    const marks = window.performance.getEntriesByType('mark');
    const metrics: Record<string, number> = {};

    marks.forEach(mark => {
      if (mark.name.includes('-loaded')) {
        metrics[mark.name] = mark.startTime;
      }
    });

    return metrics;
  }
};

// 用户代理检测（备用方案）
export const UserAgentInfo = {
  getBrowser(): { name: string; version: number; isModern: boolean } {
    if (typeof window === 'undefined') {
      return { name: 'unknown', version: 0, isModern: false };
    }

    const ua = window.navigator.userAgent;
    
    // Chrome/Edge
    const chromeMatch = ua.match(/Chrome\/(\d+)/);
    if (chromeMatch) {
      const version = parseInt(chromeMatch[1]);
      return {
        name: 'chrome',
        version,
        isModern: version >= 91
      };
    }

    // Firefox
    const firefoxMatch = ua.match(/Firefox\/(\d+)/);
    if (firefoxMatch) {
      const version = parseInt(firefoxMatch[1]);
      return {
        name: 'firefox',
        version,
        isModern: version >= 89
      };
    }

    // Safari
    const safariMatch = ua.match(/Version\/(\d+).*Safari/);
    if (safariMatch) {
      const version = parseInt(safariMatch[1]);
      return {
        name: 'safari',
        version,
        isModern: version >= 14
      };
    }

    // 默认为传统浏览器
    return { name: 'unknown', version: 0, isModern: false };
  }
};

// 导出主要接口
export {
  ModernBrowserFeatures as features,
  getBrowserCapabilityScore as getScore,
  getBrowserCategory as getCategory,
  ConditionalLoading as loader,
  PerformanceMonitor as monitor,
  UserAgentInfo as userAgent
};