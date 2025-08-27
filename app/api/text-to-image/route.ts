import {respData, respErr} from '@/lib/resp';
import {getPgWrapperClient} from '@/lib/db-wrapper';
import {headers} from 'next/headers';
import {apiClient} from '@/lib/api-client';
import {ItemGenerate} from '@/types/item/image-generate';

export async function POST(req: Request) {
    try {
        // 1. 解析请求参数
        const {code, promptText, n, aspectRatio} = await req.json();

        // 2. 查询 item_configs 获取 content 配置
        const pgClient = getPgWrapperClient();
        const {
            data: configData,
            error
        } = await pgClient.from('item_configs').select('content').eq('code', code).eq('project_id', process.env.PROJECT_ID).eq('is_deleted', false).single();
        if (error || !configData?.content) {
            console.error('config not found', error, configData);
            return respErr('config not found');
        }

        // 3. 处理 content 并注入 prompt
        let content: ItemGenerate = configData.content as ItemGenerate;
        content.aspectRatio = aspectRatio;

        content.aspectRatio = aspectRatio;
        content.n = n;
        content.prompt = promptText;
        // 4. 组装外部接口请求体
        const payload = {
            projectId: process.env.PROJECT_ID,
            aspectRatio: aspectRatio,
            creditCode: content.creditCode,
            bizCode: "DREAM-IMAGE",
            type: 'IMAGE',
            oriMeta: content,
        };

        console.log('payload', payload);
        // 5. 构造请求头，透传 Authorization（若有）
        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        const h = await headers();
        const authHeader = h.get('Authorization');
        if (authHeader) {
            requestHeaders['Authorization'] = authHeader;
        }

        // 6. 调用外部接口
        const resData = await apiClient.post('/user-media-records', payload, {
            headers: requestHeaders,
        });

        // 仅返回前端页面需要的字段，避免暴露多余信息
        const res = {
            userMediaRecordId: resData?.data?.userMediaRecordId,
            exeTime: content.exeTime,
        };

        return respData(res);
    } catch (e) {
        console.error('text-to-image error: ', e);
        return respErr('internal error');
    }
}