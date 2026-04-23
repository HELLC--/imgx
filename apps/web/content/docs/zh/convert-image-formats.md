---
title: 格式转换 format
category: effect
order: 3
---

# 格式转换

> 通过格式转换参数,实时将图片从一种格式转换为另一种格式,无需下载到本地处理。适用于跨平台兼容、存储优化等场景。

## 功能说明

- **操作名**:`format`
- **请求格式**:`?x-oss-process=image/format,{type}`
- 支持转换为 JPG / PNG / WebP / BMP / GIF / TIFF / HEIC / AVIF
- 透明通道格式互转保持透明
- JPG 不支持 alpha 通道,转换时填充白色

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `[type]` | String | 是 | — | `jpg` / `png` / `webp` / `bmp` / `gif` / `tiff` / `heic` / `avif` | 目标格式 |

> [!NOTE]
> - WebP 格式要求原图宽高均 ≤ 16,383 px
> - HEIC / AVIF 仅部分地域支持
> - 原图为 GIF 设置 `format,gif` 时保持 GIF,否则保持原格式

## 代码示例

### URL DSL

```
# 转换为 WebP
?x-oss-process=image/format,webp

# 缩放并转换为 AVIF
?x-oss-process=image/resize,w_300/format,avif
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/format,webp',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./photo.jpg')
  .format({ type: 'webp' })
  .toBuffer();
```

## 边界说明

- 透明通道格式(PNG/WebP/BMP/AVIF)互转保持透明
- JPG 不支持 alpha,转换时填充白色
- 同一像素数据下 WebP/AVIF 体积更小但 CPU 开销更高
- 包含缩放操作时,格式转换应放在处理参数的最后
- 通用大小/像素上限见[快速开始](./index.md)
