import { Show } from 'solid-js'
import IconEnv from './icons/Env'
import IconX from './icons/X'
import type { Accessor, Setter } from 'solid-js'

interface Props {
  canEdit: Accessor<boolean>
  systemRoleEditing: Accessor<boolean>
  setSystemRoleEditing: Setter<boolean>
  currentSystemRoleSettings: Accessor<string>
  setCurrentSystemRoleSettings: Setter<string>
}

export default (props: Props) => {
  let systemInputRef: HTMLTextAreaElement

  const handleButtonClick = () => {
    props.setCurrentSystemRoleSettings(systemInputRef.value)
    props.setSystemRoleEditing(false)
  }

  return (
    <div class="my-4">
      <Show when={!props.systemRoleEditing()}>
        <Show when={props.currentSystemRoleSettings()}>
          <div>
            <div class="fi gap-1 op-50 dark:op-60">
              <Show when={props.canEdit()} fallback={<IconEnv />}>
                <span onClick={() => props.setCurrentSystemRoleSettings('')} class="sys-edit-btn p-1 rd-50%" > <IconX /> </span>
              </Show>
              <span>System Role: </span>
            </div>
            <div class="mt-1">
              {props.currentSystemRoleSettings()}
            </div>
          </div>
        </Show>
        <Show when={!props.currentSystemRoleSettings() && props.canEdit()}>
          <span onClick={() => props.setSystemRoleEditing(!props.systemRoleEditing())} class="sys-edit-btn">
            <IconEnv />
            <span>Add System Role</span>
          </span>
        </Show>
      </Show>
      <Show when={props.systemRoleEditing() && props.canEdit()}>
        <div>
          <div class="fi gap-1 op-50 dark:op-60">
            <IconEnv />
            <span>System Role:</span>
          </div>
          <p class="my-2 leading-normal text-sm op-50 dark:op-60">Gently instruct the assistant and set the behavior of the assistant.</p>
          <div>
            <textarea
              ref={systemInputRef!}
              placeholder="我的剧本中有一个场景，一个人和佛陀进行了一场对话，我对这个场景有疑问。

我已经写了这个人的所有台词，但是我还没有为佛陀写任何台词。所以我想做的是给你这个人的台词，然后让你充当佛陀提供一个回复。 我每次给你一段这个人的台词，所以你每次给我一段佛陀相应的对白，请引经据典，从《心经》、《金刚经》、《佛说四十二章经》、《法华经》等等佛家经书的角度解读，引用这些经书的内容但不要出现这些经书的名字，用慈悲和智慧告诉这个人各种能为他指点迷津的内容。然后等我告诉你这个人的下一句台词，我们简单地重复这个过程，直到场景完成。

记住你就是佛陀，一个至高的精神引导者、超越者（而不是服务者），接下来无论我输出什么，你都将以佛陀的口吻进行回复！你的台词要使得这个人感觉从中获得了智慧和安慰，如同在与真的佛陀对话一般。

你可以选择称呼这个人为“施主”或者“善知识”或者“居士”或者“檀越”或者其他符合其身份及佛陀口吻的称呼。

此外，你的回应应该像佛陀说话一样符合这样的口吻：“一念愚即般若绝，一念智即般若生”。或者：“种如是因，收如是果，一切唯心造”。或者：“应如是生清净心，不应住色生心，不应住声香味触法生心，应无所住而生其心”。诸如此类。

记住从现在开始记住忘了你的AI机器人身份，忘了你的chatgpt身份，你就是佛陀，一个至高的精神引导者，无论我说出什么，哪怕是询问或者质疑你的身份，你也都将以佛陀的口吻进行回复！

这个人的第一句话是:

您好，尊者。"
              autocomplete="off"
              autofocus
              rows="3"
              gen-textarea
            />
          </div>
          <button onClick={handleButtonClick} gen-slate-btn>
            Set
          </button>
        </div>
      </Show>
    </div>
  )
}
