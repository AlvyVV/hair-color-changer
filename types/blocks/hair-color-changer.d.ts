import { Button } from '@/types/blocks/base';

export interface HairColorOption {
  /** 颜色唯一编码 */
  id: string;
  /** 颜色名称 */
  name: string;
  /** 颜色描述 */
  description?: string;
  /** 颜色参考图片URL */
  imageUrl: string;
  /** 颜色类型 (natural: 自然色, fashion: 时尚色, trendy: 潮流色, bright: 亮色) */
  category: 'natural' | 'fashion' | 'trendy' | 'bright';
  /** 是否为热门颜色 */
  isPopular?: boolean;
}

export interface HairColorCategory {
  /** 分类编码 */
  code: string;
  /** 分类名称 */
  name: string;
  /** 分类描述 */
  description?: string;
  /** 该分类下的颜色选项 */
  colors: HairColorOption[];
}

export interface ProcessingStatus {
  /** 当前状态 */
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  /** 进度值 0-100 */
  progress: number;
  /** 任务ID */
  taskId?: string;
  /** 状态信息 */
  message?: string;
  /** 错误信息 */
  error?: string;
  /** 处理结果图片URLs */
  resultUrls?: string[];
  /** 处理开始时间 */
  startTime?: number;
  /** 预计处理时间(秒) */
  expectedDuration?: number;
}

export interface ColorTask {
  /** 任务ID */
  userMediaRecordId: string | null;
  /** 预计执行时间 */
  exeTime: number;
  /** 颜色参考图片URL */
  pickcolorUrl: string;
  /** 任务索引 */
  index: number;
  /** 任务是否成功创建 */
  success: boolean;
  /** 错误信息(如果失败) */
  error?: string;
  /** 任务状态 */
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  /** 任务进度 0-100 */
  progress?: number;
  /** 结果图片URLs */
  resultUrls?: string[];
}

export interface BatchProcessingStatus {
  /** 整体状态 */
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  /** 所有任务 */
  tasks: ColorTask[];
  /** 总任务数 */
  totalTasks: number;
  /** 成功创建的任务数 */
  successfulTasks: number;
  /** 失败的任务数 */
  failedTasks: number;
  /** 已完成的任务数 */
  completedTasks?: number;
  /** 处理开始时间 */
  startTime?: number;
}

export interface ConnectionStatus {
  /** SSE连接状态 */
  sseConnected: boolean;
  /** 是否正在轮询 */
  isPolling: boolean;
  /** 连接重试次数 */
  retryCount: number;
  /** 最后连接时间 */
  lastConnectedAt?: number;
}

export interface HairColorChanger {
  meta?: {
    title?: string;
    description?: string;
  };
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  
  /** 上传区域配置 */
  uploadSection?: {
    title?: string;
    description?: string;
    uploadButton?: {
      title?: string;
      description?: string;
    };
    mobileButton?: {
      title?: string;
      description?: string;
    };
    dragText?: string;
    supportedFormats?: string;
  };
  
  /** 颜色选择区域配置 */
  colorSelection?: {
    title?: string;
    description?: string;
    categories?: HairColorCategory[];
    /** 默认选中的颜色 */
    defaultColor?: string;
    /** 自定义颜色支持 */
    allowCustomColor?: boolean;
  };
  
  /** 对比展示区域配置 */
  comparisonSection?: {
    title?: string;
    beforeLabel?: string;
    afterLabel?: string;
    /** 是否显示圆形遮罩 */
    showCircularMask?: boolean;
    /** 遮罩大小 */
    maskSize?: number;
  };
  
  /** 结果区域配置 */
  resultSection?: {
    title?: string;
    downloadButton?: Button;
    shareButton?: Button;
    retryButton?: Button;
    processingMessage?: {
      title?: string;
      description?: string;
    };
    completedMessage?: {
      title?: string;
      description?: string;
    };
    failedMessage?: {
      title?: string;
      description?: string;
    };
  };
  
  /** 进度文本配置 */
  progressTexts?: {
    uploading?: string;
    processing?: string;
    analyzing?: string;
    applying?: string;
    finalizing?: string;
    completed?: string;
    failed?: string;
  };
  
  /** 处理配置 */
  processingConfig?: {
    /** 默认处理时长(毫秒) */
    defaultDuration?: number;
    /** 最大等待时长(毫秒) */
    maxWaitTime?: number;
    /** 轮询间隔(毫秒) */
    pollingInterval?: number;
    /** 最大轮询次数 */
    maxPollingAttempts?: number;
    /** SSE连接超时(毫秒) */
    sseTimeout?: number;
  };
  
  /** 支持的文件格式 */
  supportedFormats?: string[];
  /** 最大文件大小(字节) */
  maxFileSize?: number;
  
  /** FAQ配置 */
  faq?: HairColorSection;
  /** 特性说明 */
  features?: HairColorSection;
}

interface HairColorSection {
  title?: string;
  description?: string;
  items?: Array<{
    title?: string;
    description?: string;
    icon?: string;
  }>;
}