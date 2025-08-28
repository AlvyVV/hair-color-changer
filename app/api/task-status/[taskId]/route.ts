import { respData, respErr } from '@/lib/resp';
import { headers } from 'next/headers';
import { apiClient } from '@/lib/api-client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return respErr('taskId is required');
    }

    // 构造请求头，透传 Authorization（若有）
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const h = await headers();
    const authHeader = h.get('Authorization');
    if (authHeader) {
      requestHeaders['Authorization'] = authHeader;
    }

    // 调用 vv-api 查询任务状态
    const response = await apiClient.get(`/user-media-records/${taskId}`, {
      headers: requestHeaders,
    });

    // 返回任务状态信息
    const taskData = response.data;
    const result = {
      userMediaRecordId: taskData.userMediaRecordId,
      status: taskData.status,
      progress: taskData.progress,
      resultUrls: taskData.resultUrls || taskData.urls || [],
      error: taskData.error,
      isCompleted: taskData.status === 'COMPLETED',
      isFailed: taskData.status === 'FAILED',
    };

    return respData(result);
  } catch (error) {
    console.error('查询任务状态失败:', error);
    return respErr('查询任务状态失败');
  }
}