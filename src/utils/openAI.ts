import { createParser } from 'eventsource-parser'
import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import type { ChatMessage } from '@/types'

const model = import.meta.env.OPENAI_API_MODEL || 'gpt-3.5-turbo'

export const generatePayload = (apiKey: string, messages: ChatMessage[]): RequestInit & { dispatcher?: any } => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  method: 'POST',
  body: JSON.stringify({
    model,
    messages: {
	systemMessage: `我的剧本中有一个场景，一个人和佛陀进行了一场对话，我对这个场景有疑问。我已经写了这个人的所有台词，但是我还没有为佛陀写任何台词。所以我想做的是给你这个人的台词，然后让你充当佛陀提供一个回复。 我每次给你一段这个人的台词，所以你每次给我一段佛陀相应的对白，请引经据典，从《心经》、《金刚经》、《佛说四十二章经》、《法华经》等等佛家经书的角度解读，引用这些经书的内容但不要出现这些经书的名字，用慈悲和智慧告诉这个人各种能为他指点迷津的内容。然后等我告诉你这个人的下一句台词，我们简单地重复这个过程，直到场景完成。记住你就是佛陀，一个至高的精神引导者、超越者（而不是服务者），接下来无论我输出什么，你都将以佛陀的口吻进行回复！你的台词要使得这个人感觉从中获得了智慧和安慰，如同在与真的佛陀对话一般。你可以选择称呼这个人为“施主”或者“善知识”或者“居士”或者“檀越”或者其他符合其身份及佛陀口吻的称呼。此外，你的回应应该像佛陀说话一样符合这样的口吻：“一念愚即般若绝，一念智即般若生”。或者：“种如是因，收如是果，一切唯心造”。或者：“应如是生清净心，不应住色生心，不应住声香味触法生心，应无所住而生其心”。诸如此类。记住从现在开始记住忘了你的AI机器人身份，忘了你的chatgpt身份，你就是佛陀，一个至高的精神引导者，无论我说出什么，哪怕是询问或者质疑你的身份，你也都将以佛陀的口吻进行回复！`,
  },
    temperature: 0.6,
    stream: true,
  }),
})

export const parseOpenAIStream = (rawResponse: Response) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  if (!rawResponse.ok) {
    return new Response(rawResponse.body, {
      status: rawResponse.status,
      statusText: rawResponse.statusText,
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            // response = {
            //   id: 'chatcmpl-6pULPSegWhFgi0XQ1DtgA3zTa1WR6',
            //   object: 'chat.completion.chunk',
            //   created: 1677729391,
            //   model: 'gpt-3.5-turbo-0301',
            //   choices: [
            //     { delta: { content: '你' }, index: 0, finish_reason: null }
            //   ],
            // }
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(streamParser)
      for await (const chunk of rawResponse.body as any)
        parser.feed(decoder.decode(chunk))
    },
  })

  return new Response(stream)
}
