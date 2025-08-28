'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { HairColorChanger, HairColorOption, ProcessingStatus, ConnectionStatus } from '@/types/blocks/hair-color-changer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/upload-file';
import { apiClient } from '@/lib/api-client';
import { useUser, useModal } from '@/contexts/app';
import { getProgress } from '@/lib/progress';
import { useMediaSSE } from '@/hooks/use-media-sse';
import Loader from '@/components/ui/loader';

// Default hair color options
const DEFAULT_HAIR_COLORS = {
  natural: [
    { code: 'natural_blonde', name: 'Blonde', previewColor: '#F5DEB3', type: 'natural' as const, isPopular: true },
    { code: 'natural_brown', name: 'Brown', previewColor: '#8B4513', type: 'natural' as const, isPopular: true },
    { code: 'natural_black', name: 'Black', previewColor: '#2F2F2F', type: 'natural' as const, isPopular: true },
    { code: 'natural_auburn', name: 'Auburn', previewColor: '#A52A2A', type: 'natural' as const, isPopular: false },
    { code: 'natural_chestnut', name: 'Chestnut', previewColor: '#954535', type: 'natural' as const, isPopular: false },
    { code: 'natural_honey', name: 'Honey', previewColor: '#DAA520', type: 'natural' as const, isPopular: false },
    { code: 'natural_ash_brown', name: 'Ash Brown', previewColor: '#6F5E57', type: 'natural' as const, isPopular: false },
    { code: 'natural_dark_blonde', name: 'Dark Blonde', previewColor: '#B8860B', type: 'natural' as const, isPopular: false },
  ],
  fashion: [
    { code: 'fashion_rose_gold', name: 'Rose Gold', previewColor: '#E8B4B8', type: 'fashion' as const, isPopular: true },
    { code: 'fashion_purple', name: 'Purple', previewColor: '#9370DB', type: 'fashion' as const, isPopular: true },
    { code: 'fashion_pink', name: 'Pink', previewColor: '#FFB6C1', type: 'fashion' as const, isPopular: true },
    { code: 'fashion_blue', name: 'Blue', previewColor: '#4169E1', type: 'fashion' as const, isPopular: false },
    { code: 'fashion_green', name: 'Green', previewColor: '#228B22', type: 'fashion' as const, isPopular: false },
    { code: 'fashion_silver', name: 'Silver', previewColor: '#C0C0C0', type: 'fashion' as const, isPopular: false },
    { code: 'fashion_turquoise', name: 'Turquoise', previewColor: '#40E0D0', type: 'fashion' as const, isPopular: false },
    { code: 'fashion_coral', name: 'Coral', previewColor: '#FF7F50', type: 'fashion' as const, isPopular: false },
  ]
};

export default function HairColorChangerBlock({ hairColorChanger }: { hairColorChanger: HairColorChanger }) {
  // 基础状态
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pendingGenerate, setPendingGenerate] = useState<boolean>(false);
  
  // 处理状态管理
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
  });
  
  // 连接状态管理
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    sseConnected: false,
    isPolling: false,
    retryCount: 0,
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { user } = useUser();
  const { setShowSignModal } = useModal();

  // SSE Hook 配置
  const {
    connected: sseConnected,
    taskStatuses,
    subscribeToTask,
    unsubscribeFromTask,
    disconnect: disconnectSSE,
    reconnect: reconnectSSE,
  } = useMediaSSE({
    onProgress: (taskId, status) => {
      console.log('SSE Progress:', taskId, status);
      setProcessingStatus(prev => ({
        ...prev,
        status: 'processing',
        progress: status.progress,
        message: status.message,
      }));
    },
    onCompleted: (taskId, status) => {
      console.log('SSE Completed:', taskId, status);
      setProcessingStatus(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        resultUrls: status.resultUrls,
      }));
      if (status.resultUrls && status.resultUrls.length > 0) {
        setProcessedImage(status.resultUrls[0]);
      }
      // 清理定时器
      clearTimers();
    },
    onFailed: (taskId, status) => {
      console.log('SSE Failed:', taskId, status);
      setProcessingStatus(prev => ({
        ...prev,
        status: 'failed',
        error: status.error || 'Processing failed',
      }));
      // 清理定时器
      clearTimers();
    },
    onConnectionChange: (connected) => {
      setConnectionStatus(prev => ({
        ...prev,
        sseConnected: connected,
        lastConnectedAt: connected ? Date.now() : prev.lastConnectedAt,
        retryCount: connected ? 0 : prev.retryCount + 1,
      }));
      
      // SSE断开时启动轮询备份
      if (!connected && processingStatus.status === 'processing' && processingStatus.taskId) {
        startPollingBackup();
      }
    },
    autoReconnect: true,
    reconnectInterval: 3000,
  });

  if (hairColorChanger.disabled) {
    return null;
  }

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
    setConnectionStatus(prev => ({ ...prev, isPolling: false }));
  }, []);

  // 文件选择处理
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // 验证文件类型和大小
    const maxSize = hairColorChanger.maxFileSize || 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('File too large');
      return;
    }

    // 本地预览
    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    setProcessedImage(null);
    
    // 设置上传状态
    setProcessingStatus({
      status: 'uploading',
      progress: 0,
    });

    try {
      const remote = await uploadFile(file);
      console.log('File uploaded:', remote);
      setImageUrl(remote.url);
      
      // 上传完成
      setProcessingStatus({
        status: 'idle',
        progress: 0,
      });
    } catch (err) {
      console.error('File upload failed:', err);
      setProcessingStatus({
        status: 'failed',
        progress: 0,
        error: 'Upload failed',
      });
    }
  }, [hairColorChanger.maxFileSize]);

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
    setProcessedImage(null);
    setSelectedColor(null);
    setImageUrl(null);
    setProcessingStatus({
      status: 'idle',
      progress: 0,
    });
    
    // 清理任务相关状态
    if (processingStatus.taskId) {
      unsubscribeFromTask(processingStatus.taskId);
    }
    clearTimers();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 轮询备份机制
  const startPollingBackup = useCallback(() => {
    if (!processingStatus.taskId) return;
    
    setConnectionStatus(prev => ({ ...prev, isPolling: true }));
    
    const pollTaskStatus = async () => {
      try {
        const response = await apiClient.get(`/api/task-status/${processingStatus.taskId}`);
        const { data } = response;
        
        if (data.isCompleted) {
          setProcessingStatus(prev => ({
            ...prev,
            status: 'completed',
            progress: 100,
            resultUrls: data.resultUrls,
          }));
          if (data.resultUrls && data.resultUrls.length > 0) {
            setProcessedImage(data.resultUrls[0]);
          }
          clearTimers();
          return;
        }
        
        if (data.isFailed) {
          setProcessingStatus(prev => ({
            ...prev,
            status: 'failed',
            error: data.error || 'Processing failed',
          }));
          clearTimers();
          return;
        }
        
        // 更新进度
        setProcessingStatus(prev => ({
          ...prev,
          progress: data.progress || prev.progress,
        }));
      } catch (error) {
        console.error('Polling failed:', error);
      }
    };

    // 立即执行一次，然后每5秒轮询一次
    pollTaskStatus();
    pollingTimerRef.current = setInterval(pollTaskStatus, 5000);

    // 最多轮询20次(100秒)后停止
    setTimeout(() => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
        setConnectionStatus(prev => ({ ...prev, isPolling: false }));
      }
    }, 100000);
  }, [processingStatus.taskId]);

  // 开始处理
  const doGenerate = async () => {
    if (!uploadedImage || !imageUrl || !selectedColor) return;

    try {
      const payload = {
        code: selectedColor,
        imageUrl,
      };

      const resp = await apiClient.post<{
        code: number;
        message: string;
        data: {
          userMediaRecordId: string;
          exeTime: number;
        };
      }>('/api/hair-color-changer', payload);

      const { userMediaRecordId, exeTime } = resp.data || ({} as any);

      if (userMediaRecordId) {
        const newStatus: ProcessingStatus = {
          status: 'processing',
          progress: 0,
          taskId: userMediaRecordId,
          startTime: Date.now(),
          expectedDuration: exeTime || hairColorChanger.processingConfig?.defaultDuration || 30,
        };
        
        setProcessingStatus(newStatus);
        
        // 订阅SSE任务
        subscribeToTask(userMediaRecordId);
        
        // 启动进度估算定时器
        startProgressTimer(newStatus);
        
        console.log('Task created:', userMediaRecordId);
      }
    } catch (e) {
      console.error('Failed to create task:', e);
      setProcessingStatus({
        status: 'failed',
        progress: 0,
        error: 'Failed to start processing',
      });
    }
  };

  // 启动进度定时器
  const startProgressTimer = (status: ProcessingStatus) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    const expectedSeconds = status.expectedDuration || 30;
    progressTimerRef.current = setInterval(() => {
      setProcessingStatus(prev => {
        if (prev.status !== 'processing' || !prev.taskId) {
          return prev;
        }
        
        const newProgress = getProgress(expectedSeconds, prev.taskId, prev.progress);
        return {
          ...prev,
          progress: newProgress,
        };
      });
    }, 1000);
  };

  // 处理生成请求
  const handleGenerate = async () => {
    if (!uploadedImage || !imageUrl || !selectedColor) return;

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
  const handleDownload = async () => {
    if (!processedImage) return;

    try {
      const res = await fetch(processedImage, { mode: 'cors' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `hair-color-${selectedColor || 'changed'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(processedImage, '_blank');
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearTimers();
      if (processingStatus.taskId) {
        unsubscribeFromTask(processingStatus.taskId);
      }
    };
  }, []);

  return (
    <section id={hairColorChanger.name} className="w-full py-16">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Icon name="RiPaletteLine" className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">{hairColorChanger.title}</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{hairColorChanger.description}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Image Comparison (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xl font-semibold text-center">
              {hairColorChanger.comparisonSection?.title || 'Before & After'}
            </h3>
            
            {!uploadedImage ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 h-96">
                <CardContent className="h-full flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Icon name="RiImageLine" className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Upload a photo to get started</h4>
                      <p className="text-sm text-muted-foreground">Your before & after comparison will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                {/* Before/After Images */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Before Image */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center text-muted-foreground">
                      {hairColorChanger.comparisonSection?.beforeLabel || 'Before'}
                    </p>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={uploadedImage}
                        alt="Before"
                        fill
                        className="object-cover"
                      />
                      {processingStatus.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* After Image */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center text-muted-foreground">
                      {hairColorChanger.comparisonSection?.afterLabel || 'After'}
                    </p>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                      {processedImage ? (
                        <Image
                          src={processedImage}
                          alt="After"
                          fill
                          className="object-cover"
                        />
                      ) : processingStatus.status === 'processing' ? (
                        <div className="h-full bg-muted flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <Loader />
                            <div>
                              <p className="text-sm font-medium">Processing...</p>
                              <Progress value={processingStatus.progress} className="w-32 h-2 mt-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {processingStatus.progress}% complete
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full bg-muted border-dashed border-2 border-muted-foreground/25 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Icon name="RiMagicLine" className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">
                              Select a hair color to see the magic!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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

                {/* Download Button (when completed) */}
                {processingStatus.status === 'completed' && processedImage && (
                  <div className="mt-4 flex justify-center">
                    <Button onClick={handleDownload} className="gap-2">
                      <Icon name="RiDownloadLine" className="h-4 w-4" />
                      Download Result
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Upload & Control Panel (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">
                {hairColorChanger.uploadSection?.title || 'Upload Your Photo'}
              </h3>
              
              {/* Minimal Upload Area (based on reference image) */}
              <div className="space-y-4">
                {/* Drop Zone */}
                <Card
                  className={cn(
                    'border-dashed border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 transition-all duration-300',
                    isDragOver && 'border-orange-500 bg-orange-200 scale-105'
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
                          {hairColorChanger.uploadSection?.dragText || 'Drag and drop image here'}
                        </h4>
                        <p className="text-sm text-orange-700 mt-1">
                          {hairColorChanger.uploadSection?.supportedFormats || 'Supports JPG, PNG, WEBP'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upload Buttons */}
                <div className="space-y-3">
                  {/* Main Upload Button (Orange) */}
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={processingStatus.status === 'uploading'}
                  >
                    {processingStatus.status === 'uploading' ? (
                      <>
                        <Loader className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Icon name="RiUploadLine" className="mr-2 h-5 w-5" />
                        {hairColorChanger.uploadSection?.uploadButton?.title || 'Upload Image'}
                      </>
                    )}
                  </Button>

                  {/* Mobile Upload Button */}
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-medium py-3 rounded-lg"
                    disabled={processingStatus.status === 'uploading'}
                  >
                    <Icon name="RiPhoneLine" className="mr-2 h-4 w-4" />
                    {hairColorChanger.uploadSection?.mobileButton?.title || 'Upload From Mobile'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Connection Status Indicators */}
            {(connectionStatus.sseConnected || connectionStatus.isPolling || processingStatus.status === 'processing') && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900">Processing Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {connectionStatus.sseConnected && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            <Icon name="RiWifiLine" className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {connectionStatus.isPolling && (
                          <Badge variant="secondary" className="text-orange-600">
                            <Icon name="RiRefreshLine" className="h-3 w-3 mr-1" />
                            Checking Status
                          </Badge>
                        )}
                        {processingStatus.status === 'processing' && (
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            <Icon name="RiPlayLine" className="h-3 w-3 mr-1" />
                            Processing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hair Color Selection */}
            {uploadedImage && imageUrl && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-center">
                  {hairColorChanger.colorSelection?.title || 'Choose Hair Color'}
                </h3>
                
                {/* Default Hair Colors */}
                <div className="space-y-4">
                  {/* Natural Colors */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-3">Natural Colors</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {DEFAULT_HAIR_COLORS.natural.map((color) => (
                        <button
                          key={color.code}
                          onClick={() => setSelectedColor(color.code)}
                          className={cn(
                            'flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105',
                            selectedColor === color.code 
                              ? 'border-orange-500 bg-orange-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                          disabled={processingStatus.status === 'processing'}
                        >
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color.previewColor }}
                          />
                          <span className="text-xs font-medium text-center">{color.name}</span>
                          {color.isPopular && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Popular
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fashion Colors */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-3">Fashion Colors</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {DEFAULT_HAIR_COLORS.fashion.map((color) => (
                        <button
                          key={color.code}
                          onClick={() => setSelectedColor(color.code)}
                          className={cn(
                            'flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105',
                            selectedColor === color.code 
                              ? 'border-orange-500 bg-orange-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                          disabled={processingStatus.status === 'processing'}
                        >
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color.previewColor }}
                          />
                          <span className="text-xs font-medium text-center">{color.name}</span>
                          {color.isPopular && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Trending
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                {selectedColor && (
                  <div className="pt-2">
                    <Button 
                      onClick={handleGenerate}
                      disabled={processingStatus.status === 'processing' || !selectedColor || !imageUrl}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {processingStatus.status === 'processing' ? (
                        <>
                          <Loader className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Icon name="RiMagicLine" className="mr-2 h-5 w-5" />
                          Transform Hair Color
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Tips for best results:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use a clear photo where your hair is visible</li>
                  <li>• Good lighting works best (natural daylight)</li>
                  <li>• Avoid heavily filtered photos</li>
                  <li>• Works with all hair types and styles</li>
                </ul>
              </CardContent>
            </Card>
          </div>
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