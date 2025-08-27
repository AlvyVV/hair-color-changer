/**
 * 图片生成功能组件的类型定义
 */

export type GenerationMode = "text-to-image" | "image-to-image";

export interface ImageSize {
  label: string;
  value: string;
}

export interface GenerateParams {
  mode: GenerationMode;
  prompt: string;
  imageSize?: string;
  steps: number;
  guidance: number;
  strength?: number;
  imageUrl?: string;
}

export interface GenerateResult {
  userMediaRecordId: string;
  resultUrls: string[];
  taskId?: string;
  exeTime?: number;
}

export interface TaskStatus {
  userMediaRecordId: string;
  status: string;
  progress: number;
  resultUrls: string[];
  error?: string;
  isCompleted: boolean;
  isFailed: boolean;
}

export interface ImageGenerateState {
  // 基础状态
  generationMode: GenerationMode;
  prompt: string;
  imageSize: string;
  steps: number;
  guidance: number;
  strength: number;

  // 图片相关
  uploadedImage: string | null;
  imageUrl: string | null;
  generatedImage: string | null;

  // 加载状态
  isUploading: boolean;
  isDragOver: boolean;
  isGenerating: boolean;
  progress: number;

  // 任务相关
  taskId: string | null;
}

export interface ImageGenerateProps {
  /** 自定义样式类名 */
  className?: string;
  /** 生成完成回调 */
  onGenerateComplete?: (result: { imageUrl: string }) => void;
  /** 错误回调 */
  onGenerateError?: (error: string) => void;
}