const paths = {
  cat: '<path d="M5 10V3l5.4 3.8a17 17 0 0 1 3.2 0L19 3v7c1.4 1.8 1.9 3.9 1 6-1.5 3.7-5.5 5-8 5s-6.5-1.3-8-5c-.9-2.1-.4-4.2 1-6Z"/><path d="M8 12v1m8-1v1m-5 3 1 1 1-1m-1 1v1M5 15l-4-1m4 4-3 1m17-4 4-1m-4 4 3 1"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>',
  edit: '<path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7M16 3l5 5M11 18l-5 1 1-5L17 4a2.1 2.1 0 0 1 3 3Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
  sparkles: '<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3ZM20 2v4m-2-2h4"/>',
  book: '<path d="M12 6C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
  wave: '<path d="M4 10v4m4-7v10m4-13v16m4-13v10m4-7v4"/>',
  sliders: '<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/>',
  bulb: '<path d="M9 18h6m-6 3h6M8 14a6 6 0 1 1 8 0c-1 .8-1 1.5-1 2H9c0-.5 0-1.2-1-2Z"/>',
  pen: '<path d="m15 5 4 4M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15l-1 5Zm0 0 5-1-4-4"/>',
  paw: '<ellipse cx="12" cy="16.5" rx="6" ry="4.5"/><ellipse cx="4.5" cy="9" rx="2" ry="3" transform="rotate(-25 4.5 9)"/><ellipse cx="9" cy="5.5" rx="2" ry="3"/><ellipse cx="15" cy="5.5" rx="2" ry="3"/><ellipse cx="19.5" cy="9" rx="2" ry="3" transform="rotate(25 19.5 9)"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20.7 14A9 9 0 0 1 10 3.3 9 9 0 1 0 20.7 14Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  retry: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 6.1A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.9 5.9"/>',
  like: '<path d="M7 10v11H3V10h4Zm0 0 5-8c3 0 3 3 1 7h6a2 2 0 0 1 2 2l-1 8a2 2 0 0 1-2 2H7"/>',
  dislike: '<path d="M7 14V3H3v11h4Zm0 0 5 8c3 0 3-3 1-7h6a2 2 0 0 0 2-2l-1-8a2 2 0 0 0-2-2H7"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  github: '<path d="M9 19c-4 1.2-4-2-6-2m12 5v-3.1a2.7 2.7 0 0 0-.8-2.1c2.7-.3 5.6-1.3 5.6-6A4.7 4.7 0 0 0 18.5 7a4.4 4.4 0 0 0-.1-3.7s-1-.3-3.7 1.4a12.8 12.8 0 0 0-6.7 0C5.4 3 4.3 3.3 4.3 3.3A4.4 4.4 0 0 0 4.2 7a4.7 4.7 0 0 0-1.3 3.3c0 4.7 2.9 5.7 5.6 6A2.7 2.7 0 0 0 7.7 19v3"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-1.3.7-1.8 1.2-1.8 2.8M12 17h.01"/>',
  shield: '<path d="M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4Z"/><path d="m8 12 3 3 5-6"/>',
  temporary: '<path stroke-dasharray="2 3" d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1-4a8.5 8.5 0 1 1 16-4.5Z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
} satisfies Record<string, string>;

export type IconName = keyof typeof paths;

export function icon(name: IconName, className = ''): string {
  return `<svg class="icon ${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}
