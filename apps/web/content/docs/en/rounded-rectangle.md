---
title: Rounded corners
category: size
order: 5
---

# Rounded corners

> Crop an image into a rounded rectangle. Suitable for card-style UI, thumbnail displays, and other scenarios.

## Function

- **Operation name**: `rounded-corners`
- **Request format**: `?x-oss-process=image/rounded-corners,r_{radius}`
- Supports transparent rounded corners (PNG / WebP / BMP)
- JPG output fills outside corners with white
- When radius exceeds limit, processed as maximum inscribed circle

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `r` | Integer | Yes | — | `[1, 4096]` (unit: px) | Corner radius |

## Code Examples

### URL DSL

```
# Corner radius 30 px
?x-oss-process=image/rounded-corners,r_30

# Crop first then round corners, output PNG
?x-oss-process=image/crop,w_100,h_100/rounded-corners,r_10/format,png
```

### processImage (URL string)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './card.jpg',
  'image/rounded-corners,r_30',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./card.jpg')
  .roundedCorners({ r: 30 })
  .toBuffer();
```

## Edge Cases & Limits

- When `r` > half of the original image's minimum edge, processed as maximum inscribed circle (`r = min(width, height) / 2`)
- JPG output has no transparency channel, fills outside corners with white; for transparent background, chain with `/format,png`
- GIF format does not support rounded corners operation
- See [Getting Started](./index.md) for general size/pixel limits
