import { NextRequest, NextResponse } from 'next/server';

/**
 * 任务状态查询 API 端点
 * 这是一个示例实现，用于模拟图片生成任务的状态查询
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    
    if (!taskId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Task ID is required'
        },
        { status: 400 }
      );
    }

    // 模拟任务状态 - 实际使用时应该查询真实的后端 API
    console.log('Querying task status for:', taskId);
    
    // 简单的模拟逻辑：根据任务ID的创建时间来模拟不同的状态
    const timestamp = parseInt(taskId.split('_')[1] || '0');
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - timestamp) / 1000);
    
    let mockStatus;
    
    if (elapsedSeconds < 10) {
      // 前10秒：处理中
      mockStatus = {
        userMediaRecordId: taskId,
        status: 'processing',
        progress: Math.min(Math.floor(elapsedSeconds * 5), 45), // 0-45%
        resultUrls: [],
        isCompleted: false,
        isFailed: false,
      };
    } else if (elapsedSeconds < 20) {
      // 10-20秒：继续处理
      mockStatus = {
        userMediaRecordId: taskId,
        status: 'processing',
        progress: Math.min(45 + Math.floor((elapsedSeconds - 10) * 5), 90), // 45-90%
        resultUrls: [],
        isCompleted: false,
        isFailed: false,
      };
    } else if (elapsedSeconds < 25) {
      // 20-25秒：完成
      mockStatus = {
        userMediaRecordId: taskId,
        status: 'completed',
        progress: 100,
        resultUrls: [
          // 使用示例图片URL，实际使用时应该是生成的图片URL
          'https://picsum.photos/512/512?random=' + Math.floor(Math.random() * 1000)
        ],
        isCompleted: true,
        isFailed: false,
      };
    } else {
      // 超过25秒：模拟失败
      mockStatus = {
        userMediaRecordId: taskId,
        status: 'failed',
        progress: 0,
        resultUrls: [],
        error: 'Task timeout or processing failed',
        isCompleted: false,
        isFailed: true,
      };
    }

    return NextResponse.json({
      status: 'success',
      data: mockStatus
    });
  } catch (error) {
    console.error('Task status query error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to query task status'
      },
      { status: 500 }
    );
  }
}