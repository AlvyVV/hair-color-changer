# Image Generate Component

简化的 AI 图片生成组件，支持文生图（Text-to-Image）和图生图（Image-to-Image）两种模式。

## 🚀 特性

- ✅ **双模式支持**: 文生图和图生图模式
- ✅ **简化设计**: 使用默认配置，无需复杂设置
- ✅ **TypeScript 支持**: 完整的类型定义和类型安全
- ✅ **响应式设计**: 适配移动端和桌面端
- ✅ **国际化支持**: 支持多语言
- ✅ **无障碍访问**: 符合 WCAG 标准
- ✅ **实时进度**: 生成进度跟踪
- ✅ **文件上传**: 支持拖拽上传

## 📦 安装和导入

```typescript
import ImageGenerate from "@/components/feature/image-generate";
```

## 🎯 基本使用

### 1. 最简单使用

```typescript
import ImageGenerate from "@/components/feature/image-generate";

export default function MyPage() {
  return <ImageGenerate />;
}
```

### 2. 带回调处理

```typescript
<ImageGenerate 
  onGenerateComplete={(result) => {
    console.log('生成完成:', result.imageUrl);
    // 处理生成结果
  }}
  onGenerateError={(error) => {
    console.error('生成失败:', error);
    // 处理错误
  }}
/>
```

### 3. 自定义样式

```typescript
<ImageGenerate 
  className="border rounded-lg p-4 bg-gray-50"
  onGenerateComplete={(result) => {
    // 处理结果
  }}
/>
```

## 📋 Props

```typescript
interface ImageGenerateProps {
  /** 自定义样式类名 */
  className?: string;
  /** 生成完成回调 */
  onGenerateComplete?: (result: { imageUrl: string }) => void;
  /** 错误回调 */
  onGenerateError?: (error: string) => void;
}
```

## 🔧 内置配置

组件使用内置的默认配置，包括：

- **API 端点**: `/api/flux-image` (生成), `/api/task-status` (状态查询)
- **图片尺寸**: 支持多种预设尺寸 (Square HD, Portrait, Landscape 等)
- **参数范围**: 
  - 推理步数: 10-50
  - 引导强度: 1-20
  - 变换强度: 0.1-1.0
- **文件限制**: 最大 10MB，支持 JPG/PNG/WebP
- **提示词**: 最大 1000 字符

## 🔧 API 端点要求

组件需要两个 API 端点：

### 1. 图片生成端点 (POST `/api/flux-image`)

```typescript
// 请求格式
{
  modelProvider: "fal",
  model: "fal-ai/flux/krea" | "fal-ai/flux/krea/image-to-image",
  prompt: string,
  num_inference_steps: number,
  guidance_scale: number,
  image_size?: string,        // 文生图模式
  image_url?: string,         // 图生图模式
  strength?: number           // 图生图模式
}

// 响应格式
{
  code: 0,
  message: "Task created successfully",
  data: {
    userMediaRecordId: string
  }
}
```

### 2. 任务状态查询端点 (GET `/api/task-status/{id}`)

```typescript
// 响应格式
{
  status: "success",
  data: {
    userMediaRecordId: string,
    status: string,
    progress: number,
    resultUrls: string[],
    isCompleted: boolean,
    isFailed: boolean
  }
}
```

## 🎨 功能说明

### 文生图模式
- 输入文字描述生成图片
- 可选择多种图片尺寸
- 可调节推理步数和引导强度

### 图生图模式
- 上传参考图片
- 输入修改描述
- 可调节变换强度
- 支持拖拽上传

### 通用功能
- 实时生成进度显示
- 生成完成后可下载图片
- 重置功能恢复默认设置
- 错误处理和用户提示

## 🌍 国际化

组件支持国际化，使用 `next-intl` 库。主要翻译键：

```json
{
  "flux": {
    "mode": {
      "text_to_image": "Text to Image",
      "image_to_image": "Image to Image"
    },
    "form": {
      "prompt": "Prompt",
      "prompt_placeholder": "Describe the image you want to generate...",
      "upload_image": "Upload Reference Image"
    },
    "login_incentive": "Sign up now and get 20 free credits!"
  },
  "common": {
    "validation": {
      "prompt_required": "Please enter a prompt",
      "image_required": "Please upload a reference image"
    },
    "error": {
      "upload_failed": "Upload failed. Please try again.",
      "generation_failed": "Image generation failed. Please try again."
    }
  }
}
```

## 📱 响应式设计

组件自动适配不同屏幕尺寸：

- **桌面端**: 双列布局（控制面板 + 预览区）
- **移动端**: 单列布局，垂直排列

## 🔍 示例页面

访问 `/image-generate-demo` 查看完整的使用示例。

## 🚨 注意事项

1. **用户认证**: 组件依赖 `useUser` 和 `useModal` 上下文，确保正确的认证状态
2. **API 端点**: 确保后端 API 返回正确的数据格式
3. **文件上传**: 使用项目统一的 `uploadFile` 函数
4. **错误处理**: 建议在回调函数中添加适当的错误处理逻辑

## 📝 更新日志

### v2.0.0 (简化版本)
- 移除复杂的配置系统
- 使用内置默认配置
- 简化 Props 接口
- 保持所有核心功能
- 更好的开发体验

### v1.0.0
- 初始版本发布
- 高度可配置的复杂版本（已废弃）