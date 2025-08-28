import { respData, respErr } from '@/lib/resp';
import { getPgWrapperClient } from '@/lib/db-wrapper';
import { headers } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import { ItemGenerate } from '@/types/item/image-generate';

export async function POST(req: Request) {
  try {
    // 1. 解析请求参数
    const { code, imageUrl, userId } = await req.json();
    if (!code || !imageUrl) {
      return respErr('invalid params');
    }

    // 2. 头发颜色映射到现有的style codes
    const hairColorMapping: Record<string, string> = {
      // Natural colors
      'natural_blonde': 'HAIR_BLONDE',
      'natural_brown': 'HAIR_BROWN', 
      'natural_black': 'HAIR_BLACK',
      'natural_auburn': 'HAIR_AUBURN',
      'natural_chestnut': 'HAIR_CHESTNUT',
      'natural_honey': 'HAIR_HONEY',
      'natural_ash_brown': 'HAIR_ASH_BROWN',
      'natural_dark_blonde': 'HAIR_DARK_BLONDE',
      
      // Fashion colors
      'fashion_rose_gold': 'HAIR_ROSE_GOLD',
      'fashion_purple': 'HAIR_PURPLE',
      'fashion_pink': 'HAIR_PINK',
      'fashion_blue': 'HAIR_BLUE',
      'fashion_green': 'HAIR_GREEN',
      'fashion_silver': 'HAIR_SILVER',
      'fashion_turquoise': 'HAIR_TURQUOISE',
      'fashion_coral': 'HAIR_CORAL',
    };

    const mappedCode = hairColorMapping[code] || 'HAIR_DEFAULT';

    // 3. 查询 item_configs 获取 content 配置
    const pgClient = getPgWrapperClient();
    const { data: configData, error } = await pgClient
      .from('item_configs')
      .select('content')
      .eq('code', mappedCode)
      .eq('project_id', process.env.PROJECT_ID)
      .eq('is_deleted', false)
      .single();

    if (error || !configData?.content) {
      // 如果没有找到特定配置，使用默认的图片风格转换配置
      console.warn(`Hair color config not found for ${mappedCode}, using default image style transfer`);
      
      // 构造默认的头发颜色转换配置
      const defaultContent: ItemGenerate = {
        type: 'IMAGE_STYLE_TRANSFER',
        prompt: `Transform the hair color to ${code.replace('_', ' ').replace('natural ', '').replace('fashion ', '')} while maintaining the original hairstyle and other features`,
        urls: [imageUrl],
        aspectRatio: '1:1',
        n: 1,
        exeTime: 30, // 30 seconds expected processing time
        promptCode: 'hair_color_transform_' + code,
      };

      // 4. 组装外部接口请求体
      const payload = {
        projectId: process.env.PROJECT_ID,
        userId: userId || undefined,
        creditCode: 'HAIR-COLOR-CHANGE',
        bizCode: mappedCode,
        type: 'IMAGE',
        oriMeta: defaultContent,
      };

      console.log('Using default payload:', payload);

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

      // 返回任务ID和预计时间
      const res = {
        userMediaRecordId: resData?.data?.userMediaRecordId,
        exeTime: defaultContent.exeTime,
      };

      return respData(res);
    }

    // 如果找到配置，按照原有逻辑处理
    let content: ItemGenerate = configData.content as ItemGenerate;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        return respErr('invalid content format');
      }
    }

    // 注入图片URL
    content.urls = [imageUrl];
    content.aspectRatio = content.aspectRatio || '1:1';
    content.n = content.n || 1;

    // 4. 组装外部接口请求体
    const payload = {
      projectId: process.env.PROJECT_ID,
      userId: userId || undefined,
      creditCode: 'HAIR-COLOR-CHANGE',
      bizCode: mappedCode,
      type: 'IMAGE',
      oriMeta: content,
    };

    console.log('Hair color payload:', payload);

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

    // 仅返回前端页面需要的字段
    const res = {
      userMediaRecordId: resData?.data?.userMediaRecordId,
      exeTime: content.exeTime || 30,
    };

    return respData(res);
  } catch (e) {
    console.error('hair-color-changer error: ', e);
    return respErr('internal error');
  }
}