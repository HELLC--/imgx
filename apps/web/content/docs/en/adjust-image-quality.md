---
title: Quality
category: effect
order: 2
---

# Quality

> Adjust image compression quality in real-time to achieve the best balance between visual quality and file size.

## Function

- **Operation:** `quality`
- **URL pattern:** `?x-oss-process=image/quality,{param}_{value}`
- Supports relative quality (q) and absolute quality (Q)
- Only effective for JPG / WebP; PNG / GIF and other lossless formats unaffected
- `Q` takes precedence when both `q` and `Q` are present

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `q` | Integer | No | — | `[1, 100]` (%) | Relative quality: compress as % of source quality |
| `Q` | Integer | No | — | `[1, 100]` (%) | Absolute quality: directly specify target quality |

> [!NOTE]
> - `q` relative quality: source 80%, `q_90` outputs 72% (80% × 90%)
> - `Q` absolute quality: compresses to target if source ≥ target; keeps source if source < target
> - For JPG, `q` is relative; for WebP, `q` behaves like `Q` (absolute)
> - When both `q` and `Q` are present, `Q` takes precedence

## Code Examples

### URL DSL

```
# Relative quality 90%
?x-oss-process=image/quality,q_90

# Absolute quality 75%
?x-oss-process=image/quality,Q_75
```

### processImage (URL string)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/quality,q_90',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx/core';

// Relative quality
const buf1 = await imgx('./photo.jpg')
  .quality({ q: 90 })
  .toBuffer();

// Absolute quality
const buf2 = await imgx('./photo.jpg')
  .quality({ Q: 75 })
  .toBuffer();
```

## Edge Cases & Limits

- Only effective for JPG / WebP
- PNG / GIF and other lossless formats are unaffected
- `Q` takes precedence when both `q` and `Q` are present
- General size / pixel limits: see [Getting Started](./index.md)
