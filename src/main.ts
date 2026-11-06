import './style.css';
import { icon } from './icons';
import type { IconName } from './icons';
import { REPLY, escapeHtml, loadChats, readSetting, saveChats, writeSetting } from './store';
import type { Chat, Message } from './store';
import { getLanguage, getLanguagePreference, setLanguagePreference, t } from './i18n';
import type { LanguagePreference, TranslationKey } from './i18n';
import { catThought, createCatReply } from './meows';

type Theme = 'light' | 'dark' | 'system';
type Model = 'instant' | 'thinking';
type DialogView = 'search' | 'settings' | 'about' | 'inspiration' | 'delete-chat' | 'clear-chats';

const app = document.querySelector<HTMLDivElement>('#app')!;
const tr = (key: TranslationKey) => `<span data-i18n="${key}">${t(key)}</span>`;
const attr = (name: 'aria-label' | 'title' | 'placeholder' | 'alt', key: TranslationKey) =>
  `${name}="${escapeHtml(t(key))}" data-i18n-${name}="${key}"`;
const avatar = (className = '') => `<img class="cat-avatar ${className}" src="/cat-avatar.gif" ${attr('alt', 'catAvatar')} width="40" height="40" />`;
const actionButton = (name: IconName, key: TranslationKey, action: string, extra = '') =>
  `<button class="icon-button" type="button" ${attr('aria-label', key)} ${attr('title', key)} data-action="${action}" ${extra}>${icon(name)}</button>`;

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

function localizedPrompts() {
  return [
    { icon: 'code' as const, label: t('promptCodeLabel'), prompt: t('promptCode'), color: 'green' },
    { icon: 'pen' as const, label: t('promptWriteLabel'), prompt: t('promptWrite'), color: 'blue' },
    { icon: 'bulb' as const, label: t('promptIdeasLabel'), prompt: t('promptIdeas'), color: 'amber' },
    { icon: 'paw' as const, label: t('promptCatLabel'), prompt: t('promptCat'), color: 'purple' },
  ];
}
let prompts = localizedPrompts();

function suggestionButtons(): string {
  return prompts.map((prompt, index) => `<button class="suggestion" data-action="suggest" data-index="${index}">${icon(prompt.icon, prompt.color)}<span class="suggestion-label">${prompt.label}</span></button>`).join('');
}

app.innerHTML = `
  <a class="skip-link" href="#prompt">${tr('skipToInput')}</a>
  <div class="app-shell" id="shell">
    <button class="sidebar-backdrop" ${attr('aria-label', 'closeSidebar')} data-action="close-sidebar" tabindex="-1"></button>
    <aside class="sidebar" id="sidebar" ${attr('aria-label', 'sidebar')}>
      <div class="sidebar-top">
        <button class="brand-home" data-action="new-chat" ${attr('aria-label', 'brandNewChat')}>${avatar()}</button>
        <span class="sidebar-expanded sidebar-wordmark">CatGpt</span>
        <span class="sidebar-expanded">${actionButton('panel', 'collapseSidebar', 'toggle-sidebar')}</span>
      </div>
      <div class="sidebar-rail">
        ${actionButton('panel', 'expandSidebar', 'toggle-sidebar')}
        ${actionButton('edit', 'newChat', 'new-chat')}
        ${actionButton('search', 'searchChats', 'search')}
      </div>
      <div class="sidebar-expanded sidebar-content">
        <nav class="primary-nav" ${attr('aria-label', 'navigation')}>
          <button class="nav-item" data-action="new-chat">${icon('edit')}${tr('newChat')}<kbd>⌘ ⇧ O</kbd></button>
          <button class="nav-item" data-action="search">${icon('search')}${tr('searchChats')}<kbd>⌘ K</kbd></button>
          <button class="nav-item" data-action="inspiration">${icon('image')}${tr('inspiration')}<span class="new-badge" data-i18n="newBadge">${t('newBadge')}</span></button>
        </nav>
        <div class="history-section">
          <h2 class="section-label" data-i18n="yourChats">${t('yourChats')}</h2>
          <div id="history-list"></div>
        </div>
        <div class="sidebar-bottom">
          <div class="free-note">${icon('sparkles')}<div><strong data-i18n="allPurrFree">${t('allPurrFree')}</strong><span data-i18n="noLoginFish">${t('noLoginFish')}</span></div></div>
          <button class="local-profile" data-action="settings">${avatar('profile-avatar')}<span><strong data-i18n="guestCat">${t('guestCat')}</strong><span data-i18n="localPlan">${t('localPlan')}</span></span>${icon('more')}</button>
        </div>
      </div>
      <div class="rail-bottom">${actionButton('sliders', 'settings', 'settings')}</div>
    </aside>

    <main class="workspace" id="workspace">
      <header class="topbar">
        <div class="topbar-left">
          <span class="mobile-menu">${actionButton('panel', 'openSidebar', 'toggle-sidebar', 'aria-controls="sidebar" aria-expanded="false"')}</span>
          <button class="model-trigger" id="model-trigger" data-action="model" aria-haspopup="true" aria-expanded="false"><span>CatGpt</span>${icon('chevron')}</button>
        </div>
        <div class="topbar-right">
          <span class="feline-badge"><i></i>${tr('felineAI')}</span>
          <button class="language-toggle" id="language-toggle" data-action="toggle-language" ${attr('aria-label', 'switchLanguage')} ${attr('title', 'switchLanguage')}>${getLanguage() === 'zh-CN' ? 'EN' : '中'}</button>
          ${actionButton('temporary', 'temporaryChat', 'temporary', 'id="temporary-button" aria-pressed="false"')}
          ${actionButton('sun', 'toggleTheme', 'toggle-theme', 'id="theme-button"')}
          <a class="icon-button github-link" href="https://github.com/zjl1985/catgpt" target="_blank" rel="noopener noreferrer" ${attr('aria-label', 'githubSource')} ${attr('title', 'githubSource')}>${icon('github')}</a>
        </div>
      </header>

      <div class="chat-scroll" id="chat-scroll">
        <section class="welcome" id="welcome">
          <div class="welcome-cat">${avatar()}<span class="hello-bubble" data-i18n="hello">${t('hello')}</span></div>
          <h1 id="welcome-title">${t('welcomeTitle')}</h1>
          <p id="welcome-subtitle">${t('welcomeSubtitle')}</p>
        </section>
        <section class="messages" id="messages" ${attr('aria-label', 'chatMessages')} aria-live="polite" aria-relevant="additions text"></section>
      </div>

      <div class="composer-dock">
        <div class="temporary-note" id="temporary-note" hidden>${icon('shield')}${tr('temporaryNote')}</div>
        <form class="composer" id="composer">
          <label class="sr-only" for="prompt" data-i18n="messageLabel">${t('messageLabel')}</label>
          <textarea id="prompt" name="prompt" ${attr('placeholder', 'messagePlaceholder')} rows="1" maxlength="10000" enterkeyhint="send"></textarea>
          <div class="composer-toolbar">
            <div class="composer-tools">
              ${actionButton('plus', 'addInspiration', 'add', 'id="add-trigger" aria-haspopup="true" aria-expanded="false"')}
              <button class="tools-button" type="button" data-action="tools" id="tools-trigger" aria-haspopup="true" aria-expanded="false">${icon('sliders')}${tr('tools')}</button>
              <span class="thinking-chip" id="thinking-chip" hidden>${icon('sparkles')}${tr('deepThinking')}<button type="button" data-action="clear-thinking" ${attr('aria-label', 'closeThinking')}>${icon('x')}</button></span>
            </div>
            <div class="composer-send">
              <span class="input-hint" data-i18n="enterSend">${t('enterSend')}</span>
              <button class="send-button" id="send-button" type="button" data-action="meow" aria-label="${t('hearMeow')}" title="${t('hearMeow')}">${icon('wave')}</button>
            </div>
          </div>
        </form>
        <div class="suggestions" id="suggestions">${suggestionButtons()}</div>
        <p class="composer-footer">${tr('footerText')}<button data-action="about" data-i18n="about">${t('about')}</button></p>
      </div>
      <div class="home-bottom-label" id="home-bottom-label" data-i18n="homeTagline">${t('homeTagline')}</div>
      <button class="help-button" data-action="about" ${attr('aria-label', 'about')} ${attr('title', 'about')}>?</button>
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

function applyLanguage(): void {
  const scrollTop = chatScroll.scrollTop;
  const atBottom = chatScroll.scrollHeight - scrollTop - chatScroll.clientHeight < 40;
  const focusedId = document.activeElement?.id;
  document.documentElement.lang = getLanguage();
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n as TranslationKey);
  });
  for (const name of ['aria-label', 'title', 'placeholder', 'alt'] as const) {
    document.querySelectorAll(`[data-i18n-${name}]`).forEach((element) => {
      element.setAttribute(name, t(element.getAttribute(`data-i18n-${name}`) as TranslationKey));
    });
  }
  document.querySelector('#language-toggle')!.textContent = getLanguage() === 'zh-CN' ? 'EN' : '中';
  for (const [selector, key] of [
    ['meta[name="description"]', 'metaDescription'],
    ['meta[property="og:title"]', 'ogTitle'],
    ['meta[property="og:description"]', 'ogDescription'],
  ] as const) document.querySelector(selector)?.setAttribute('content', t(key));
  prompts = localizedPrompts();
  document.querySelector('#suggestions')!.innerHTML = suggestionButtons();
  closePopover();
  renderHistory();
  renderMessages(false);
  if (dialog.open) {
    switch (dialog.dataset.view as DialogView) {
      case 'settings': showSettings(); break;
      case 'about': showAbout(); break;
      case 'inspiration': inspiration(); break;
      case 'delete-chat': confirmDeleteChat(dialog.dataset.chatId ?? ''); break;
      case 'clear-chats': confirmClearChats(); break;
      case 'search': {
        const query = document.querySelector<HTMLInputElement>('#chat-search')!.value;
        searchChats();
        document.querySelector<HTMLInputElement>('#chat-search')!.value = query;
        renderSearch(query);
        break;
      }
    }
  }
  if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
  requestAnimationFrame(() => { chatScroll.scrollTop = atBottom ? chatScroll.scrollHeight : scrollTop; });
}

function changeLanguage(preference: LanguagePreference): void {
  setLanguagePreference(preference);
  applyLanguage();
  toast(t('languageChanged'));
}

function currentChat(): Chat | null {
  return temporary ? temporaryChat : chats.find((chat) => chat.id === activeId) ?? null;
}

function persist(): void {
  if (!saveChats(chats)) toast(t('storageFull'));
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
      <button class="history-delete" data-action="delete-chat" data-id="${escapeHtml(chat.id)}" aria-label="${t('deleteChatLabel', { title: escapeHtml(chat.title) })}" title="${t('deleteChatTooltip')}">${icon('trash')}</button>
    </div>`).join('') : `<p class="history-empty">${t('emptyHistoryIntro')}<br />${t('emptyHistoryHint')}</p>`;
}

function renderMessages(scrollToBottom = true): void {
  const chat = currentChat();
  const hasMessages = Boolean(chat?.messages.length);
  workspace.classList.toggle('has-chat', hasMessages);
  document.querySelector<HTMLElement>('#welcome')!.hidden = hasMessages;
  document.querySelector<HTMLElement>('#suggestions')!.hidden = hasMessages;
  document.querySelector<HTMLElement>('#home-bottom-label')!.hidden = hasMessages;
  document.querySelector<HTMLElement>('#temporary-note')!.hidden = !temporary;
  document.querySelector('#temporary-button')!.setAttribute('aria-pressed', String(temporary));
  document.querySelector('#welcome-title')!.textContent = t(temporary ? 'tempWelcomeTitle' : 'welcomeTitle');
  document.querySelector('#welcome-subtitle')!.textContent = t(temporary ? 'tempWelcomeSubtitle' : 'welcomeSubtitle');
  messageList.innerHTML = chat?.messages.map((message) => {
    if (message.role === 'user') return `<article class="message user-message" aria-label="${t('you')}"><div class="user-bubble">${escapeHtml(message.content)}</div></article>`;
    const pending = message.id === pendingId;
    const thought = catThought(message.thoughtId, getLanguage());
    return `<article class="message assistant-message" aria-label="CatGpt">
      <div class="assistant-avatar ${message.drinking ? 'drinking-avatar' : ''}">${avatar()}${message.drinking ? '<span aria-hidden="true">🍺</span>' : ''}</div>
      <div class="assistant-body">
        <div class="assistant-name">CatGpt${message.drinking ? `<span class="beer-badge">${t('beerMoment')}</span>` : ''}</div>
        ${!pending && message.thinking ? `<p class="thought-result">${thought.done}</p>` : ''}
        <div class="assistant-content" ${pending ? `aria-label="${t('thinkingAria')}" aria-busy="true"` : ''}>${pending ? '<span class="typing-indicator"><i></i><i></i><i></i></span>' : escapeHtml(message.content)}</div>
        ${pending ? `<div class="thinking-label">${message.thinking ? thought.pending : t('thinkingLabel')}</div>` : `<div class="message-actions">
          ${actionButton('copy', 'copyReply', 'copy', `data-id="${escapeHtml(message.id)}"`)}
          ${actionButton('like', 'goodMeow', 'like', `data-id="${escapeHtml(message.id)}" aria-pressed="${feedback.get(message.id) === 'like'}"`)}
          ${actionButton('dislike', 'badMeow', 'dislike', `data-id="${escapeHtml(message.id)}" aria-pressed="${feedback.get(message.id) === 'dislike'}"`)}
          ${actionButton('wave', 'readMeow', 'meow', `data-id="${escapeHtml(message.id)}"`)}
          ${actionButton('retry', 'regenerate', 'regenerate', `data-id="${escapeHtml(message.id)}"`)}
        </div>`}
      </div>
    </article>`;
  }).join('') ?? '';
  document.title = chat ? `${chat.title} - CatGpt` : 'CatGpt';
  updateComposer();
  if (scrollToBottom) requestAnimationFrame(() => { chatScroll.scrollTop = chatScroll.scrollHeight; });
}

function updateComposer(): void {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  const button = document.querySelector<HTMLButtonElement>('#send-button')!;
  button.type = pendingId ? 'button' : textarea.value.trim() ? 'submit' : 'button';
  button.dataset.action = pendingId ? 'stop' : textarea.value.trim() ? 'send' : 'meow';
  button.ariaLabel = t(pendingId ? 'stopThinking' : textarea.value.trim() ? 'sendMessage' : 'hearMeow');
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

function createAssistantMessage(chat: Chat, input: string, beforeIndex = chat.messages.length): Message {
  const previous = chat.messages.slice(0, beforeIndex);
  const recentReplies = chat.messages.filter((message) => message.role === 'assistant');
  const reply = createCatReply({
    input, language: getLanguage(),
    previousPrompts: previous.filter((message) => message.role === 'user').map((message) => message.content),
    recentReplies: recentReplies.map((message) => message.content),
    previousWasDrinking: recentReplies.at(-1)?.drinking,
  });
  return {
    id: crypto.randomUUID(), role: 'assistant', content: reply.content,
    replyId: reply.id, drinking: reply.drinking,
    thinking: model === 'thinking', thoughtId: reply.thoughtId,
  };
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
  const reply = createAssistantMessage(chat, content);
  chat.messages.push(
    { id: crypto.randomUUID(), role: 'user', content },
    reply,
  );
  chat.updatedAt = Date.now();
  pendingId = reply.id;
  textarea.value = '';
  if (!temporary) persist();
  renderHistory();
  renderMessages();
  textarea.focus({ preventScroll: true });
  replyTimer = setTimeout(finishReply, model === 'thinking' ? 3000 : 650);
}

function regenerateReply(id: string): void {
  if (pendingId) return;
  const chat = currentChat();
  const index = chat?.messages.findIndex((message) => message.id === id && message.role === 'assistant') ?? -1;
  if (!chat || index < 0) return;
  const prompt = chat.messages.slice(0, index).reverse().find((message) => message.role === 'user');
  if (!prompt) return;
  const promptIndex = chat.messages.findIndex((message) => message.id === prompt.id);
  chat.messages[index] = { ...createAssistantMessage(chat, prompt.content, promptIndex), id };
  chat.updatedAt = Date.now();
  pendingId = id;
  if (!temporary) persist();
  renderHistory();
  renderMessages();
  replyTimer = setTimeout(finishReply, model === 'thinking' ? 3000 : 650);
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

function showDialog(title: string, content: string, className = '', view?: DialogView): void {
  closePopover();
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.className = className;
  dialog.dataset.view = view ?? '';
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${title}</h2>${actionButton('x', 'closeDialog', 'close-dialog')}</div>${content}`;
  if (!dialog.open) dialog.showModal();
}

function closeDialog(): void {
  if (dialog.open) dialog.close();
}

function searchChats(): void {
  showDialog(t('searchChats'), `<div class="search-field">${icon('search')}<input id="chat-search" aria-label="${t('searchContent')}" placeholder="${t('searchPlaceholder')}" autocomplete="off" /></div><div id="search-results" class="search-results"></div>`, 'search-dialog', 'search');
  renderSearch('');
  document.querySelector<HTMLInputElement>('#chat-search')!.focus();
}

function renderSearch(query: string): void {
  const matches = chats.filter((chat) => `${chat.title} ${chat.messages.map((message) => message.content).join(' ')}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  document.querySelector('#search-results')!.innerHTML = matches.length ? matches.map((chat) => {
    const count = chat.messages.length / 2;
    const date = new Date(chat.updatedAt).toLocaleDateString(getLanguage() === 'en' ? 'en-US' : 'zh-CN');
    return `<button class="search-result" data-action="open-chat" data-id="${escapeHtml(chat.id)}">${icon('edit')}<span><strong>${escapeHtml(chat.title)}</strong><span>${date} · ${t(count === 1 ? 'conversationSingular' : 'conversationPlural', { count })}</span></span>${icon('chevron')}</button>`;
  }).join('') : `<div class="dialog-empty">${icon('search')}<p>${t(query ? 'searchNoResults' : 'searchEmpty')}</p></div>`;
}

function showSettings(): void {
  const languagePreference = getLanguagePreference();
  showDialog(t('settings'), `<div class="settings-body">
    <div class="setting-row"><span>${t('language')}</span><select id="language-select" aria-label="${t('language')}"><option value="system" ${languagePreference === 'system' ? 'selected' : ''}>${t('automaticLanguage')}</option><option value="zh-CN" ${languagePreference === 'zh-CN' ? 'selected' : ''}>简体中文</option><option value="en" ${languagePreference === 'en' ? 'selected' : ''}>English</option></select></div>
    <div class="setting-row"><span>${t('appearance')}</span><select id="theme-select" aria-label="${t('theme')}"><option value="system" ${theme === 'system' ? 'selected' : ''}>${t('systemTheme')}</option><option value="light" ${theme === 'light' ? 'selected' : ''}>${t('light')}</option><option value="dark" ${theme === 'dark' ? 'selected' : ''}>${t('dark')}</option></select></div>
    <div class="setting-row"><span>${t('exportChats')}</span><button class="secondary-button" data-action="export">${icon('download')}${t('export')}</button></div>
    <div class="setting-row"><span>${t('deleteAllChats')}</span><button class="secondary-button danger-text" data-action="confirm-clear">${icon('trash')}${t('deleteAll')}</button></div>
    <p class="settings-note">${icon('shield')}${t('settingsPrivacy')}</p>
  </div>`, '', 'settings');
}

function showAbout(): void {
  showDialog(t('about'), `<div class="about-content">${avatar()}<h3>${t('aboutTitle')}</h3><p>${t('aboutDescription')}<br />${t('aboutAnswerLabel')}</p><div class="about-reply">${REPLY}</div><p class="about-small">${t('aboutTech')}<br />${t('aboutParody')}</p><a class="primary-button" href="https://github.com/zjl1985/catgpt" target="_blank" rel="noopener noreferrer">${icon('github')}${t('githubPet')}</a></div>`, '', 'about');
}

function inspiration(): void {
  showDialog(t('inspirationTitle'), `<p class="dialog-description">${t('inspirationDescription')}</p><div class="inspiration-grid">${prompts.map((prompt, index) => `<button data-action="use-prompt" data-index="${index}">${icon(prompt.icon, prompt.color)}<strong>${prompt.label}</strong><span>${prompt.prompt}</span></button>`).join('')}</div>`, '', 'inspiration');
}

function confirmDeleteChat(id: string): void {
  showDialog(t('deleteChatConfirmTitle'), `<p class="dialog-description">${t('deleteChatConfirmText')}</p><div class="dialog-actions"><button class="secondary-button" data-action="close-dialog">${t('cancel')}</button><button class="danger-button" data-action="confirm-delete" data-id="${escapeHtml(id)}">${t('delete')}</button></div>`, '', 'delete-chat');
  dialog.dataset.chatId = id;
}

function confirmClearChats(): void {
  showDialog(t('clearTitle'), `<p class="dialog-description">${t('clearDescription')}</p><div class="dialog-actions"><button class="secondary-button" data-action="close-dialog">${t('cancel')}</button><button class="danger-button" data-action="clear-chats">${t('clearButton')}</button></div>`, '', 'clear-chats');
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

async function copyReply(id: string): Promise<void> {
  const message = currentChat()?.messages.find((item) => item.id === id && item.role === 'assistant');
  if (!message) return;
  try {
    await navigator.clipboard.writeText(message.content);
    toast(t('copied'));
  } catch {
    toast(t('copyUnavailable'));
  }
}

let audioContext: AudioContext | undefined;
async function meow(id?: string): Promise<void> {
  const content = currentChat()?.messages.find((item) => item.id === id && item.role === 'assistant')?.content ?? REPLY;
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
    toast(content);
  } catch {
    toast(content);
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
  toast(t('exported'));
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
    case 'delete-chat': confirmDeleteChat(id); break;
    case 'confirm-delete':
      chats = chats.filter((chat) => chat.id !== id);
      if (activeId === id) { activeId = null; finishReply(); }
      persist(); closeDialog(); renderHistory(); renderMessages(); toast(t('deleted'));
      break;
    case 'temporary':
      finishReply(); temporary = !temporary; temporaryChat = null; textarea.value = '';
      renderHistory(); renderMessages();
      toast(t(temporary ? 'tempEnabled' : 'tempDisabled'));
      break;
    case 'toggle-language': changeLanguage(getLanguage() === 'zh-CN' ? 'en' : 'zh-CN'); break;
    case 'toggle-theme':
      theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      writeSetting('catgpt.theme', theme); applyTheme();
      break;
    case 'model':
      showPopover(target, `<div class="popover-label">${t('selectModel')}</div><button class="model-option" data-action="set-model" data-model="instant">${icon('cat')}<span><strong>CatGpt</strong><small>${t('instantDescription')}</small></span>${model === 'instant' ? icon('check') : ''}</button><button class="model-option" data-action="set-model" data-model="thinking">${icon('sparkles')}<span><strong>CatGpt Thinking</strong><small>${t('thinkingDescription')}</small></span>${model === 'thinking' ? icon('check') : ''}</button>`);
      break;
    case 'set-model':
      model = target.dataset.model === 'thinking' ? 'thinking' : 'instant';
      closePopover(); updateComposer(); textarea.focus();
      break;
    case 'tools':
      showPopover(target, `<div class="popover-label">${t('workTools')}</div><button data-action="set-model" data-model="thinking">${icon('sparkles')}${t('deepThinking')}</button><button data-action="inspiration">${icon('bulb')}${t('inspiration')}</button>`, true);
      break;
    case 'add':
      showPopover(target, `<div class="popover-label">${t('addPromptLabel')}</div>${prompts.map((prompt, index) => `<button data-action="use-prompt" data-index="${index}">${icon(prompt.icon, prompt.color)}${prompt.label}</button>`).join('')}`, true);
      break;
    case 'clear-thinking': model = 'instant'; updateComposer(); break;
    case 'suggest': submitMessage(prompts[Number(target.dataset.index)]?.prompt); break;
    case 'use-prompt': setPrompt(Number(target.dataset.index)); break;
    case 'inspiration': inspiration(); break;
    case 'meow': void meow(id); break;
    case 'stop': finishReply(); break;
    case 'copy': void copyReply(id); break;
    case 'like':
    case 'dislike': {
      const value = target.dataset.action;
      feedback.set(id, feedback.get(id) === value ? '' : value);
      renderMessages();
      toast(t(value === 'like' ? 'likeToast' : 'dislikeToast'));
      break;
    }
    case 'regenerate': regenerateReply(id); break;
    case 'settings': showSettings(); break;
    case 'about': showAbout(); break;
    case 'close-dialog': closeDialog(); break;
    case 'export': exportChats(); break;
    case 'confirm-clear': confirmClearChats(); break;
    case 'clear-chats':
      chats = []; activeId = null; finishReply(); persist(); closeDialog(); renderHistory(); renderMessages(); toast(t('cleared'));
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
  if ((event.target as HTMLElement).id === 'language-select') {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'system' || value === 'zh-CN' || value === 'en') changeLanguage(value);
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
window.addEventListener('languagechange', () => { if (getLanguagePreference() === 'system') applyLanguage(); });
window.addEventListener('resize', () => {
  closePopover();
  syncSidebar();
  if (currentChat()) requestAnimationFrame(() => { chatScroll.scrollTop = chatScroll.scrollHeight; });
});

applyTheme();
syncSidebar();
applyLanguage();
