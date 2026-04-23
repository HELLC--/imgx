---
title: Flip
category: transform
order: 3
---

# Flip

> Flip an image vertically, horizontally, or both.

## Function

- **Operation name**: `flip`
- **Request format**: `?x-oss-process=image/flip,{value}`
- Supports vertical flip (top-bottom mirror)
- Supports horizontal flip (left-right mirror)
- Supports bidirectional flip (equivalent to 180° rotation)

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `[value]` | Integer | Yes | — | `0` / `1` / `2` | `0`: vertical flip; `1`: horizontal flip; `2`: bidirectional flip |

## Code Examples

### URL DSL

```
# Vertical flip (top-bottom mirror)
?x-oss-process=image/flip,0

# Horizontal flip (left-right mirror)
?x-oss-process=image/flip,1

# Bidirectional flip (equivalent to 180° rotation)
?x-oss-process=image/flip,2
```

### processImage (URL string)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/flip,1',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./photo.jpg')
  .flip({ value: 1 })
  .toBuffer();
```

## Edge Cases & Limits

- Output dimensions are the same as original image
- See [Getting Started](./index.md) for general size/pixel limits
