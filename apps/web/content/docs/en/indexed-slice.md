---
title: Indexed slice
category: size
order: 3
---

# Indexed slice

> Divide an image into equal segments of fixed length along the x-axis or y-axis and return the region at the specified index. Suitable for sprite sheet splitting, long image segmented display, and other scenarios.

## Function

- **Operation name**: `indexcrop`
- **Request format**: `?x-oss-process=image/indexcrop,{param}_{value}[,...]`
- Divide into equal segments along x-axis or y-axis
- Return region at specified index (starting from 0)
- x and y are mutually exclusive; when both are specified, y takes precedence

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `x` | Integer | Conditionally required | — | `[1, image width]` (unit: px) | x-axis segment length (mutually exclusive with `y`) |
| `y` | Integer | Conditionally required | — | `[1, image height]` (unit: px) | y-axis segment length (mutually exclusive with `x`) |
| `i` | Integer | No | `0` | `[0, segment count)` | Index of returned region (starting from 0) |

## Code Examples

### URL DSL

```
# Divide along x-axis in 100px segments, get 1st block
?x-oss-process=image/indexcrop,x_100,i_0

# Divide along y-axis in 200px segments, get 3rd block
?x-oss-process=image/indexcrop,y_200,i_2
```

### processImage (URL string)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './sprite.jpg',
  'image/indexcrop,x_100,i_0',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./sprite.jpg')
  .indexcrop({ x: 100, i: 0 })
  .toBuffer();
```

## Edge Cases & Limits

- Must specify either `x` or `y`, cannot omit both
- When both `x` and `y` are specified, `y` takes precedence
- When index exceeds actual segment count, returns original image
- See [Getting Started](./index.md) for general size/pixel limits
