---
title: 快速开始
category: overview
order: 0
---

# 快速开始

> `@imgx-kit/core` 是兼容阿里云 OSS `x-oss-process` URL 语法的 Node 端图片处理库,基于 sharp 实现。

## 安装

```bash
npm install @imgx-kit/core sharp
# 或
pnpm add @imgx-kit/core sharp
yarn add @imgx-kit/core sharp
```

> `sharp` 是 peerDependency,需要单独安装。

## 代码示例

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/resize,w_300/format,webp',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./photo.jpg')
  .resize({ w: 300 })
  .format({ type: 'webp' })
  .toBuffer();
```

输入支持本地路径 / Buffer / URL / Node Stream(详见 source provider)。

## URL DSL 串联

```
?x-oss-process=image/{操作1},{参数}_{值}[/{操作2},{参数}_{值}...]
```

推荐顺序:`resize → format → watermark → quality`。

## 通用限制

| 限制项 | 说明 |
| --- | --- |
| 原图格式 | JPG、PNG、BMP、GIF、WebP、TIFF、HEIC |
| 原图大小 | ≤ 20 MB |
| 原图单边 | ≤ 30,000 px |
| 原图总像素 | ≤ 2.5 亿 px |
| 处理后单边 | ≤ 16,384 px |
| 处理后总像素 | ≤ 16,777,216 px |

## 文档约定

| 符号 | 含义 |
| --- | --- |
| `[a, b]` | 闭区间,取值范围为 a 到 b(含两端) |
| `(a, b]` | 半开区间,不包含 a,包含 b |
| `[a, b)` | 半开区间,包含 a,不包含 b |
| 必填 = 是 | 该参数为必填 |
| 默认值 | 不传该参数时使用的值 |
