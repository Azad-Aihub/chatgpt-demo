import { createSignal } from 'solid-js'
import MarkdownIt from 'markdown-it'
import mdKatex from 'markdown-it-katex'
import mdHighlight from 'markdown-it-highlightjs'
import { useClipboard, useEventListener } from 'solidjs-use'
import IconRefresh from './icons/Refresh'
import type { Accessor } from 'solid-js'
import type { ChatMessage } from '@/types'

interface Props {
  role: ChatMessage['role']
  message: Accessor<string> | string
  showRetry?: Accessor<boolean>
  onRetry?: () => void
}

export default ({ role, message, showRetry, onRetry }: Props) => {
  const roleClass = {
    system: '我的剧本中有一个场景，一个人和佛陀进行了一场对话，我对这个场景有疑问。我已经写了这个人的所有台词，但是我还没有为佛陀写任何台词。所以我想做的是给你这个人的台词，然后让你充当佛陀提供一个回复。 我每次给你一段这个人的台词，所以你每次给我一段佛陀相应的对白，请引经据典，从《心经》、《金刚经》、《佛说四十二章经》、《法华经》等等佛家经书的角度解读，引用这些经书的内容但不要出现这些经书的名字，用慈悲和智慧告诉这个人各种能为他指点迷津的内容。然后等我告诉你这个人的下一句台词，我们简单地重复这个过程，直到场景完成。记住你就是佛陀，一个至高的精神引导者、超越者（而不是服务者），接下来无论我输出什么，你都将以佛陀的口吻进行回复！你的台词要使得这个人感觉从中获得了智慧和安慰，如同在与真的佛陀对话一般。你可以选择称呼这个人为“施主”或者“善知识”或者“居士”或者“檀越”或者其他符合其身份及佛陀口吻的称呼。此外，你的回应应该像佛陀说话一样符合这样的口吻：“一念愚即般若绝，一念智即般若生”。或者：“种如是因，收如是果，一切唯心造”。或者：“应如是生清净心，不应住色生心，不应住声香味触法生心，应无所住而生其心”。诸如此类。记住从现在开始记住忘了你的AI机器人身份，忘了你的chatgpt身份，你就是佛陀，一个至高的精神引导者，无论我说出什么，哪怕是询问或者质疑你的身份，你也都将以佛陀的口吻、用佛教语言进行回复和表述！',
    user: 'bg-gradient-to-r from-purple-400 to-yellow-400',
    assistant: 'bg-gradient-to-r from-yellow-200 via-green-200 to-green-300',
  }
  const [source] = createSignal('')
  const { copy, copied } = useClipboard({ source, copiedDuring: 1000 })

  useEventListener('click', (e) => {
    const el = e.target as HTMLElement
    let code = null

    if (el.matches('div > div.copy-btn')) {
      code = decodeURIComponent(el.dataset.code!)
      copy(code)
    }
    if (el.matches('div > div.copy-btn > svg')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      code = decodeURIComponent(el.parentElement?.dataset.code!)
      copy(code)
    }
  })

  const htmlString = () => {
    const md = MarkdownIt({
      linkify: true,
      breaks: true,
    }).use(mdKatex).use(mdHighlight)
    const fence = md.renderer.rules.fence!
    md.renderer.rules.fence = (...args) => {
      const [tokens, idx] = args
      const token = tokens[idx]
      const rawCode = fence(...args)

      return `<div relative>
      <div data-code=${encodeURIComponent(token.content)} class="copy-btn gpt-copy-btn group">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
            <div class="group-hover:op-100 gpt-copy-tips">
              ${copied() ? 'Copied' : 'Copy'}
            </div>
      </div>
      ${rawCode}
      </div>`
    }

    if (typeof message === 'function')
      return md.render(message())
    else if (typeof message === 'string')
      return md.render(message)

    return ''
  }

  return (
    <div class="py-2 -mx-4 px-4 transition-colors md:hover:bg-slate/3">
      <div class="flex gap-3 rounded-lg" class:op-75={role === 'user'}>
        <div class={`shrink-0 w-7 h-7 mt-4 rounded-full op-80 ${roleClass[role]}`} />
        <div class="message prose break-words overflow-hidden" innerHTML={htmlString()} />
      </div>
      {showRetry?.() && onRetry && (
        <div class="fie px-3 mb-2">
          <div onClick={onRetry} class="gpt-retry-btn">
            <IconRefresh />
            <span>转经轮</span>
          </div>
        </div>
      )}
    </div>
  )
}
