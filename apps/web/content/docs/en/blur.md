---
title: Blur
category: effect
order: 1
---

# Blur

> Apply Gaussian blur to images—supports full image blur and localized blur by face regions. Suitable for privacy protection, multi-layer composition, and other scenarios.

## Function

- **Operation name**: `blur`
- **Request format**: `?x-oss-process=image/blur,{param}_{value}[,...]`
- Full Gaussian blur with independently adjustable radius and standard deviation
- Optional face blur using IMM face detection for largest face or all faces
- Supports custom face blur region multiplier

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `r` | Integer | Yes | — | `[1, 50]` | Blur radius, larger values mean more blur |
| `s` | Integer | Yes | — | `[1, 50]` | Normal distribution standard deviation, larger values mean more blur |
| `g` | String | No | — | `face` / `faces` | Blur scope: largest face / all faces |
| `p` | Integer | No | `100` | `[1, 200]` (unit: %) | Face region multiplier (only effective when `g` is set) |

> [!IMPORTANT]
> Using `g_face` / `g_faces` requires:
> - Bound IMM Project
> - No anonymous access support
> - IMM processing permissions

## Code Examples

### URL DSL

```
# Full image blur
?x-oss-process=image/blur,r_10,s_10

# Blur largest face
?x-oss-process=image/blur,r_10,s_10,g_face
```

### processImage (URL string)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/blur,r_10,s_10',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./photo.jpg')
  .blur({ r: 10, s: 10 })
  .toBuffer();
```

## Edge Cases & Limits

- `r` / `s` out of range (`< 1` or `> 50`) will return parameter error
- `g_face` and `g_faces` cannot appear simultaneously; the last one takes precedence
- When `g` is not specified, `p` has no effect
- See [Getting Started](./index.md) for general size/pixel limits
