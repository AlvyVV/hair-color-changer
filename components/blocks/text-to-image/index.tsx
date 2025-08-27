'use client';

import type React from 'react';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { TextToImage, TextToImageStyleOption } from '@/types/blocks/text-to-image';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useUser, useModal } from '@/contexts/app';
import { getProgress } from '@/lib/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import { useTranslations } from 'next-intl';
import { useMediaSSE, TaskStatus } from '@/hooks/use-media-sse';

interface TextToImageState {
  promptText: string;
  selectedStyle: string | null;
  selectedModel: string | null;
  selectedAspectRatio: string;
  availableAspectRatios: string[];
  processedImages: string[];
  isProcessing: boolean;
  progress: number;
  exeTime: number | null;
  taskId: string | null;
  pendingGenerate: boolean;
  loadingPrompt: string | null;
  sseConnected: boolean;
  error: string | null;
}

const INITIAL_STATE: TextToImageState = {
  promptText: '',
  selectedStyle: null,
  selectedModel: null,
  selectedAspectRatio: '',
  availableAspectRatios: [],
  processedImages: [],
  isProcessing: false,
  progress: 0,
  exeTime: null,
  taskId: null,
  pendingGenerate: false,
  loadingPrompt: null,
  sseConnected: false,
  error: null,
};

const DEFAULT_ASPECT_RATIO = '1:1';

export default function TextToImageBlock({ textToImage, styleOptions }: { textToImage: TextToImage; styleOptions: TextToImageStyleOption[] }) {
  const t = useTranslations();
  const { user } = useUser();
  const { setShowSignModal } = useModal();
  
  // State management
  const [state, setState] = useState<TextToImageState>(INITIAL_STATE);
  const resultRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // SSE for task status notifications (not progress updates)
  const { connected: sseConnected, taskStatuses, subscribeToTask, unsubscribeFromTask } = useMediaSSE({
    onProgress: useCallback((taskId: string, status: TaskStatus) => {
      // SSE进度更新仅用作状态验证，不直接更新UI进度
      console.log(`SSE进度更新: taskId=${taskId}, progress=${status.progress}, status=${status.status}`);
    }, []),
    
    onCompleted: useCallback((taskId: string, status: TaskStatus) => {
      if (taskId === state.taskId) {
        console.log(`SSE任务完成通知: taskId=${taskId}`);
        updateState({
          isProcessing: false,
          progress: 100,
          processedImages: status.resultUrls || [],
          error: null,
        });
        
        // 清理所有定时器
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
        
        // 滚动到结果区域
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, [state.taskId]),
    
    onFailed: useCallback((taskId: string, status: TaskStatus) => {
      if (taskId === state.taskId) {
        console.log(`SSE任务失败通知: taskId=${taskId}`);
        updateState({
          isProcessing: false,
          progress: 0,
          error: status.error || '生成失败，请重试',
        });
        
        // 清理所有定时器
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
      }
    }, [state.taskId]),
    
    onConnectionChange: useCallback((connected: boolean) => {
      updateState({ sseConnected: connected });
    }, []),
  });


  // Computed values
  const selectedModelData = useMemo(() => 
    textToImage.promptSection?.models?.find(m => m.code === state.selectedModel),
    [textToImage.promptSection?.models, state.selectedModel]
  );

  const canGenerate = useMemo(() => 
    !!(state.promptText.trim() && state.selectedModel),
    [state.promptText, state.selectedModel]
  );

  // Helper functions
  const updateState = useCallback((updates: Partial<TextToImageState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearState = useCallback(() => {
    // 清理SSE订阅
    if (state.taskId) {
      unsubscribeFromTask(state.taskId);
    }
    
    // 清理所有定时器
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    
    updateState({
      promptText: '',
      selectedStyle: null,
      selectedModel: null,
      selectedAspectRatio: '',
      availableAspectRatios: [],
      processedImages: [],
      taskId: null,
      isProcessing: false,
      progress: 0,
      error: null,
    });
  }, [updateState, state.taskId, unsubscribeFromTask]);

  const setupAspectRatios = useCallback((modelData: typeof selectedModelData) => {
    if (modelData?.aspectRatios && modelData.aspectRatios.length > 0) {
      updateState({
        availableAspectRatios: modelData.aspectRatios,
        selectedAspectRatio: modelData.aspectRatios[0],
      });
    } else {
      updateState({
        availableAspectRatios: [DEFAULT_ASPECT_RATIO],
        selectedAspectRatio: DEFAULT_ASPECT_RATIO,
      });
    }
  }, [updateState]);

  const ensureAspectRatio = useCallback(() => {
    if (!state.selectedAspectRatio && selectedModelData) {
      setupAspectRatios(selectedModelData);
      return selectedModelData.aspectRatios?.[0] || DEFAULT_ASPECT_RATIO;
    }
    return state.selectedAspectRatio || DEFAULT_ASPECT_RATIO;
  }, [state.selectedAspectRatio, selectedModelData, setupAspectRatios]);

  // 轮询任务状态的函数
  const pollTaskStatus = useCallback(async (taskId: string) => {
    try {
      const response = await apiClient.get<{
        status: 'success';
        data: {
          userMediaRecordId: string;
          status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
          progress: number;
          resultUrls: string[] | null;
          error: string | null;
          completedAt: string | null;
          failedAt: string | null;
        };
      }>(`/user-media-records/${taskId}/status`);

      const data = response.data;
      console.log(`轮询任务状态: taskId=${taskId}, status=${data.status}, progress=${data.progress}`);

      // 根据任务状态更新UI
      if (data.status === 'COMPLETED') {
        updateState({
          isProcessing: false,
          progress: 100,
          processedImages: data.resultUrls || [],
          error: null,
        });
        
        // 清理定时器
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
        
        // 滚动到结果区域
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (data.status === 'FAILED') {
        updateState({
          isProcessing: false,
          progress: 0,
          error: data.error || '生成失败，请重试',
        });
        
        // 清理定时器
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
      }
      // IN_PROGRESS 和 PENDING 状态继续轮询，不更新进度条（继续使用估算进度）
    } catch (error) {
      console.error('轮询任务状态失败:', error);
      // 轮询失败不影响用户体验，继续使用估算进度
    }
  }, [updateState, apiClient]);

  // Event handlers
  const handlePromptChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (state.isProcessing) {
      const confirmed = window.confirm(t('text_to_image.confirm_modify_prompt'));
      if (!confirmed) return;
      
      updateState({ isProcessing: false, progress: 0 });
      
      // 清理所有定时器
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    }
    updateState({ 
      promptText: event.target.value,
      processedImages: [],
    });
  }, [state.isProcessing, t, updateState]);

  const handleModelSelect = useCallback((modelCode: string) => {
    const modelData = textToImage.promptSection?.models?.find(m => m.code === modelCode);
    updateState({
      selectedModel: modelCode,
      processedImages: [],
      taskId: null,
    });
    setupAspectRatios(modelData);
  }, [textToImage.promptSection?.models, updateState, setupAspectRatios]);

  const handleStyleSelect = useCallback(async (styleId: string) => {
    try {
      updateState({ loadingPrompt: styleId });
      
      const response = await apiClient.get<{
        data: { prompt: string };
      }>(`/api/get-prompt?promptCode=${encodeURIComponent(styleId)}`);
      
      const updates: Partial<TextToImageState> = {
        selectedStyle: styleId,
        processedImages: [],
        taskId: null,
      };

      if (response.data?.prompt) {
        updates.promptText = response.data.prompt;
      }

      updateState(updates);

      // Ensure aspect ratio is set based on current model
      if (state.selectedModel && selectedModelData) {
        setupAspectRatios(selectedModelData);
      }
    } catch (error) {
      console.error('获取预制prompt失败:', error);
      updateState({ selectedStyle: styleId });
    } finally {
      updateState({ loadingPrompt: null });
    }
  }, [apiClient, updateState, state.selectedModel, selectedModelData, setupAspectRatios]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    if (!user) {
      updateState({ pendingGenerate: true });
      setShowSignModal(true);
      return;
    }

    const finalAspectRatio = ensureAspectRatio();

    try {
      const payload = {
        code: state.selectedModel!,
        promptText: state.promptText.trim(),
        n: 1,
        aspectRatio: finalAspectRatio,
      };

      const resp = await apiClient.post<{
        code: number;
        message: string;
        data: {
          userMediaRecordId: string;
          exeTime: number;
        };
      }>('/api/text-to-image', payload);

      const { userMediaRecordId, exeTime } = resp.data || {};

      updateState({
        taskId: userMediaRecordId || null,
        exeTime: exeTime || null,
        isProcessing: true,
        progress: 0,
        error: null,
      });

      // 订阅SSE任务更新
      if (userMediaRecordId) {
        subscribeToTask(userMediaRecordId);
      }
    } catch (error) {
      console.error('创建任务失败', error);
      updateState({
        error: '创建任务失败，请重试',
        isProcessing: false,
      });
    }
  }, [canGenerate, user, ensureAspectRatio, state.selectedModel, state.promptText, updateState, setShowSignModal, apiClient, subscribeToTask]);

  // Effects
  useEffect(() => {
    if (state.pendingGenerate && user) {
      updateState({ pendingGenerate: false });
      handleGenerate();
    }
  }, [state.pendingGenerate, user, updateState, handleGenerate]);


  // 混合进度更新机制：估算进度 + 超过94%后轮询兜底
  useEffect(() => {
    if (state.isProcessing && state.taskId) {
      // 清理现有定时器
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

      const expectedSeconds = state.exeTime && state.exeTime > 0 ? state.exeTime : (textToImage.processingDuration || 30000) / 1000;
      
      // 主进度定时器（基于估算）
      progressTimerRef.current = setInterval(() => {
        setState(prev => {
          const newProgress = getProgress(expectedSeconds, state.taskId!, prev.progress);
          
          // 当进度超过94%时，启动轮询兜底机制
          if (newProgress >= 94 && !pollingTimerRef.current) {
            console.log('进度超过94%，启动轮询兜底机制');
            pollingTimerRef.current = setInterval(() => {
              pollTaskStatus(state.taskId!);
            }, 2000); // 每2秒轮询一次
          }
          
          return {
            ...prev,
            progress: newProgress
          };
        });
      }, 1000);
      
      console.log(`启用混合进度更新机制 - SSE连接状态: ${state.sseConnected}, 预期时长: ${expectedSeconds}秒`);
    } else {
      // 清理所有定时器
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [state.isProcessing, state.taskId, state.exeTime, textToImage.processingDuration, pollTaskStatus]);

  // Download handler
  const handleDownload = useCallback(async (imageUrl: string, index: number) => {
    if (!imageUrl) return;

    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `text-to-image-${state.selectedStyle || 'image'}-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed, open in new tab as fallback', err);
      window.open(imageUrl, '_blank');
    }
  }, [state.selectedStyle]);

  if (textToImage.disabled) {
    return null;
  }

  return (
    <section id={textToImage.name} className="w-full py-8 md:py-16">
      <div className="container mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Icon name="RiMagicLine" className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">{textToImage.title}</h1>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="RiInputMethodLine" className="h-5 w-5" />
              {textToImage.promptSection?.title}
            </CardTitle>
            <CardDescription>{textToImage.promptSection?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              {/* Input Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-left">{textToImage.promptSection?.title}</h3>
                <div className="space-y-4">
                  {/* Prompt Input */}
                  <div className="relative">
                    <Textarea
                      value={state.promptText}
                      onChange={handlePromptChange}
                      placeholder={textToImage.promptSection?.textareaPlaceholder}
                      className="min-h-[150px] resize-none"
                      maxLength={1000}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                      {state.promptText.length}/1000
                    </div>
                  </div>
                  
                  {/* Model and Aspect Ratio Selection */}
                  {textToImage.promptSection?.models && textToImage.promptSection.models.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Model Selection */}
                      <div className="space-y-2 md:col-span-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{t('text_to_image.select_model')}</Label>
                          {state.selectedModel && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateState({
                                selectedModel: null,
                                availableAspectRatios: [],
                                selectedAspectRatio: '',
                                processedImages: [],
                                taskId: null,
                              })}
                              className="h-6 px-2 text-xs"
                            >
                              <Icon name="RiCloseLine" className="h-3 w-3 mr-1" />
                              {t('text_to_image.clear')}
                            </Button>
                          )}
                        </div>
                        <Select value={state.selectedModel || ''} onValueChange={handleModelSelect}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('text_to_image.select_ai_model_placeholder')}>
                              {state.selectedModel && selectedModelData && (
                                <span>{selectedModelData.name}</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {textToImage.promptSection.models.map((model) => (
                              <SelectItem key={model.code} value={model.code}>
                                <div className="flex flex-col w-full">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{model.name}</span>
                                    {model.credits && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {model.credits} {t('text_to_image.credits')}
                                      </span>
                                    )}
                                  </div>
                                  {model.tips && (
                                    <span className="text-xs text-muted-foreground mt-1">{model.tips}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Aspect Ratio Selection */}
                      <div className="space-y-2 md:col-span-1">
                        <Label className="text-sm font-medium">{t('text_to_image.aspect_ratio')}</Label>
                        <Select 
                          value={state.selectedAspectRatio} 
                          onValueChange={(value) => updateState({ selectedAspectRatio: value })}
                          disabled={!state.selectedModel || state.availableAspectRatios.length === 0}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('text_to_image.select_aspect_ratio_placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {state.availableAspectRatios.map((ratio) => (
                              <SelectItem key={ratio} value={ratio}>
                                <div className="flex items-center gap-2">
                                  {ratio === 'auto' ? (
                                    <Icon name="LuArrowLeftRight" className="h-3 w-3" />
                                  ) : (() => {
                                    const parts = ratio.split(':');
                                    const w = parseInt(parts[0]);
                                    const h = parseInt(parts[1]);
                                    if (!isNaN(w) && !isNaN(h) && w > 0) {
                                      const fixedW = 16;
                                      const fixedH = Math.round((fixedW * h) / w);
                                      return (
                                        <div
                                          className="border border-dashed border-muted-foreground/40"
                                          style={{ width: fixedW, height: fixedH }}
                                        />
                                      );
                                    }
                                    return null;
                                  })()}
                                  <span>{ratio}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {/* Generate Button */}
                  <Button 
                    onClick={() => {
                      if (!state.selectedStyle && styleOptions?.[0]) {
                        updateState({ selectedStyle: styleOptions[0].promptCode });
                      }
                      handleGenerate();
                    }}
                    disabled={!canGenerate}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="RiMagicLine" className="mr-2 h-4 w-4" />
                    {t('text_to_image.generate_image')}
                  </Button>
                </div>
              </div>

              {/* Result Section */}
              <div className="space-y-4" ref={resultRef}>
                <h3 className="text-lg font-semibold text-center">{textToImage.resultSection?.title}</h3>
                {!state.promptText ? (
                  <Card className="border-dashed border-2 border-muted-foreground/25 h-64">
                    <CardContent className="h-full flex items-center justify-center p-2 md:p-4">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Icon name="RiInputMethodLine" className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{textToImage.resultSection?.emptyMessage?.title}</h4>
                          <p className="text-sm text-muted-foreground">{textToImage.resultSection?.emptyMessage?.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : state.error ? (
                  <Card className="h-64 flex items-center justify-center border-red-200">
                    <CardContent className="flex-1 flex items-center justify-center p-2 md:p-4">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                          <Icon name="RiErrorWarningLine" className="h-8 w-8 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-600">生成失败</h4>
                          <p className="text-sm text-red-500 mt-2">{state.error}</p>
                        </div>
                        <Button
                          onClick={() => updateState({ error: null })}
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          重试
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : state.isProcessing ? (
                  <Card className="h-64 flex items-center justify-center">
                    <CardContent className="flex-1 flex items-center justify-center p-2 md:p-4">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Icon name="RiMagicLine" className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{textToImage.resultSection?.processingMessage?.title}</h4>
                          <p className="text-sm text-muted-foreground">{textToImage.resultSection?.processingMessage?.description}</p>
                        </div>
                        <div className="max-w-xs mx-auto">
                          <Progress value={state.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {state.progress}% {textToImage.progressTexts?.complete}
                          </p>
                          
                          {/* SSE连接状态指示器 */}
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              state.sseConnected ? "bg-green-500 animate-pulse" : "bg-orange-500"
                            )} />
                            <span className="text-xs text-muted-foreground">
                              {state.sseConnected ? '实时更新' : '估算进度'}
                            </span>
                          </div>
                          
                          {state.taskId && <p className="text-xs text-muted-foreground mt-1">{t('text_to_image.task_id')}: {state.taskId}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : state.processedImages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {state.processedImages.map((imageUrl, index) => (
                        <div key={index} className="relative w-full rounded-lg overflow-hidden border">
                          <Image
                            src={imageUrl || '/placeholder.svg'}
                            alt={`${t('text_to_image.generated_image_alt')} ${index + 1}`}
                            width={380}
                            height={380}
                            className="w-full h-auto object-contain"
                            sizes="(max-width: 480px) 90vw, (max-width: 768px) 70vw, (max-width: 1200px) 45vw, 380px"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDownload(imageUrl, index)}
                            >
                              <Icon name="RiDownloadLine" className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => updateState({
                          processedImages: [],
                          selectedStyle: null,
                        })}
                      >
                        {textToImage.resultSection?.tryAnotherButton?.title}
                      </Button>
                    </div>
                    {state.taskId && <p className="text-center text-xs text-muted-foreground">{t('text_to_image.task_id')}: {state.taskId}</p>}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-muted-foreground/25 h-64">
                    <CardContent className="h-full flex items-center justify-center p-2 md:p-4">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Icon name="RiPaletteLine" className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{textToImage.resultSection?.readyMessage?.title}</h4>
                          <p className="text-sm text-muted-foreground">{textToImage.resultSection?.readyMessage?.description}</p>
                          {state.selectedStyle && (
                            <Badge className="mt-2">
                              {styleOptions?.find(s => s.promptCode === state.selectedStyle)?.name} {textToImage.styleSelection?.selectedBadgeText}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Style Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="RiPaletteLine" className="h-5 w-5" />
              {textToImage.styleSelection?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {styleOptions?.map(style => (
                <Card
                  key={style.promptCode}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden border-2',
                    state.selectedStyle === style.promptCode && 'ring-2 ring-primary ring-offset-2 scale-105',
                    !state.promptText && 'opacity-75',
                    !state.promptText && state.selectedStyle === style.promptCode && 'opacity-100'
                  )}
                  onClick={() => handleStyleSelect(style.promptCode)}
                >
                  <CardContent className="p-2 md:p-4">
                    <div className="space-y-4">
                      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted">
                        <Image src={style.demoImageUrl} alt={style.name} fill className="object-cover" sizes="(max-width: 480px) 25vw, (max-width: 768px) 20vw, (max-width: 1200px) 15vw, 120px" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-sm">{style.name}</h3>
                      </div>
                      <Button
                        size="sm"
                        variant={state.selectedStyle === style.promptCode ? "default" : "outline"}
                        className="w-full"
                        disabled={state.loadingPrompt === style.promptCode}
                        onClick={e => {
                          e.stopPropagation();
                          handleStyleSelect(style.promptCode);
                        }}
                      >
                        {state.loadingPrompt === style.promptCode ? (
                          <div className="flex items-center gap-2">
                            <Loader />
                            <span className="text-xs">{t('text_to_image.loading')}</span>
                          </div>
                        ) : state.selectedStyle === style.promptCode ? (
                          t('text_to_image.selected')
                        ) : (
                          t('text_to_image.select_style')
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}