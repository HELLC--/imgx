---
title: Rotate
category: transform
order: 2
---

# Rotate

> Rotate an image clockwise by a specified angle.

## Function

- **Operation name**: `rotate`
- **Request format**: `?x-oss-process=image/rotate,{angle}`
- Rotate clockwise by specified angle
- Width and height automatically adapt to contain rotation result
- Canvas expands when rotating by non-90° multiples

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `[value]` | Integer | Yes | — | `[0, 360]` | Rotation angle (°) |

## Code Examples

### URL DSL

```
# Rotate 90° clockwise
?x-oss-process=image/rotate,90

# Rotate 70° clockwise
?x-oss-process=image/rotate,70
```

### processImage (URL string)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/rotate,90',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./photo.jpg')
  .rotate({ value: 90 })
  .toBuffer();
```

## Edge Cases & Limits

- When angle > 90° and not a multiple of 90°, canvas expands and corners are filled with background color
- 0° / 360° has no effect
- Image width or height cannot exceed 4,096 px
- Animated GIF becomes static after rotation
- See [Getting Started](./index.md) for general size/pixel limits
