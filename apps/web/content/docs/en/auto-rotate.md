---
title: Auto orient
category: transform
order: 1
---

# Auto orient

> Automatically correct image orientation based on EXIF Orientation metadata. Suitable for images captured by mobile devices with rotation metadata.

## Function

- **Operation name**: `auto-orient`
- **Request format**: `?x-oss-process=image/auto-orient,{value}`
- Reads EXIF Orientation field and rotates pixels to correct orientation
- Processed image no longer carries Orientation metadata

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `[value]` | Integer | Yes | — | `0` / `1` | `0`: keep original orientation; `1`: auto-orient |

## Code Examples

### URL DSL

```
# Auto-orient
?x-oss-process=image/auto-orient,1

# Resize and auto-orient
?x-oss-process=image/resize,w_100/auto-orient,1
```

### processImage (URL string)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './phone-photo.jpg',
  'image/auto-orient,1',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./phone-photo.jpg')
  .autoOrient({ value: 1 })
  .toBuffer();
```

## Edge Cases & Limits

- When original image does not contain EXIF Orientation, this operation has no effect
- Processed image will be recompressed, file size may differ from original
- Most image viewers automatically render based on EXIF, so the "original" you see is usually already rotated by local software
- See [Getting Started](./index.md) for general size/pixel limits
