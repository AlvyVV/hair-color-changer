import { respData, respErr } from '@/lib/resp';
import { headers } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import { ItemGenerate } from '@/types/item/image-generate';

export async function POST(req: Request) {
  try {
    // 1. 解析请求参数
    const { userImageUrl, pickcolorUrls, userId } = await req.json();
    if (!userImageUrl || !pickcolorUrls || !Array.isArray(pickcolorUrls) || pickcolorUrls.length === 0) {
      return respErr('invalid params: userImageUrl and pickcolorUrls array are required');
    }

    // 2. 构造请求头，透传 Authorization（若有）
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const h = await headers();
    const authHeader = h.get('Authorization');
    if (authHeader) {
      requestHeaders['Authorization'] = authHeader;
    }

    // 3. 批量创建任务
    const tasks = await Promise.all(
      pickcolorUrls.map(async (pickcolorUrl, index) => {
        try {
          // 构造默认的头发颜色转换配置
          const defaultContent: ItemGenerate = {
            modelProvider: 'gemini',
            model: 'gemini-2.5-flash-image-preview', // 生成模式：fast 或 standard
            code: 'HAIR_COLOR_BATCH',
            prompt: `Hair only; pick a swatch shade different from the original hair color and match it exactly. If the chosen shade equals the original, switch to an adjacent swatch. Preserve skin tones and hair texture; even coverage roots-to-tips; no spill; do not alter eyebrows, eyelashes, makeup, or background.`,
            urls: [userImageUrl, pickcolorUrl],
            exeTime: 20,
          };

          // 组装外部接口请求体
          const payload = {
            projectId: process.env.PROJECT_ID,
            userId: userId || undefined,
            creditCode: 'HAIR-COLOR-CHANGE',
            bizCode: 'HAIR_COLOR_BATCH',
            type: 'IMAGE',
            oriMeta: defaultContent,
          };

          console.log(`Creating task ${index + 1}:`, payload);

          // 调用外部接口
          const resData = await apiClient.post('/user-media-records', payload, {
            headers: requestHeaders,
          });

          return {
            userMediaRecordId: resData?.data?.userMediaRecordId,
            exeTime: defaultContent.exeTime,
            pickcolorUrl,
            index,
            success: true,
          };
        } catch (error) {
          console.error(`Task ${index + 1} failed:`, error);
          return {
            userMediaRecordId: null,
            exeTime: 30,
            pickcolorUrl,
            index,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    // 返回所有任务结果
    const res = {
      tasks,
      totalTasks: pickcolorUrls.length,
      successfulTasks: tasks.filter(task => task.success).length,
      failedTasks: tasks.filter(task => !task.success).length,
    };

    return respData(res);
  } catch (e) {
    console.error('hair-color-changer error: ', e);
    return respErr('internal error');
  }
}