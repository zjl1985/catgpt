import './style.css';
import { icon } from './icons';
import type { IconName } from './icons';
import { REPLY, escapeHtml, loadChats, readSetting, saveChats, writeSetting } from './store';
import type { Chat } from './store';

type Theme = 'light' | 'dark' | 'system';
type Model = 'instant' | 'thinking';

const app = document.querySelector<HTMLDivElement>('#app')!;
const avatar = (className = '') => `<img class="cat-avatar ${className}" src="/cat-avatar.gif" alt="CatGpt 眨眼猫" width="40" height="40" />`;
const actionButton = (name: IconName, label: string, action: string, extra = '') =>
  `<button class="icon-button" type="button" aria-label="${label}" title="${label}" data-action="${action}" ${extra}>${icon(name)}</button>`;

let chats = loadChats();
let activeId: string | null = readSetting('catgpt.active') || null;
if (!chats.some((chat) => chat.id === activeId)) activeId = null;
let temporary = false;
let temporaryChat: Chat | null = null;
let model: Model = 'instant';
let pendingId: string | null = null;
let replyTimer: ReturnType<typeof setTimeout> | undefined;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let theme = readSetting('catgpt.theme', 'system') as Theme;
if (!['light', 'dark', 'system'].includes(theme)) theme = 'system';
const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
const feedback = new Map<string, string>();

const prompts = [
  { icon: 'code' as const, label: '帮我写段代码', prompt: '帮我写一段改变世界的代码。', color: 'green' },
  { icon: 'pen' as const, label: '写点有趣的东西', prompt: '给我写一首关于猫咪的诗。', color: 'blue' },
  { icon: 'bulb' as const, label: '给我一点灵感', prompt: '今天不想上班，有什么好主意？', color: 'amber' },
  { icon: 'paw' as const, label: '听听猫的意见', prompt: '猫猫，你怎么看？', color: 'purple' },
];

app.innerHTML = `
  <a class="skip-link" href="#prompt">跳到输入框</a>
  <div class="app-shell" id="shell">
    <button class="sidebar-backdrop" aria-label="关闭侧栏" data-action="close-sidebar" tabindex="-1"></button>
    <aside class="sidebar" id="sidebar" aria-label="侧栏">
      <div class="sidebar-top">
        <button class="brand-home" data-action="new-chat" aria-label="CatGpt 新聊天">${avatar()}</button>
        <span class="sidebar-expanded sidebar-wordmark">CatGpt</span>
        <span class="sidebar-expanded">${actionButton('panel', '收起侧栏', 'toggle-sidebar')}</span>
      </div>
      <div class="sidebar-rail">
        ${actionButton('panel', '展开侧栏', 'toggle-sidebar')}
        ${actionButton('edit', '新聊天', 'new-chat')}
        ${actionButton('search', '搜索聊天', 'search')}
      </div>
      <div class="sidebar-expanded sidebar-content">
        <nav class="primary-nav" aria-label="主导航">
          <button class="nav-item" data-action="new-chat">${icon('edit')}<span>新聊天</span><kbd>⌘ ⇧ O</kbd></button>
          <button class="nav-item" data-action="search">${icon('search')}<span>搜索聊天</span><kbd>⌘ K</kbd></button>
          <button class="nav-item" data-action="inspiration">${icon('image')}<span>猫咪灵感</span><span class="new-badge">新</span></button>
        </nav>
        <div class="history-section">
          <h2 class="section-label">你的聊天</h2>
          <div id="history-list"></div>
        </div>
        <div class="sidebar-bottom">
          <div class="free-note">${icon('sparkles')}<div><strong>全部猫力，免费使用</strong><span>无需登录，也不用小鱼干</span></div></div>
          <button class="local-profile" data-action="settings">${avatar('profile-avatar')}<span><strong>本地小猫</strong><span>免费版 · 只在此设备保存</span></span>${icon('more')}</button>
        </div>
      </div>
      <div class="rail-bottom">${actionButton('sliders', '设置', 'settings')}</div>
    </aside>

    <main class="workspace" id="workspace">
      <header class="topbar">
        <div class="topbar-left">
          <span class="mobile-menu">${actionButton('panel', '打开侧栏', 'toggle-sidebar', 'aria-controls="sidebar" aria-expanded="false"')}</span>
          <button class="model-trigger" id="model-trigger" data-action="model" aria-haspopup="true" aria-expanded="false"><span>CatGpt</span>${icon('chevron')}</button>
        </div>
        <div class="topbar-right">
          <span class="feline-badge"><span></span>100% 猫工智能</span>
          ${actionButton('temporary', '临时聊天', 'temporary', 'id="temporary-button" aria-pressed="false"')}
          ${actionButton('sun', '切换深浅主题', 'toggle-theme', 'id="theme-button"')}
          <a class="icon-button github-link" href="https://github.com/zjl1985/catgpt" target="_blank" rel="noopener noreferrer" aria-label="在 GitHub 查看源码" title="在 GitHub 查看源码">${icon('github')}</a>
        </div>
      </header>

      <div class="chat-scroll" id="chat-scroll">
        <section class="welcome" id="welcome">
          <div class="welcome-cat">${avatar()}<span class="hello-bubble">喵？</span></div>
          <h1 id="welcome-title">有什么可以帮你喵的？</h1>
          <p id="welcome-subtitle">你尽管问，本喵自有回答。</p>
        </section>
        <section class="messages" id="messages" aria-label="聊天消息" aria-live="polite" aria-relevant="additions text"></section>
      </div>

      <div class="composer-dock">
        <div class="temporary-note" id="temporary-note" hidden>${icon('shield')}临时聊天不会保存在历史记录中</div>
        <form class="composer" id="composer">
          <label class="sr-only" for="prompt">发消息给 CatGpt</label>
          <textarea id="prompt" name="prompt" placeholder="向 CatGpt 发消息" rows="1" maxlength="10000" enterkeyhint="send"></textarea>
          <div class="composer-toolbar">
            <div class="composer-tools">
              ${actionButton('plus', '添加灵感', 'add', 'id="add-trigger" aria-haspopup="true" aria-expanded="false"')}
              <button class="tools-button" type="button" data-action="tools" id="tools-trigger" aria-haspopup="true" aria-expanded="false">${icon('sliders')}<span>工具</span></button>
              <span class="thinking-chip" id="thinking-chip" hidden>${icon('sparkles')}深度思喵<button type="button" data-action="clear-thinking" aria-label="关闭深度思喵">${icon('x')}</button></span>
            </div>
            <div class="composer-send">
              <span class="input-hint">Enter 发送</span>
              <button class="send-button" id="send-button" type="button" data-action="meow" aria-label="听一声喵" title="听一声喵">${icon('wave')}</button>
            </div>
          </div>
        </form>
        <div class="suggestions" id="suggestions">${prompts.map((prompt, index) => `<button class="suggestion" data-action="suggest" data-index="${index}">${icon(prompt.icon, prompt.color)}${prompt.label}</button>`).join('')}</div>
        <p class="composer-footer">CatGpt 的回答可能没什么用，但它尽力可爱了。<button data-action="about">关于 CatGpt</button></p>
      </div>
      <div class="home-bottom-label" id="home-bottom-label">没有大模型，只有小猫咪。</div>
      <button class="help-button" data-action="about" aria-label="关于 CatGpt" title="关于 CatGpt">?</button>
    </main>
  </div>
  <div class="popover" id="popover" hidden></div>
  <dialog id="dialog" aria-labelledby="dialog-title"></dialog>
  <div class="toast" id="toast" role="status"></div>
`;

const shell = document.querySelector<HTMLDivElement>('#shell')!;
const workspace = document.querySelector<HTMLElement>('#workspace')!;
const textarea = document.querySelector<HTMLTextAreaElement>('#prompt')!;
const form = document.querySelector<HTMLFormElement>('#composer')!;
const messageList = document.querySelector<HTMLElement>('#messages')!;
const chatScroll = document.querySelector<HTMLDivElement>('#chat-scroll')!;
const popover = document.querySelector<HTMLDivElement>('#popover')!;
const dialog = document.querySelector<HTMLDialogElement>('#dialog')!;
let returnFocus: HTMLElement | null = null;

function currentChat(): Chat | null {
  return temporary ? temporaryChat : chats.find((chat) => chat.id === activeId) ?? null;
}

function persist(): void {
  if (!saveChats(chats)) toast('浏览器存储空间不足，这次聊天仅在当前页面保留。');
  writeSetting('catgpt.active', activeId ?? '');
}

function applyTheme(): void {
  const dark = theme === 'dark' || (theme === 'system' && colorScheme.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#212121' : '#ffffff');
  document.querySelector('#theme-button')!.innerHTML = icon(dark ? 'moon' : 'sun');
}

function toast(text: string): void {
  const element = document.querySelector<HTMLDivElement>('#toast')!;
  element.textContent = text;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), 2600);
}

function renderHistory(): void {
  const historyList = document.querySelector('#history-list')!;
  const ordered = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
  historyList.innerHTML = ordered.length ? ordered.map((chat) => `
    <div class="history-row ${chat.id === activeId && !temporary ? 'active' : ''}">
      <button class="history-item" data-action="open-chat" data-id="${escapeHtml(chat.id)}" title="${escapeHtml(chat.title)}" ${chat.id === activeId && !temporary ? 'aria-current="true"' : ''}>${escapeHtml(chat.title)}</button>
      <button class="history-delete" data-action="delete-chat" data-id="${escapeHtml(chat.id)}" aria-label="删除聊天：${escapeHtml(chat.title)}" title="删除聊天">${icon('trash')}</button>
    </div>`).join('') : '<p class="history-empty">和小猫聊点什么吧。<br />你的聊天会出现在这里。</p>';
}

function renderMessages(): void {
  const chat = currentChat();
  const hasMessages = Boolean(chat?.messages.length);
  workspace.classList.toggle('has-chat', hasMessages);
  document.querySelector<HTMLElement>('#welcome')!.hidden = hasMessages;
  document.querySelector<HTMLElement>('#suggestions')!.hidden = hasMessages;
  document.querySelector<HTMLElement>('#home-bottom-label')!.hidden = hasMessages;
  document.querySelector<HTMLElement>('#temporary-note')!.hidden = !temporary;
  document.querySelector('#temporary-button')!.setAttribute('aria-pressed', String(temporary));
  document.querySelector('#welcome-title')!.textContent = temporary ? '悄悄话，也可以喵。' : '有什么可以帮你喵的？';
  document.querySelector('#welcome-subtitle')!.textContent = temporary ? '聊完就忘记，猫的记忆本来就不太好。' : '你尽管问，本喵自有回答。';
  messageList.innerHTML = chat?.messages.map((message) => {
    if (message.role === 'user') return `<article class="message user-message" aria-label="你"><div class="user-bubble">${escapeHtml(message.content)}</div></article>`;
    const pending = message.id === pendingId;
    return `<article class="message assistant-message" aria-label="CatGpt">
      <div class="assistant-avatar">${avatar()}</div>
      <div class="assistant-body">
        <div class="assistant-name">CatGpt${model === 'thinking' ? '<span>深度思喵</span>' : ''}</div>
        <div class="assistant-content" ${pending ? 'aria-label="小猫正在思考" aria-busy="true"' : ''}>${pending ? '<span class="typing-indicator"><i></i><i></i><i></i></span>' : REPLY}</div>
        ${pending ? '<div class="thinking-label">正在组织喵言喵语…</div>' : `<div class="message-actions">
          ${actionButton('copy', '复制回复', 'copy', `data-id="${escapeHtml(message.id)}"`)}
          ${actionButton('like', '好喵', 'like', `data-id="${escapeHtml(message.id)}" aria-pressed="${feedback.get(message.id) === 'like'}"`)}
          ${actionButton('dislike', '坏喵', 'dislike', `data-id="${escapeHtml(message.id)}" aria-pressed="${feedback.get(message.id) === 'dislike'}"`)}
          ${actionButton('wave', '朗读猫语', 'meow')}
          ${actionButton('retry', '重新生成', 'regenerate', `data-id="${escapeHtml(message.id)}"`)}
        </div>`}
      </div>
    </article>`;
  }).join('') ?? '';
  document.title = chat ? `${chat.title} - CatGpt` : 'CatGpt';
  updateComposer();
  requestAnimationFrame(() => { chatScroll.scrollTop = chatScroll.scrollHeight; });
}

function updateComposer(): void {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  const button = document.querySelector<HTMLButtonElement>('#send-button')!;
  button.type = pendingId ? 'button' : textarea.value.trim() ? 'submit' : 'button';
  button.dataset.action = pendingId ? 'stop' : textarea.value.trim() ? 'send' : 'meow';
  button.ariaLabel = pendingId ? '停止思考' : textarea.value.trim() ? '发送消息' : '听一声喵';
  button.title = button.ariaLabel;
  button.innerHTML = icon(pendingId ? 'stop' : textarea.value.trim() ? 'arrow' : 'wave');
  document.querySelector<HTMLElement>('#thinking-chip')!.hidden = model !== 'thinking';
  document.querySelector('#model-trigger > span')!.textContent = model === 'thinking' ? 'CatGpt Thinking' : 'CatGpt';
}

function finishReply(): void {
  clearTimeout(replyTimer);
  pendingId = null;
  renderMessages();
}

function submitMessage(value = textarea.value): void {
  const content = value.trim();
  if (!content || pendingId) return;
  closePopover();
  let chat = currentChat();
  if (!chat) {
    chat = { id: crypto.randomUUID(), title: content.replace(/\s+/g, ' ').slice(0, 40), messages: [], updatedAt: Date.now() };
    if (temporary) temporaryChat = chat;
    else {
      chats.unshift(chat);
      activeId = chat.id;
    }
  }
  const replyId = crypto.randomUUID();
  chat.messages.push(
    { id: crypto.randomUUID(), role: 'user', content },
    { id: replyId, role: 'assistant', content: REPLY },
  );
  chat.updatedAt = Date.now();
  pendingId = replyId;
  textarea.value = '';
  if (!temporary) persist();
  renderHistory();
  renderMessages();
  textarea.focus({ preventScroll: true });
  replyTimer = setTimeout(finishReply, model === 'thinking' ? 1800 : 650);
}

function closeSidebar(): void {
  shell.classList.remove('mobile-open');
  document.querySelector('.mobile-menu button')!.setAttribute('aria-expanded', 'false');
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.querySelector<HTMLElement>('#sidebar')!.inert = true;
  }
}

function syncSidebar(): void {
  document.querySelector<HTMLElement>('#sidebar')!.inert = window.matchMedia('(max-width: 767px)').matches && !shell.classList.contains('mobile-open');
}

function newChat(): void {
  finishReply();
  temporaryChat = null;
  activeId = null;
  textarea.value = '';
  if (!temporary) persist();
  closeSidebar();
  renderHistory();
  renderMessages();
  textarea.focus();
}

function openChat(id: string): void {
  if (!chats.some((chat) => chat.id === id)) return;
  finishReply();
  temporary = false;
  temporaryChat = null;
  activeId = id;
  textarea.value = '';
  persist();
  closeDialog();
  closeSidebar();
  renderHistory();
  renderMessages();
}

function closePopover(): void {
  popover.hidden = true;
  popover.replaceChildren();
  document.querySelectorAll('[aria-haspopup="true"]').forEach((element) => element.setAttribute('aria-expanded', 'false'));
}

function showPopover(anchor: HTMLElement, html: string, above = false): void {
  if (!popover.hidden && popover.dataset.anchor === anchor.id) {
    closePopover();
    return;
  }
  closePopover();
  popover.innerHTML = html;
  popover.hidden = false;
  popover.dataset.anchor = anchor.id;
  anchor.setAttribute('aria-expanded', 'true');
  const rect = anchor.getBoundingClientRect();
  const height = popover.offsetHeight;
  popover.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - popover.offsetWidth - 12))}px`;
  popover.style.top = `${Math.max(12, above ? rect.top - height - 10 : Math.min(rect.bottom + 8, window.innerHeight - height - 12))}px`;
  popover.querySelector<HTMLButtonElement>('button')?.focus();
}

function showDialog(title: string, content: string, className = ''): void {
  closePopover();
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.className = className;
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${title}</h2>${actionButton('x', '关闭弹窗', 'close-dialog')}</div>${content}`;
  if (!dialog.open) dialog.showModal();
}

function closeDialog(): void {
  if (dialog.open) dialog.close();
}

function searchChats(): void {
  showDialog('搜索聊天', `<div class="search-field">${icon('search')}<input id="chat-search" aria-label="搜索聊天内容" placeholder="搜索你的喵言喵语…" autocomplete="off" /></div><div id="search-results" class="search-results"></div>`, 'search-dialog');
  renderSearch('');
  document.querySelector<HTMLInputElement>('#chat-search')!.focus();
}

function renderSearch(query: string): void {
  const matches = chats.filter((chat) => `${chat.title} ${chat.messages.map((message) => message.content).join(' ')}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  document.querySelector('#search-results')!.innerHTML = matches.length ? matches.map((chat) => `<button class="search-result" data-action="open-chat" data-id="${escapeHtml(chat.id)}">${icon('edit')}<span><strong>${escapeHtml(chat.title)}</strong><span>${new Date(chat.updatedAt).toLocaleDateString('zh-CN')} · ${chat.messages.length / 2} 条对话</span></span>${icon('chevron')}</button>`).join('') : `<div class="dialog-empty">${icon('search')}<p>${query ? '没有找到这段猫咪记忆。' : '还没有聊天，先去和小猫打个招呼吧。'}</p></div>`;
}

function showSettings(): void {
  showDialog('设置', `<div class="settings-body">
    <div class="setting-row"><span>外观</span><select id="theme-select" aria-label="外观主题"><option value="system" ${theme === 'system' ? 'selected' : ''}>跟随系统</option><option value="light" ${theme === 'light' ? 'selected' : ''}>浅色</option><option value="dark" ${theme === 'dark' ? 'selected' : ''}>深色</option></select></div>
    <div class="setting-row"><span>导出聊天记录</span><button class="secondary-button" data-action="export">${icon('download')}导出</button></div>
    <div class="setting-row"><span>删除所有聊天记录</span><button class="secondary-button danger-text" data-action="confirm-clear">${icon('trash')}全部删除</button></div>
    <p class="settings-note">${icon('shield')}无需账号。聊天只保存在你的浏览器，不会发送到服务器。</p>
  </div>`);
}

function showAbout(): void {
  showDialog('关于 CatGpt', `<div class="about-content">${avatar()}<h3>人工智喵，认真敷衍。</h3><p>一个长得很熟悉、脑子很空的小猫聊天网站。<br />无论问什么，它只会回答：</p><div class="about-reply">${REPLY}</div><p class="about-small">纯前端 · 零 API · 无需登录<br />这是一个非官方趣味仿作，与 OpenAI 无关联。</p><a class="primary-button" href="https://github.com/zjl1985/catgpt" target="_blank" rel="noopener noreferrer">${icon('github')}GitHub 上摸摸猫</a></div>`);
}

function inspiration(): void {
  showDialog('今天想聊点什么？', `<p class="dialog-description">给小猫出个难题，看看它能有多敷衍。</p><div class="inspiration-grid">${prompts.map((prompt, index) => `<button data-action="use-prompt" data-index="${index}">${icon(prompt.icon, prompt.color)}<strong>${prompt.label}</strong><span>${prompt.prompt}</span></button>`).join('')}</div>`);
}

function setPrompt(index: number): void {
  const prompt = prompts[index];
  if (!prompt) return;
  closeDialog();
  closePopover();
  closeSidebar();
  textarea.value = prompt.prompt;
  updateComposer();
  textarea.focus();
}

async function copyReply(): Promise<void> {
  try {
    await navigator.clipboard.writeText(REPLY);
    toast('猫语已复制。');
  } catch {
    toast('复制暂不可用，可以直接选中猫语复制。');
  }
}

let audioContext: AudioContext | undefined;
async function meow(): Promise<void> {
  try {
    audioContext ??= new AudioContext();
    await audioContext.resume();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(680, now);
    oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.12);
    oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.65);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.72);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    toast(REPLY);
  } catch {
    toast(REPLY);
  }
}

function exportChats(): void {
  const blob = new Blob([JSON.stringify({ app: 'CatGpt', exportedAt: new Date().toISOString(), chats }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `catgpt-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('猫咪记忆已导出。');
}

app.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!target) return;
  const id = target.dataset.id ?? '';
  switch (target.dataset.action) {
    case 'new-chat': newChat(); break;
    case 'toggle-sidebar':
      if (window.matchMedia('(max-width: 767px)').matches) {
        shell.classList.toggle('mobile-open');
        document.querySelector('.mobile-menu button')!.setAttribute('aria-expanded', String(shell.classList.contains('mobile-open')));
        syncSidebar();
      } else shell.classList.toggle('sidebar-collapsed');
      break;
    case 'close-sidebar': closeSidebar(); break;
    case 'search': searchChats(); break;
    case 'open-chat': openChat(id); break;
    case 'delete-chat':
      showDialog('删除聊天？', `<p class="dialog-description">这段猫咪记忆将从当前浏览器删除，无法恢复。</p><div class="dialog-actions"><button class="secondary-button" data-action="close-dialog">取消</button><button class="danger-button" data-action="confirm-delete" data-id="${escapeHtml(id)}">删除</button></div>`);
      break;
    case 'confirm-delete':
      chats = chats.filter((chat) => chat.id !== id);
      if (activeId === id) { activeId = null; finishReply(); }
      persist(); closeDialog(); renderHistory(); renderMessages(); toast('这段聊天已删除。');
      break;
    case 'temporary':
      finishReply(); temporary = !temporary; temporaryChat = null; textarea.value = '';
      renderHistory(); renderMessages();
      toast(temporary ? '已开启临时聊天，不会保存历史。' : '已退出临时聊天。');
      break;
    case 'toggle-theme':
      theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      writeSetting('catgpt.theme', theme); applyTheme();
      break;
    case 'model':
      showPopover(target, `<div class="popover-label">选择猫咪模型</div><button class="model-option" data-action="set-model" data-model="instant">${icon('cat')}<span><strong>CatGpt</strong><small>快速回答，完全不动脑。</small></span>${model === 'instant' ? icon('check') : ''}</button><button class="model-option" data-action="set-model" data-model="thinking">${icon('sparkles')}<span><strong>CatGpt Thinking</strong><small>多想一会儿，答案还是喵。</small></span>${model === 'thinking' ? icon('check') : ''}</button>`);
      break;
    case 'set-model':
      model = target.dataset.model === 'thinking' ? 'thinking' : 'instant';
      closePopover(); updateComposer(); textarea.focus();
      break;
    case 'tools':
      showPopover(target, `<div class="popover-label">认真工作的工具</div><button data-action="set-model" data-model="thinking">${icon('sparkles')}深度思喵</button><button data-action="inspiration">${icon('bulb')}猫咪灵感</button>`, true);
      break;
    case 'add':
      showPopover(target, `<div class="popover-label">加一点猫咪灵感</div>${prompts.map((prompt, index) => `<button data-action="use-prompt" data-index="${index}">${icon(prompt.icon, prompt.color)}${prompt.label}</button>`).join('')}`, true);
      break;
    case 'clear-thinking': model = 'instant'; updateComposer(); break;
    case 'suggest': submitMessage(prompts[Number(target.dataset.index)]?.prompt); break;
    case 'use-prompt': setPrompt(Number(target.dataset.index)); break;
    case 'inspiration': inspiration(); break;
    case 'meow': void meow(); break;
    case 'stop': finishReply(); break;
    case 'copy': void copyReply(); break;
    case 'like':
    case 'dislike': {
      const value = target.dataset.action;
      feedback.set(id, feedback.get(id) === value ? '' : value);
      renderMessages();
      toast(value === 'like' ? '你的喜欢，小猫收到了。' : '收到。下次还是喵。');
      break;
    }
    case 'regenerate':
      if (pendingId) break;
      pendingId = id; renderMessages();
      replyTimer = setTimeout(finishReply, model === 'thinking' ? 1800 : 650);
      break;
    case 'settings': showSettings(); break;
    case 'about': showAbout(); break;
    case 'close-dialog': closeDialog(); break;
    case 'export': exportChats(); break;
    case 'confirm-clear':
      showDialog('删除所有聊天？', '<p class="dialog-description">所有保存在这个浏览器中的聊天记录都将被删除，无法恢复。</p><div class="dialog-actions"><button class="secondary-button" data-action="close-dialog">取消</button><button class="danger-button" data-action="clear-chats">删除所有聊天</button></div>');
      break;
    case 'clear-chats':
      chats = []; activeId = null; finishReply(); persist(); closeDialog(); renderHistory(); renderMessages(); toast('猫咪记忆已清空。');
      break;
  }
});

form.addEventListener('submit', (event) => { event.preventDefault(); submitMessage(); });
textarea.addEventListener('input', updateComposer);
textarea.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
    event.preventDefault();
    submitMessage();
  }
});
app.addEventListener('input', (event) => {
  if ((event.target as HTMLElement).id === 'chat-search') renderSearch((event.target as HTMLInputElement).value);
});
app.addEventListener('change', (event) => {
  if ((event.target as HTMLElement).id === 'theme-select') {
    theme = (event.target as HTMLSelectElement).value as Theme;
    writeSetting('catgpt.theme', theme); applyTheme();
  }
});
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (!popover.contains(target) && !target.closest('[aria-haspopup="true"]')) closePopover();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { closePopover(); closeSidebar(); }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault(); searchChats();
  }
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'o') {
    event.preventDefault(); closeDialog(); newChat();
  }
});
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
});
dialog.addEventListener('close', () => { if (returnFocus?.isConnected) returnFocus.focus(); });
colorScheme.addEventListener('change', () => { if (theme === 'system') applyTheme(); });
window.addEventListener('resize', () => {
  closePopover();
  syncSidebar();
  if (currentChat()) requestAnimationFrame(() => { chatScroll.scrollTop = chatScroll.scrollHeight; });
});

applyTheme();
syncSidebar();
renderHistory();
renderMessages();
