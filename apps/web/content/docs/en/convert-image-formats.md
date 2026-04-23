---
title: Format
category: effect
order: 3
---

# Format

> Convert images from one format to another in real-time, without downloading and processing locally. Suitable for cross-platform compatibility and storage optimization.

## Function

- **Operation:** `format`
- **URL pattern:** `?x-oss-process=image/format,{type}`
- Supports conversion to JPG / PNG / WebP / BMP / GIF / TIFF / HEIC / AVIF
- Transparent formats preserve transparency when converting between each other
- JPG does not support alpha; fills with white when converting

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `[type]` | String | Yes | — | `jpg` / `png` / `webp` / `bmp` / `gif` / `tiff` / `heic` / `avif` | Target format |

> [!NOTE]
> - WebP requires source width and height both ≤ 16,383 px
> - HEIC / AVIF only supported in some regions
> - `format,gif` on GIF source keeps GIF; otherwise keeps original format

## Code Examples

### URL DSL

```
# Convert to WebP
?x-oss-process=image/format,webp

# Resize and convert to AVIF
?x-oss-process=image/resize,w_300/format,avif
```

### processImage (URL string)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/format,webp',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./photo.jpg')
  .format({ type: 'webp' })
  .toBuffer();
```

## Edge Cases & Limits

- Transparent formats (PNG/WebP/BMP/AVIF) preserve transparency when converting between each other
- JPG does not support alpha; fills with white when converting
- For the same pixel data, WebP/AVIF have smaller sizes but higher CPU cost
- When including resize operations, format conversion should be placed last in the processing chain
- General size / pixel limits: see [Getting Started](./index.md)
