---
title: Getting Started
category: overview
order: 0
---

# Getting Started

> `@imgx/core` is a Node.js image processing library compatible with Aliyun OSS `x-oss-process` URL syntax, powered by sharp.

## Install

```bash
npm install @imgx/core sharp
# or
pnpm add @imgx/core sharp
yarn add @imgx/core sharp
```

> `sharp` is a peer dependency and must be installed separately.

## Code Examples

### processImage (URL string)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/resize,w_300/format,webp',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./photo.jpg')
  .resize({ w: 300 })
  .format({ type: 'webp' })
  .toBuffer();
```

Input accepts a local path, Buffer, URL, or Node stream (see source provider).

## Chaining URL DSL

```
?x-oss-process=image/{op1},{param}_{value}[/{op2},{param}_{value}...]
```

Recommended order: `resize → format → watermark → quality`.

## Limits

| Item | Value |
| --- | --- |
| Source formats | JPG, PNG, BMP, GIF, WebP, TIFF, HEIC |
| Source size | ≤ 20 MB |
| Source side | ≤ 30,000 px |
| Source pixels | ≤ 250 M |
| Output side | ≤ 16,384 px |
| Output pixels | ≤ 16,777,216 |

## Conventions

| Symbol | Meaning |
| --- | --- |
| `[a, b]` | Closed interval, inclusive on both ends |
| `(a, b]` | Half-open, exclusive of a, inclusive of b |
| `[a, b)` | Half-open, inclusive of a, exclusive of b |
| Required = Yes | Parameter is required |
| Default | Value used when the parameter is omitted |
