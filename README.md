# CatGpt 🐱

catgpt.bar 的啤酒猫酒馆。一个长得很熟悉、脑子很空、偶尔还会吨吨吨的猫咪聊天网站。🍺

154 条中英文猫语，八种性格。也保留「经典模式」，无论输入什么都只回复：

> mewo～～🐱

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzjl1985%2Fcatgpt&project-name=catgpt&repository-name=catgpt)

![CatGpt 界面预览](.github/preview.png)

## 功能

- 接近 ChatGPT 的页面布局，使用眨眼猫 GIF 作为 Logo。
- 无需登录，纯前端运行，无后端、无 API Key、无模型调用。
- 支持多轮对话、新建聊天、本地聊天记录、搜索和删除。
- 支持深浅主题、跟随系统、手机端侧栏。
- 完整中英文界面，自动匹配浏览器语言；顶部可一键切换，设置中可恢复自动模式。手动选择会被记住，切换时保留聊天记录和输入草稿。
- 八种性格：酒馆猫、黏人猫、傲娇猫、暴躁猫、困困猫、哲学猫、微醺猫，以及原汁原味的经典模式。
- 154 条双语猫语，根据代码、工作、晚安、小鱼干、纸箱等关键词触发彩蛋，避免连续重复。
- 啤酒猫偶尔随机喝一口；「啤酒、干杯、下班、beer、cheers、after work」等词会主动触发酒馆彩蛋。普通随机喝酒有一轮冷却，经典模式不触发。
- 「深度思喵」会认真等 3 秒，研究纸箱、尾巴或啤酒泡沫，然后交出一声猫语。
- 临时聊天不保存记录；普通聊天仅保存在当前浏览器的 `localStorage`。
- 复制回复、重新生成、反馈、合成猫叫、导出记录。
- Enter 发送，Shift + Enter 换行；中文输入法选词不会误发送。
- `⌘ / Ctrl + K` 搜索，`⌘ / Ctrl + Shift + O` 新建聊天。

## 本地运行

需要 Node.js 22.12+（推荐 Node.js 22 LTS）。

```sh
npm install
npm run dev
```

打开终端输出的本地地址。

```sh
npm run check   # TypeScript 检查
npm test        # 猫语规则、彩蛋和旧聊天兼容性检查
npm run build   # 检查并构建到 dist/
npm run preview # 预览生产构建
```

## 部署到 Vercel

点击上方 **Deploy with Vercel**，或在 Vercel 中选择 **Add New → Project**，导入 `zjl1985/catgpt`。

项目已包含 `vercel.json`，无需添加环境变量：

| 配置 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

连接 GitHub 仓库后，推送到 `main` 即可触发 Vercel 自动部署。

## 项目结构

```text
public/cat-avatar.gif  原始眨眼猫 Logo
src/main.ts           页面和交互
src/style.css         响应式布局与主题
src/store.ts          聊天记录与本地存储
src/meows.ts          双语猫语、性格、关键词和啤酒彩蛋
src/i18n.ts           中英文文案与语言偏好
src/icons.ts          SVG 图标
vercel.json           静态部署配置
```

技术栈：Vite + TypeScript + 原生 CSS，没有前端运行时依赖。聊天内容按纯文本显示，不执行用户输入的 HTML。

这是一个非官方趣味仿作，与 OpenAI 或 ChatGPT 无关联。

## English

CatGpt is the beer cat at catgpt.bar: a frontend-only ChatGPT parody with 154 bilingual cat replies, eight personalities, and the occasional little sip. No account, backend, API key, or model calls are needed. Classic mode always replies exactly `mewo～～🐱`.

![CatGpt English preview](.github/preview-en.png)

The entire interface is available in English and Simplified Chinese. It follows your browser language automatically. Use the **中 / EN** button at the top to switch, or choose **Automatic** in Settings → Language. Your choice is remembered without clearing your chats or message draft.

Choose a personality with the paw button beside Tools or in Settings. Beer, cheers, and after-work messages trigger bar surprises; ordinary messages can occasionally trigger a sip, with a cooldown to prevent consecutive random drinks. Regenerate rolls a new reply, and copying always copies the actual response. Thinking mode spends three seconds on very serious cat research. Replies use local rules and templates, with no model calls.

Run `npm install` and `npm run dev` locally. Deploy to Vercel using the button above, or import `zjl1985/catgpt`; the included configuration builds with `npm run build` and serves `dist/`. No environment variables are required.
