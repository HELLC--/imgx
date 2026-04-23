<div align="center">

# imgx

**Image processing shaped by a URL — for Node.js.**

Resize, crop, watermark, convert — all expressed as a readable path, powered by [`sharp`](https://github.com/lovell/sharp), and ready to drop into any Node.js project.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)
[![Node](https://img.shields.io/badge/node-%3E=18-43853d)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-f69220)](https://pnpm.io)
[![Web Demo](https://img.shields.io/badge/demo-vercel-000)](https://imgx-web.vercel.app)

[Online Demo](https://imgx-web.vercel.app) · [Playground](https://imgx-web.vercel.app/en/playground) · [Docs](https://imgx-web.vercel.app/en/docs) · [中文说明](#中文简介)

</div>

---

## ✨ Features

- 🔗 **URL-driven** — fully compatible with Aliyun OSS [`x-oss-process`](https://help.aliyun.com/zh/oss/user-guide/image-processing-overview) syntax. Drop existing URLs in and they just work.
- ⛓ **Chained builder API** — fluent, fully typed TypeScript builder with IDE auto-completion.
- 🧰 **12+ operations** — resize, crop, rotate, flip, blur, watermark, format conversion, quality control, circle / rounded crop, indexed slice, auto-orient, and more.
- ⚡ **Powered by sharp** — battle-tested `libvips` backend with stable, low-memory performance.
- 📦 **ESM + CJS** — works with both module systems on Node.js 18+.
- 🔒 **Strict input limits** — sane defaults for size, dimensions and pixel count to keep your server safe.

## 📦 Install

```bash
npm install @imgx/core sharp
# or
pnpm add @imgx/core sharp
# or
yarn add @imgx/core sharp
```

> `sharp` is a peer dependency and must be installed separately.

## 🚀 Quick Start

### 1. URL style — drop-in `x-oss-process` compatible

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/resize,w_300/format,webp',
);
```

### 2. Builder style — typed, chainable, discoverable

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./photo.jpg')
  .resize({ w: 300 })
  .format({ type: 'webp' })
  .toBuffer();
```

Input accepts a **local path**, **`Buffer`**, **`URL`**, or a **Node `Readable` stream**.

### URL DSL grammar

```
image/{op1},{param}_{value}[/{op2},{param}_{value}...]
```

Recommended order: `resize → format → watermark → quality`.

See the [full operation reference](https://imgx-web.vercel.app/en/docs) for every parameter.

## 🧱 Repository Layout

This is a [pnpm](https://pnpm.io) + [Turborepo](https://turborepo.com) monorepo.

| Path | Description |
| --- | --- |
| [`packages/core/`](./packages/core) | [`@imgx/core`](./packages/core) — the image processing library |
| [`apps/web/`](./apps/web) | Marketing site, documentation and online Playground (Next.js 16) |
| `docs/` | Internal planning notes |

User-facing docs live in [`apps/web/content/docs/{en,zh}/`](./apps/web/content/docs).

## 🛠 Development

```bash
pnpm install              # install all workspaces
pnpm build                # build core + web
pnpm test                 # run all tests
pnpm web:dev              # start the website locally on :3000
```

| Command | What it does |
| --- | --- |
| `pnpm build` | Build every workspace via Turbo |
| `pnpm test` | Run all unit tests (Vitest) |
| `pnpm lint` | Lint every workspace |
| `pnpm web:dev` | Run the Next.js site locally |
| `pnpm web:build` | Build the website only |

## 🌐 Deployment

The website ([`apps/web`](./apps/web)) is deployed to Vercel automatically by a GitHub Action on every push to `main`. See [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

## 🤝 Contributing

Issues and pull requests are very welcome. If you plan to work on a sizeable change, please open an issue first to discuss the approach.

1. Fork the repo and create your branch from `main`.
2. Run `pnpm install` and make your changes.
3. Add or update tests; make sure `pnpm test` and `pnpm lint` pass.
4. Open a PR with a clear description.

## 📄 License

[MIT](./LICENSE) © imgx contributors

---

## 中文简介

`imgx` 是一个 Node.js 图像处理工具集，**核心库 `@imgx/core` 完全兼容阿里云 OSS 的 `x-oss-process` URL 语法**，底层由 [`sharp`](https://github.com/lovell/sharp) 驱动。它同时提供两套等价 API：

- **URL 风格**：把熟悉的 `image/resize,w_300/format,webp` 直接喂进去；
- **链式 Builder**：完整 TypeScript 类型，IDE 自动补全，写起来更顺手。

仓库为 pnpm + Turborepo monorepo：

- [`packages/core/`](./packages/core) — `@imgx/core` 库本体
- [`apps/web/`](./apps/web) — 官网、文档与在线 Playground（Next.js）

🔗 在线体验：<https://imgx-web.vercel.app> ｜ Playground：<https://imgx-web.vercel.app/zh/playground>

快速开始：

```bash
pnpm install
pnpm web:dev   # 本地启动官网
```

更多用法详见 [`apps/web/content/docs/zh/`](./apps/web/content/docs/zh) 或在线文档。
