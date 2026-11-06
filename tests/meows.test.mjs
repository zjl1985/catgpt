import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCatReply, catThought } from '../src/meows.ts';
import { REPLY, STORAGE_KEY, loadChats, saveChats } from '../src/store.ts';

const reply = (overrides = {}) => createCatReply({
  input: 'Just sitting here', language: 'en',
  random: () => 0.5, ...overrides,
});

test('The original signature is available automatically without selecting a mode', () => {
  for (const language of ['zh-CN', 'en']) {
    const result = reply({ language, previousWasDrinking: true, random: () => 0 });
    assert.equal(result.content, REPLY);
    assert.equal(result.drinking, false);
    assert.equal('persona' in result, false);
  }
});

test('Random replies are localized at every selection boundary', () => {
  for (const language of ['zh-CN', 'en']) {
    for (const value of [0, 0.12, 0.5, 0.999999, 1]) {
      const result = reply({ language, random: () => value });
      assert.ok(result.content.length > 0);
      assert.ok(catThought(result.thoughtId, language).pending);
      assert.ok(catThought(result.thoughtId, language).done);
      if (language === 'en') assert.doesNotMatch(result.content, /\p{Script=Han}/u);
    }
  }
});

test('Chinese and English beer cues trigger the drinking surprise', () => {
  for (const language of ['zh-CN', 'en']) {
    for (const input of ['啤酒', '干杯', '喝酒', '下班', '🍺', '🍻', 'beer', 'cheers', 'after work', 'grab a drink', 'catgpt.bar']) {
      const result = reply({ input, language, random: () => 0.99 });
      assert.equal(result.drinking, true);
      assert.match(result.id, /^beer-/);
    }
  }
});

test('An occasional random sip has a cooldown, while explicit cheers still work', () => {
  assert.equal(reply({ random: () => 0 }).drinking, true);
  assert.equal(reply({ random: () => 0, previousWasDrinking: true }).drinking, false);
  assert.equal(reply({ input: 'cheers', random: () => 0, previousWasDrinking: true }).drinking, true);
});

test('Replies avoid recent repeats and still vary after exhausting a small topic pool', () => {
  const recentReplies = [];
  for (let index = 0; index < 12; index++) {
    const result = reply({ input: 'hello', recentReplies, random: () => 0.5 });
    assert.notEqual(result.content, recentReplies.at(-1));
    recentReplies.push(result.content);
  }
  assert.equal(new Set(recentReplies.slice(0, 4)).size, 4);
});

test('Context and repetition are recognized in both languages', () => {
  for (const input of ['帮我写代码', 'write some code']) assert.match(reply({ input }).id, /^code-/);
  for (const input of ['晚安', 'goodnight']) assert.match(reply({ input }).id, /^night-/);
  for (const input of ['小鱼干', 'fish']) assert.match(reply({ input }).id, /^food-/);
  for (const input of ['我好难过', 'I feel sad']) assert.match(reply({ input }).id, /^comfort-/);
  assert.match(reply({ input: 'Same question', previousPrompts: ['  same   QUESTION  '] }).id, /^repeat-/);
  assert.match(reply({ input: 'x'.repeat(281) }).id, /^long-/);
});

test('Legacy chats and rich new replies both survive storage without changing their content', (context) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  } });
  context.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });
  const legacy = { id: 'old', title: 'Old chat', updatedAt: 1, messages: [
    { id: 'old-user', role: 'user', content: 'hello' },
    { id: 'old-cat', role: 'assistant', content: REPLY },
  ] };
  const rich = { id: 'new', title: 'New chat', updatedAt: 2, messages: [
    { id: 'new-user', role: 'user', content: 'cheers' },
    { id: 'new-cat', role: 'assistant', content: '<b>meow</b> 🍺', persona: 'bar', drinking: true, thinking: true, thoughtId: 'beer-foam' },
  ] };
  assert.equal(saveChats([legacy, rich]), true);
  assert.deepEqual(loadChats(), [rich, legacy]);
  values.set(STORAGE_KEY, JSON.stringify([{ ...rich, messages: [{ id: 'bad', role: 'system', content: 'unexpected' }] }]));
  assert.deepEqual(loadChats(), []);
});
