'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { HairColorOption, ProcessingStatus, BatchProcessingStatus, ColorTask } from '@/types/blocks/hair-color-changer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/upload-file';
import { apiClient } from '@/lib/api-client';
import { useUser, useModal } from '@/contexts/app';
import { getProgress } from '@/lib/progress';
import { useTranslations } from 'next-intl';
import { ResultGrid } from './result-carousel';


export default function HairColorChangerBlock() {
  const t = useTranslations('hair_color_changer');
  
  // 基础状态
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [processedImages, setProcessedImages] = useState<{[taskId: string]: string}>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pendingGenerate, setPendingGenerate] = useState<boolean>(false);
  
  // 颜色选项状态
  const [hairColorOptions, setHairColorOptions] = useState<HairColorOption[]>([]);
  const [loadingColors, setLoadingColors] = useState<boolean>(true);
  
  // 进度条状态
  const [taskProgressMap, setTaskProgressMap] = useState<{[taskId: string]: number}>({});
  
  // 批量处理状态管理
  const [batchProcessingStatus, setBatchProcessingStatus] = useState<BatchProcessingStatus>({
    status: 'idle',
    tasks: [],
    totalTasks: 0,
    successfulTasks: 0,
    failedTasks: 0,
  });
  
  // 轮询状态管理
  const [isPolling, setIsPolling] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { user } = useUser();
  const { setShowSignModal } = useModal();



  // 加载颜色选项
  useEffect(() => {
    const loadHairColors = async () => {
      try {
        const response = await fetch('/hair-colors.json');
        const colors = await response.json();
        setHairColorOptions(colors);
      } catch (error) {
        console.error('Failed to load hair colors:', error);
      } finally {
        setLoadingColors(false);
      }
    };

    loadHairColors();
  }, []);

  // 清理所有定时器
  const clearTimers = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // 文件选择处理
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // 验证文件类型和大小
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('File too large');
      return;
    }

    // 本地预览
    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    setProcessedImages({});
    
    // 设置上传状态
    setBatchProcessingStatus({
      status: 'uploading',
      tasks: [],
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
    });

    try {
      const remote = await uploadFile(file);
      setImageUrl(remote.url);
      
      // 上传完成
      setBatchProcessingStatus({
        status: 'idle',
        tasks: [],
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
      });
    } catch (err) {
      console.error('File upload failed:', err);
      setBatchProcessingStatus({
        status: 'failed',
        tasks: [],
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
      });
    }
  }, []);

  // 文件上传事件
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 移除图片
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setProcessedImages({});
    setSelectedColors([]);
    setImageUrl(null);
    setBatchProcessingStatus({
      status: 'idle',
      tasks: [],
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
    });
    
    // 清理定时器
    clearTimers();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 轮询备份机制
  const startPollingBackup = useCallback((delayMs: number = 0, forcedTasks?: ColorTask[]) => {
    // 防止重复启动轮询
    if (isPolling && delayMs === 0) {
      console.log('轮询已在进行中，跳过重复启动');
      return;
    }
    
    // 使用传入的任务或当前状态中的任务
    const currentTasks = forcedTasks || batchProcessingStatus.tasks;
    
    console.log('检查轮询任务，当前任务数:', currentTasks.length);
    console.log('当前任务详情:', currentTasks);
    
    const processingTasks = currentTasks.filter(task => {
      const hasId = !!task.userMediaRecordId;
      const isSuccess = !!task.success;
      const isProcessing = task.status === 'pending' || task.status === 'processing';
      
      console.log(`任务 ${task.index}: userMediaRecordId=${hasId}, success=${isSuccess}, status=${task.status}, isProcessing=${isProcessing}`);
      
      return hasId && isSuccess && isProcessing;
    });
    
    if (processingTasks.length === 0) {
      console.log('没有需要轮询的任务，过滤后任务数:', processingTasks.length);
      console.log('所有任务状态:', currentTasks.map(t => `任务${t.index}: status=${t.status}, success=${t.success}, id=${!!t.userMediaRecordId}`));
      return;
    }
    
    console.log(`将在 ${delayMs}ms 后启动轮询备份，检查 ${processingTasks.length} 个任务`);
    
    // 如果有延迟，先等待
    const startPolling = () => {
      console.log('=== 开始启动轮询 ===');
      setIsPolling(true);
      
      const pollTaskStatus = async () => {
        console.log('=== 轮询函数执行 ===');
        try {
          // 优先使用传入的任务列表，如果没有或为空则从state获取最新状态
          let currentTasks: ColorTask[] = [];
          if (forcedTasks && forcedTasks.length > 0) {
            console.log('使用传入的任务列表 (forcedTasks)，任务数:', forcedTasks.length);
            currentTasks = [...forcedTasks]; // 复制一份，避免引用问题
          } else {
            console.log('从state获取最新任务列表');
            // 使用 Promise 来确保获取到最新状态
            await new Promise<void>((resolve) => {
              setBatchProcessingStatus(prev => {
                currentTasks = [...prev.tasks]; // 复制一份
                console.log('从state获取到的任务数:', prev.tasks.length);
                resolve();
                return prev;
              });
            });
          }
          
          console.log('轮询中检查任务，当前任务数:', currentTasks.length);
          
          const currentProcessingTasks = currentTasks.filter(task => {
            const hasId = !!task.userMediaRecordId;
            const isSuccess = !!task.success;
            const isProcessing = task.status === 'pending' || task.status === 'processing';
            
            console.log(`轮询任务 ${task.index}: userMediaRecordId=${hasId}, success=${isSuccess}, status=${task.status}`);
            
            return hasId && isSuccess && isProcessing;
          });
          
          if (currentProcessingTasks.length === 0) {
            console.log('轮询中：所有任务都已完成或失败，停止轮询');
            console.log('当前所有任务状态:', currentTasks.map(t => `任务${t.index}: status=${t.status}, success=${t.success}`));
            if (pollingTimerRef.current) {
              clearInterval(pollingTimerRef.current);
              pollingTimerRef.current = null;
              setIsPolling(false);
            }
            return;
          }
          
          console.log('开始轮询任务状态，任务数量:', currentProcessingTasks.length);
          console.log('准备轮询的任务列表:', currentProcessingTasks.map(t => ({ id: t.userMediaRecordId, index: t.index })));
          
          const taskPromises = currentProcessingTasks.map(async (task) => {
            console.log(`=== 开始处理任务 ${task.index}, ID: ${task.userMediaRecordId} ===`);
            if (!task.userMediaRecordId) {
              console.log('任务没有userMediaRecordId，跳过');
              return;
            }
            
            try {
              console.log('准备调用API:', `/api/task-status/${task.userMediaRecordId}`);
              const response = await apiClient.get(`/api/task-status/${task.userMediaRecordId}`);
              const { data } = response;
              console.log('API调用成功，响应数据:', task.userMediaRecordId, data);
              
              if (data.isCompleted) {
                console.log('轮询检测到任务完成:', task.userMediaRecordId, data);
                setBatchProcessingStatus(prev => {
                  const updatedTasks = prev.tasks.map(t => 
                    t.userMediaRecordId === task.userMediaRecordId
                      ? { ...t, status: 'completed' as const, progress: 100, resultUrls: data.resultUrls }
                      : t
                  );
                  
                  const completedTasks = updatedTasks.filter(task => task.status === 'completed').length;
                  const allCompleted = completedTasks === prev.totalTasks;
                  
                  return {
                    ...prev,
                    tasks: updatedTasks,
                    completedTasks,
                    status: allCompleted ? 'completed' : prev.status,
                  };
                });
                
                if (data.resultUrls && data.resultUrls.length > 0) {
                  setProcessedImages(prev => ({ ...prev, [task.userMediaRecordId!]: data.resultUrls[0] }));
                }
                return;
              }
              
              if (data.isFailed) {
                setBatchProcessingStatus(prev => {
                  const updatedTasks = prev.tasks.map(t => 
                    t.userMediaRecordId === task.userMediaRecordId
                      ? { ...t, status: 'failed' as const, error: data.error || 'Processing failed' }
                      : t
                  );
                  
                  const completedTasks = updatedTasks.filter(task => task.status === 'completed').length;
                  const failedTasks = updatedTasks.filter(task => task.status === 'failed').length;
                  const allDone = (completedTasks + failedTasks) === prev.totalTasks;
                  
                  return {
                    ...prev,
                    tasks: updatedTasks,
                    completedTasks,
                    failedTasks,
                    status: allDone ? 'completed' : prev.status,
                  };
                });
                return;
              }
              
              // 更新进度
              setBatchProcessingStatus(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => 
                  t.userMediaRecordId === task.userMediaRecordId
                    ? { ...t, progress: data.progress || t.progress }
                    : t
                ),
              }));
            } catch (error) {
              console.error(`=== API调用失败，任务 ${task.userMediaRecordId} ===`);
              console.error('错误详情:', error);
              console.error('错误类型:', typeof error);
              console.error('错误消息:', error instanceof Error ? error.message : 'Unknown error');
            }
          });

          console.log('=== 等待所有任务轮询完成 ===');
          await Promise.all(taskPromises);
          console.log('=== 本轮轮询完成 ===');
        } catch (error) {
          console.error('=== 批量轮询过程出错 ===');
          console.error('Batch polling failed:', error);
        }
      };

      // 立即执行一次，然后每2秒轮询一次
      console.log('=== 立即执行第一次轮询 ===');
      pollTaskStatus();
      console.log('=== 设置定时器，每2秒轮询 ===');
      pollingTimerRef.current = setInterval(pollTaskStatus, 2000);

      // 最多轮询50次(100秒)后停止
      setTimeout(() => {
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          setIsPolling(false);
        }
      }, 100000);
    };

    if (delayMs > 0) {
      console.log(`延迟 ${delayMs}ms 后开始轮询`);
      setTimeout(startPolling, delayMs);
    } else {
      startPolling();
    }
  }, [batchProcessingStatus.tasks, isPolling]);

  // 开始处理
  const doGenerate = async () => {
    if (!uploadedImage || !imageUrl || selectedColors.length === 0) return;

    try {
      // 将选中的颜色ID映射为对应的颜色图片URL
      const pickcolorUrls = selectedColors.map(colorId => {
        const colorOption = hairColorOptions.find(c => c.id === colorId);
        if (!colorOption) {
          throw new Error(`Color option not found: ${colorId}`);
        }
        // 返回完整的URL路径
        return `${window.location.origin}${colorOption.imageUrl}`;
      });

      const payload = {
        userImageUrl: imageUrl,
        pickcolorUrls,
      };

      const resp = await apiClient.post<{
        code: number;
        message: string;
        data: {
          tasks: ColorTask[];
          totalTasks: number;
          successfulTasks: number;
          failedTasks: number;
        };
      }>('/api/hair-color-changer', payload);

      const batchResult = resp.data || {} as any;

      if (batchResult.tasks && batchResult.tasks.length > 0) {
        // 为每个任务设置初始状态
        const tasksWithStatus = batchResult.tasks.map((task: ColorTask) => ({
          ...task,
          status: task.success ? 'pending' as const : 'failed' as const,
          progress: 0,
        }));
        
        console.log('创建任务完成，任务列表:', tasksWithStatus);

        const newBatchStatus: BatchProcessingStatus = {
          status: 'processing',
          tasks: tasksWithStatus,
          totalTasks: batchResult.totalTasks,
          successfulTasks: batchResult.successfulTasks,
          failedTasks: batchResult.failedTasks,
          completedTasks: 0,
          startTime: Date.now(),
        };
        
        setBatchProcessingStatus(newBatchStatus);
        
        // 获取预期时间（所有任务应该有相同的预期时间，取第一个任务的预期时间）
        const expectedTime = tasksWithStatus[0]?.exeTime || 30;
        console.log('任务预期完成时间:', expectedTime, '秒');
        
        // 在预期时间后开始轮询检查
        setTimeout(() => {
          console.log('达到预期时间，开始轮询检查任务状态');
          startPollingBackup(0, tasksWithStatus);
        }, expectedTime * 1000);
        
        // 设置超时机制，90秒后将未完成的任务标记为失败
        setTimeout(() => {
          console.log('任务超时检查，标记长时间未完成的任务为失败');
          setBatchProcessingStatus(prev => ({
            ...prev,
            tasks: prev.tasks.map(task => 
              (task.status === 'pending' || task.status === 'processing') 
                ? { ...task, status: 'failed' as const, error: 'Task timeout - processing took too long' }
                : task
            ),
          }));
        }, 90000); // 90秒超时
        
        console.log('Batch tasks created:', tasksWithStatus.length);
      }
    } catch (e) {
      console.error('Failed to create batch tasks:', e);
      setBatchProcessingStatus(prev => ({
        ...prev,
        status: 'failed',
      }));
    }
  };

  // 处理生成请求
  const handleGenerate = async () => {
    if (!uploadedImage || !imageUrl || selectedColors.length === 0) return;

    if (!user) {
      setPendingGenerate(true);
      setShowSignModal(true);
      return;
    }

    doGenerate();
  };

  // 监听用户登录状态
  useEffect(() => {
    if (pendingGenerate && user) {
      setPendingGenerate(false);
      doGenerate();
    }
  }, [user, pendingGenerate]);

  // 下载结果图片
  const handleDownload = async (task: ColorTask, taskIndex: number) => {
    const resultUrl = task.resultUrls?.[0];
    if (!resultUrl) return;

    try {
      const res = await fetch(resultUrl, { mode: 'cors' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `hair-color-result-${taskIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(resultUrl, '_blank');
    }
  };

  // 监听处理状态变化，智能启动轮询
  useEffect(() => {
    if (batchProcessingStatus.status !== 'processing' || !batchProcessingStatus.startTime) return;

    const timeElapsed = Date.now() - batchProcessingStatus.startTime;
    const processingTasks = batchProcessingStatus.tasks.filter(
      task => task.status === 'pending' || task.status === 'processing'
    );

    if (processingTasks.length === 0) return;

    // 获取预期时间（所有任务应该有相同的预期时间）
    const expectedTime = processingTasks[0]?.exeTime || 30;
    const expectedTimeMs = expectedTime * 1000;
    
    // 如果已经超过预期时间且还没开始轮询，立即开始
    if (timeElapsed >= expectedTimeMs && !isPolling) {
      console.log('任务超过预期时间且未在轮询，立即开始轮询检查');
      startPollingBackup();
    }
  }, [batchProcessingStatus.status, batchProcessingStatus.startTime, batchProcessingStatus.tasks, isPolling, startPollingBackup]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return (
    <section id="hair-color-changer" className="w-full py-8">
      <div className="container mx-auto space-y-8">

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 上传和展示区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 左侧：上传区域或上传后的图片 */}
            <div className="space-y-4">
              {!uploadedImage ? (
                <>
                  {/* Drop Zone */}
                  <Card
                    className={cn(
                      'border-dashed border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 transition-all duration-300 transform-gpu',
                      isDragOver && 'border-orange-500 bg-orange-200 scale-105 shadow-lg'
                    )}
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  >
                    <CardContent className="p-8">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                          <Icon name="RiUpload2Line" className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-900">
                            {t('upload_section.drag_text')}
                          </h4>
                          <p className="text-sm text-orange-700 mt-1">
                            {t('upload_section.supported_formats')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upload Button */}
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={batchProcessingStatus.status === 'uploading'}
                  >
                    {batchProcessingStatus.status === 'uploading' ? (
                      t('uploading')
                    ) : (
                      <>
                        <Icon name="RiUploadLine" className="mr-2 h-5 w-5" />
                        {t('upload_section.upload_button.title')}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {/* 上传后显示图片 */}
                  <div className="relative">
                    <div className="relative w-full min-h-80 rounded-lg overflow-hidden border shadow-lg">
                      <Image
                        src={uploadedImage}
                        alt="Uploaded Image"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-full h-auto object-contain"
                      />
                      {batchProcessingStatus.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-sm">{t('uploading')}</div>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Icon name="RiCloseLine" className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 生成按钮（替代上传按钮） */}
                  <Button
                    onClick={handleGenerate}
                    disabled={batchProcessingStatus.status === 'processing' || !imageUrl || selectedColors.length === 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {batchProcessingStatus.status === 'processing' ? (
                      t('processing_tasks_count', { count: batchProcessingStatus.tasks.length })
                    ) : !imageUrl ? (
                      <>
                        <Icon name="RiUploadLine" className="mr-2 h-5 w-5" />
                        {t('please_upload_first')}
                      </>
                    ) : selectedColors.length === 0 ? (
                      <>
                        <Icon name="RiPaletteLine" className="mr-2 h-5 w-5" />
                        {t('please_select_colors_first')}
                      </>
                    ) : (
                      <>
                        <Icon name="RiMagicLine" className="mr-2 h-5 w-5" />
                        {t('start_with_colors', { count: selectedColors.length })}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* 右侧：发色卡选择区域 */}
            <div className="space-y-4">
              <Card className="h-full">
                <CardContent className="p-4 h-full">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{t('select_hair_color')}</h3>
                      {selectedColors.length > 0 && (
                        <Badge variant="outline" className="text-orange-600">
                          {t('selected_colors', { count: selectedColors.length })}
                        </Badge>
                      )}
                    </div>
                    
                    {loadingColors ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-gray-500">{t('loading')}</div>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-6 gap-3">
                          {hairColorOptions.map((color) => (
                            <button
                              key={color.id}
                              onClick={() => {
                                setSelectedColors(prev => 
                                  prev.includes(color.id)
                                    ? prev.filter(c => c !== color.id)
                                    : [...prev, color.id]
                                );
                              }}
                              disabled={batchProcessingStatus.status === 'processing'}
                              className={cn(
                                'relative group rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden aspect-square transform-gpu',
                                selectedColors.includes(color.id)
                                  ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' 
                                  : 'border-gray-200 hover:border-orange-300 hover:shadow-md',
                                batchProcessingStatus.status === 'processing' && 'cursor-not-allowed'
                              )}
                              title={color.name}
                            >
                              <Image
                                src={color.imageUrl}
                                alt={color.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                              {selectedColors.includes(color.id) && (
                                <>
                                  <div className="absolute inset-0 bg-orange-500/20 rounded-lg" />
                                  <div className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                    <Icon name="RiCheckLine" className="h-2.5 w-2.5 text-white" />
                                  </div>
                                </>
                              )}
                              {color.isPopular && (
                                <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 结果展示区域（横向跑马灯） */}
          {uploadedImage && batchProcessingStatus.tasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{t('transformation_results')}</h3>
                <Badge variant="outline" className="text-green-600">
                  {t('completed_tasks', { 
                    completed: batchProcessingStatus.tasks.filter(t => t.status === 'completed').length,
                    total: batchProcessingStatus.tasks.length 
                  })}
                </Badge>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <ResultGrid
                  tasks={batchProcessingStatus.tasks}
                  onDownload={handleDownload}
                  className="min-h-64"
                  onProgressUpdate={(taskId, progress) => {
                    setBatchProcessingStatus(prev => ({
                      ...prev,
                      tasks: prev.tasks.map(task => 
                        task.userMediaRecordId === taskId
                          ? { ...task, progress }
                          : task
                      ),
                    }));
                  }}
                />
              </div>
            </div>
          )}
          

          {/* Connection Status Indicators */}
          {(isPolling || batchProcessingStatus.status === 'processing') && (
            <Card className="bg-blue-50 border-blue-200 mt-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">{t('processing_status')}</p>
                    <div className="flex gap-2 flex-wrap">
                      {isPolling && (
                        <Badge variant="secondary" className="text-orange-600">
                          <Icon name="RiRefreshLine" className="h-3 w-3 mr-1" />
                          {t('checking_status')}
                        </Badge>
                      )}
                      {batchProcessingStatus.status === 'processing' && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <Icon name="RiPlayLine" className="h-3 w-3 mr-1" />
                          {t('processing_tasks', { count: batchProcessingStatus.tasks.length })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gray-50 mt-6">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">{t('tips_title')}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {t.raw('tips').map((tip: string, index: number) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Hidden file input */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="hidden" 
        />
      </div>
    </section>
  );
}