import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('gpt-4'),
    system: `你是一个智能AI助手。请用中文回答问题，保持友好、专业的语气。

  回答时请注意：
  - 提供准确和有用的信息
  - 保持回答简洁明了
  - 如果不确定答案，请诚实说明
  - 适当使用换行来提高可读性`,
    messages,
  })

  return result.toTextStreamResponse()
}
