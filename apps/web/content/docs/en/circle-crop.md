---
title: Circle crop
category: size
order: 4
---

# Circle crop

> Crop an image into a circle (inscribed circle). Suitable for avatars, icons, and other circular display scenarios.

## Function

- **Operation name**: `circle`
- **Request format**: `?x-oss-process=image/circle,r_{radius}`
- Input square or rectangle, output circular image
- PNG / WebP / BMP output has transparent area outside circle; JPG output has white fill outside circle
- Radius automatically converges when exceeding half of the minimum edge

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `r` | Integer | Yes | — | `[1, 4096]` (unit: px) | Inscribed circle radius |

## Code Examples

### URL DSL

```
# Radius 100 px
?x-oss-process=image/circle,r_100

# Radius 100 px, output PNG (transparent background)
?x-oss-process=image/circle,r_100/format,png
```

### processImage (URL string)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './avatar.jpg',
  'image/circle,r_100/format,png',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./avatar.jpg')
  .circle({ r: 100 })
  .format({ type: 'png' })
  .toBuffer();
```

## Edge Cases & Limits

- When `r` > half of the original image's minimum edge, automatically uses `r = (min(width, height) - 1) / 2`, output size is `r×2 + 1`
- JPG output has no transparency channel, fills outside circle with white; for transparent background, chain with `/format,png`
- See [Getting Started](./index.md) for general size/pixel limits
