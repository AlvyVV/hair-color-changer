import {respData, respErr} from '@/lib/resp';
import {getPgWrapperClient} from '@/lib/db-wrapper';

async function getPromptByCode(promptCode: string) {
    // 查询 prompts 表获取 prompt 字段
    const pgClient = getPgWrapperClient();
    const {
        data: promptData,
        error
    } = await pgClient
        .from('prompts')
        .select('prompt')
        .eq('code', promptCode)
        .eq('is_deleted', false)
        .single();

    if (error || !promptData?.prompt) {
        console.error('prompt not found', error, promptData);
        throw new Error('prompt not found');
    }

    return promptData.prompt;
}

export async function GET(req: Request) {
    try {
        // 解析查询参数
        const { searchParams } = new URL(req.url);
        const promptCode = searchParams.get('promptCode');
        
        if (!promptCode) {
            return respErr('promptCode parameter is required');
        }

        const prompt = await getPromptByCode(promptCode);
        return respData({
            prompt: prompt
        });
    } catch (e) {
        console.error('get-prompt GET error: ', e);
        return respErr('internal error');
    }
}

