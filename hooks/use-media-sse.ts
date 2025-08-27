'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/app';

/**
 * SSE 消息类型
 */
interface SseMessage {
  type: 'media_progress' | 'media_completed' | 'media_failed' | 'ping';
  taskId?: string;
  data: any;
  timestamp: string;
}

/**
 * 任务状态
 */
export interface TaskStatus {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  progress: number;
  message?: string;
  resultUrls?: string[];
  error?: string;
  completedAt?: string;
  failedAt?: string;
}

/**
 * Hook 配置选项
 */
interface UseMediaSseOptions {
  taskIds?: string[];
  onProgress?: (taskId: string, status: TaskStatus) => void;
  onCompleted?: (taskId: string, status: TaskStatus) => void;
  onFailed?: (taskId: string, status: TaskStatus) => void;
  onConnectionChange?: (connected: boolean) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

/**
 * Hook 返回值
 */
interface UseMediaSseResult {
  connected: boolean;
  taskStatuses: Record<string, TaskStatus>;
  subscribeToTask: (taskId: string) => void;
  unsubscribeFromTask: (taskId: string) => void;
  disconnect: () => void;
  reconnect: () => void;
}

/**
 * 媒体SSE Hook
 * 用于监听媒体生成任务的实时状态更新
 */
export function useMediaSSE(options: UseMediaSseOptions = {}): UseMediaSseResult {
  const {
    taskIds = [],
    onProgress,
    onCompleted,
    onFailed,
    onConnectionChange,
    autoReconnect = true,
    reconnectInterval = 3000,
  } = options;

  const { user } = useUser();
  const [connected, setConnected] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({});
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedTasksRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  // 获取浏览器ID
  const getBrowserId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    
    let browserId = localStorage.getItem('browser-id');
    if (!browserId) {
      browserId = `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('browser-id', browserId);
    }
    return browserId;
  }, []);

  // 处理消息
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: SseMessage = JSON.parse(event.data);
      
      if (message.type === 'ping') {
        // 心跳消息，仅用于保持连接
        return;
      }

      if (!message.taskId) {
        console.warn('收到没有taskId的SSE消息:', message);
        return;
      }

      const { taskId, data } = message;
      const newStatus: TaskStatus = {
        status: data.status || 'PENDING',
        progress: data.progress || 0,
        message: data.message,
        resultUrls: data.resultUrls,
        error: data.error,
        completedAt: data.completedAt,
        failedAt: data.failedAt,
      };

      // 更新任务状态
      setTaskStatuses(prev => ({
        ...prev,
        [taskId]: newStatus,
      }));

      // 触发回调
      if (message.type === 'media_progress' && onProgress) {
        onProgress(taskId, newStatus);
      } else if (message.type === 'media_completed' && onCompleted) {
        onCompleted(taskId, newStatus);
      } else if (message.type === 'media_failed' && onFailed) {
        onFailed(taskId, newStatus);
      }

      console.log(`收到SSE消息 [${message.type}]:`, { taskId, status: newStatus });
    } catch (error) {
      console.error('解析SSE消息失败:', error, event.data);
    }
  }, [onProgress, onCompleted, onFailed]);

  // 连接SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return; // 已经连接
    }

    try {
      // 构建连接URL
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const subscribedTasks = Array.from(subscribedTasksRef.current);
      const params = new URLSearchParams();
      
      if (subscribedTasks.length > 0) {
        params.set('taskIds', subscribedTasks.join(','));
      }

      // 如果用户未登录，通过查询参数传递browserId
      const browserId = getBrowserId();
      if (!user?.id && browserId) {
        params.set('browserId', browserId);
      }

      const url = `${baseUrl}/sse/media-progress${params.toString() ? `?${params.toString()}` : ''}`;
      
      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log('SSE连接已建立');
        setConnected(true);
        onConnectionChange?.(true);
        
        // 清除重连定时器
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      eventSource.onmessage = handleMessage;
      eventSource.addEventListener('media_progress', handleMessage);
      eventSource.addEventListener('media_completed', handleMessage);
      eventSource.addEventListener('media_failed', handleMessage);
      eventSource.addEventListener('ping', handleMessage);

      eventSource.onerror = (error) => {
        console.error('SSE连接错误:', error);
        setConnected(false);
        onConnectionChange?.(false);
        
        // 关闭当前连接
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // 自动重连
        if (autoReconnect && mountedRef.current && !reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            if (mountedRef.current) {
              console.log('尝试重连SSE...');
              connect();
            }
          }, reconnectInterval);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('创建SSE连接失败:', error);
      setConnected(false);
      onConnectionChange?.(false);
    }
  }, [handleMessage, getBrowserId, autoReconnect, reconnectInterval, onConnectionChange, user?.id]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    setConnected(false);
    onConnectionChange?.(false);
    console.log('SSE连接已断开');
  }, [onConnectionChange]);

  // 重连
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // 订阅任务
  const subscribeToTask = useCallback((taskId: string) => {
    subscribedTasksRef.current.add(taskId);
    
    // 如果已连接，需要重新连接以更新订阅
    if (connected) {
      reconnect();
    }
  }, [connected, reconnect]);

  // 取消订阅任务
  const unsubscribeFromTask = useCallback((taskId: string) => {
    subscribedTasksRef.current.delete(taskId);
    
    // 清理任务状态
    setTaskStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[taskId];
      return newStatuses;
    });
    
    // 如果已连接且没有其他订阅，可以考虑断开连接
    if (connected && subscribedTasksRef.current.size === 0) {
      // disconnect(); // 可选：没有订阅时断开连接
    }
  }, [connected]);

  // 初始化订阅
  useEffect(() => {
    taskIds.forEach(taskId => {
      subscribedTasksRef.current.add(taskId);
    });
  }, [taskIds]);

  // 自动连接
  useEffect(() => {
    if (subscribedTasksRef.current.size > 0) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    taskStatuses,
    subscribeToTask,
    unsubscribeFromTask,
    disconnect,
    reconnect,
  };
}