export const REPLY = 'mewo～～🐱';
export const STORAGE_KEY = 'catgpt.chats.v1';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona?: string;
  replyId?: string;
  drinking?: boolean;
  thinking?: boolean;
  thoughtId?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export function readSetting(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeSetting(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function loadChats(): Chat[] {
  try {
    const stored: unknown = JSON.parse(readSetting(STORAGE_KEY, '[]'));
    if (!Array.isArray(stored)) return [];
    return stored.filter((chat): chat is Chat => {
      if (!chat || typeof chat !== 'object') return false;
      return typeof chat.id === 'string' && typeof chat.title === 'string' &&
        typeof chat.updatedAt === 'number' && Array.isArray(chat.messages) &&
        chat.messages.every((message: unknown) => {
          if (!message || typeof message !== 'object') return false;
          const item = message as Record<string, unknown>;
          return typeof item.id === 'string' && typeof item.content === 'string' &&
            (item.role === 'user' || item.role === 'assistant') &&
            ['persona', 'replyId', 'thoughtId'].every((key) => item[key] === undefined || typeof item[key] === 'string') &&
            ['drinking', 'thinking'].every((key) => item[key] === undefined || typeof item[key] === 'boolean');
        });
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveChats(chats: Chat[]): boolean {
  return writeSetting(STORAGE_KEY, JSON.stringify(chats));
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]!);
}
