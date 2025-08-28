'use client';

import React, { useState, useEffect } from 'react';
import type { ColorTask } from '@/types/blocks/hair-color-changer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { getProgress } from '@/lib/progress';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ResultGridProps {
  tasks: ColorTask[];
  onDownload?: (task: ColorTask, taskIndex: number) => void;
  className?: string;
  onProgressUpdate?: (taskId: string, progress: number) => void;
}

export function ResultGrid({
  tasks,
  onDownload,
  className,
  onProgressUpdate,
}: ResultGridProps) {
  const t = useTranslations('hair_color_changer');
  const [localProgress, setLocalProgress] = useState<{[taskId: string]: number}>({});

  // Update progress for processing tasks
  useEffect(() => {
    const processingTasks = tasks.filter(task => 
      task.status === 'processing' && task.userMediaRecordId
    );

    if (processingTasks.length === 0) return;

    const updateProgress = () => {
      processingTasks.forEach(task => {
        if (task.userMediaRecordId) {
          const currentProgress = task.progress || localProgress[task.userMediaRecordId] || 0;
          const newProgress = getProgress(
            task.exeTime || 30,
            task.userMediaRecordId,
            currentProgress
          );
          
          setLocalProgress(prev => ({
            ...prev,
            [task.userMediaRecordId!]: newProgress
          }));

          if (onProgressUpdate && newProgress !== task.progress) {
            onProgressUpdate(task.userMediaRecordId, newProgress);
          }
        }
      });
    };

    updateProgress();
    const interval = setInterval(updateProgress, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [tasks, onProgressUpdate]);

  if (tasks.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-center space-y-2">
          <Icon name="RiMagicLine" className="h-8 w-8 text-muted-foreground mx-auto" />
          <div className="text-sm text-muted-foreground">
            {t('start_transformation', { count: 0 })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-700">
          {t('transformation_results')} ({tasks.length})
        </h4>
        {tasks.some(task => task.status === 'completed') && onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const completedTasks = tasks.filter(task => task.status === 'completed');
              if (completedTasks.length > 0 && onDownload) {
                onDownload(completedTasks[0], 0);
              }
            }}
            className="gap-2 text-xs"
          >
            <Icon name="RiDownloadLine" className="h-3 w-3" />
            {t('download_all')}
          </Button>
        )}
      </div>
      
      {/* 结果网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map((task, index) => (
          <div
            key={`${task.index}-${task.pickcolorUrl}`}
            className="w-full"
          >
                <div className="relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  {task.status === 'completed' && task.resultUrls?.[0] ? (
                    <>
                      <Image
                        src={task.resultUrls[0]}
                        alt={`Result ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {/* 下载按钮叠加 */}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors group">
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onDownload && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onDownload(task, index)}
                              className="rounded-full w-8 h-8 p-0"
                            >
                              <Icon name="RiDownloadLine" className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : task.status === 'processing' ? (
                    <div className="h-full bg-muted flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-20 h-20 mx-auto">
                          <AnimatedCircularProgressBar
                            value={task.progress || (task.userMediaRecordId ? localProgress[task.userMediaRecordId] || 0 : 0)}
                            max={100}
                            min={0}
                            gaugePrimaryColor="#f97316"
                            gaugeSecondaryColor="#fed7aa"
                            className="w-20 h-20"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('processing_with_progress', { 
                            progress: task.progress || (task.userMediaRecordId ? localProgress[task.userMediaRecordId] || 0 : 0) 
                          })}
                        </div>
                      </div>
                    </div>
                  ) : task.status === 'failed' ? (
                    <div className="h-full bg-red-50 flex items-center justify-center">
                      <div className="text-center space-y-1">
                        <Icon name="RiErrorWarningLine" className="h-4 w-4 text-red-500 mx-auto" />
                        <div className="text-xs text-red-600">{t('processing_failed')}</div>
                        <div className="text-xs text-red-500">{task.error || 'Task timeout or processing failed'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full bg-muted flex items-center justify-center">
                      <div className="text-center space-y-1">
                        <Icon name="RiTimeLine" className="h-4 w-4 text-muted-foreground mx-auto" />
                        <div className="text-xs text-muted-foreground">{t('waiting')}</div>
                      </div>
                    </div>
                  )}
                </div>
          </div>
        ))}
      </div>
    </div>
  );
}