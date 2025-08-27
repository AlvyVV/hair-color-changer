/**
 * 条件 Polyfill 加载器
 * 只在需要时加载 polyfill，减少现代浏览器的负担
 */

// Polyfill 加载状态管理
const polyfillStatus = new Map<string, 'loading' | 'loaded' | 'error'>();

// 功能检测函数
const FeatureDetection = {
  fetch: () => typeof window !== 'undefined' && 'fetch' in window,
  
  intersectionObserver: () => 
    typeof window !== 'undefined' && 'IntersectionObserver' in window,
  
  resizeObserver: () => 
    typeof window !== 'undefined' && 'ResizeObserver' in window,
  
  customElements: () => 
    typeof window !== 'undefined' && 'customElements' in window,
  
  webAnimations: () => 
    typeof window !== 'undefined' && 'animate' in document.createElement('div'),
};

// Polyfill 加载器
class PolyfillLoader {
  private static instance: PolyfillLoader;
  
  public static getInstance(): PolyfillLoader {
    if (!PolyfillLoader.instance) {
      PolyfillLoader.instance = new PolyfillLoader();
    }
    return PolyfillLoader.instance;
  }

  /**
   * 条件加载 fetch polyfill
   */
  async loadFetchPolyfill(): Promise<void> {
    if (FeatureDetection.fetch()) {
      console.log('✅ Native fetch supported, skipping polyfill');
      return;
    }

    return this.loadPolyfill('fetch', async () => {
      // 使用动态导入但简化处理
      if (typeof window !== 'undefined' && !window.fetch) {
        // 简单的 fetch polyfill 替代
        (window as any).fetch = async (url: string, options?: RequestInit) => {
          throw new Error('Fetch not supported and polyfill not loaded');
        };
      }
    });
  }

  /**
   * 条件加载 IntersectionObserver polyfill
   */
  async loadIntersectionObserverPolyfill(): Promise<void> {
    if (FeatureDetection.intersectionObserver()) {
      console.log('✅ Native IntersectionObserver supported, skipping polyfill');
      return;
    }

    return this.loadPolyfill('intersection-observer', async () => {
      // 简化的 IntersectionObserver polyfill
      if (typeof window !== 'undefined' && !window.IntersectionObserver) {
        console.warn('IntersectionObserver polyfill needed but not loaded');
      }
    });
  }

  /**
   * 批量加载必需的 polyfills
   */
  async loadEssentialPolyfills(): Promise<void> {
    const promises: Promise<void>[] = [];

    // 只加载确实需要的 polyfills
    if (!FeatureDetection.fetch()) {
      promises.push(this.loadFetchPolyfill());
    }

    if (!FeatureDetection.intersectionObserver()) {
      promises.push(this.loadIntersectionObserverPolyfill());
    }

    // 等待所有必需的 polyfills 加载完成
    await Promise.allSettled(promises);
    
    console.log('🎉 Essential polyfills loaded (only where needed)');
  }

  /**
   * 通用 polyfill 加载方法
   */
  private async loadPolyfill(name: string, loader: () => Promise<void>): Promise<void> {
    // 检查是否已经加载
    if (polyfillStatus.get(name) === 'loaded') {
      return;
    }

    // 检查是否正在加载
    if (polyfillStatus.get(name) === 'loading') {
      // 等待加载完成
      return new Promise<void>((resolve, reject) => {
        const checkStatus = () => {
          const status = polyfillStatus.get(name);
          if (status === 'loaded') {
            resolve();
          } else if (status === 'error') {
            reject(new Error(`Polyfill ${name} failed to load`));
          } else {
            setTimeout(checkStatus, 10);
          }
        };
        checkStatus();
      });
    }

    // 开始加载
    polyfillStatus.set(name, 'loading');
    
    try {
      await loader();
      polyfillStatus.set(name, 'loaded');
      console.log(`📦 Polyfill loaded: ${name}`);
    } catch (error) {
      polyfillStatus.set(name, 'error');
      console.error(`❌ Failed to load polyfill: ${name}`, error);
      throw error;
    }
  }

  /**
   * 获取加载状态
   */
  getPolyfillStatus(name: string): 'loading' | 'loaded' | 'error' | 'not-loaded' {
    return polyfillStatus.get(name) || 'not-loaded';
  }

  /**
   * 获取所有已加载的 polyfills
   */
  getLoadedPolyfills(): string[] {
    const loaded: string[] = [];
    polyfillStatus.forEach((status, name) => {
      if (status === 'loaded') {
        loaded.push(name);
      }
    });
    return loaded;
  }
}

// 导出单例实例
export const polyfillLoader = PolyfillLoader.getInstance();

// 导出功能检测
export { FeatureDetection };

// 便捷方法
export const loadPolyfillsForModernApp = async (): Promise<void> => {
  // 只加载确实需要的 polyfills
  await polyfillLoader.loadEssentialPolyfills();
};

// 按需加载特定功能的 polyfill
export const loadPolyfillIfNeeded = async (
  feature: keyof typeof FeatureDetection,
  polyfillName: string
): Promise<void> => {
  const detector = FeatureDetection[feature];
  
  if (typeof detector === 'function' && !detector()) {
    switch (polyfillName) {
      case 'fetch':
        await polyfillLoader.loadFetchPolyfill();
        break;
      case 'intersection-observer':
        await polyfillLoader.loadIntersectionObserverPolyfill();
        break;
      default:
        console.warn(`Unknown polyfill: ${polyfillName}`);
    }
  }
};