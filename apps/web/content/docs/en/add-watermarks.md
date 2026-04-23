---
title: Watermark
category: security
order: 1
---

# Watermark

> Add watermarks (text/image/mixed) to images to protect copyright and prevent unauthorized use. Supports custom watermark position, transparency, font, color, and tiling.

## Function

- **Operation:** `watermark`
- **URL pattern:** `?x-oss-process=image/watermark,{param}_{value}[,...]`
- Supports text watermarks, image watermarks, and mixed watermarks
- Supports watermark tiling
- Key parameters (`text` / `image`) require Base64-URL-safe encoding

## Parameters

### Common parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `t` | Integer | No | `100` | `[0, 100]` (%) | Watermark transparency |
| `g` | String | No | `se` | Nine-grid position | `nw/north/ne/west/center/east/sw/south/se` |
| `x` | Integer | No | `10` | `[0, 4096]` (px) | Horizontal margin (only for left/right positions) |
| `y` | Integer | No | `10` | `[0, 4096]` (px) | Vertical margin (only for top/bottom positions) |
| `voffset` | Integer | No | `0` | `[-1000, 1000]` (px) | Centerline vertical offset (only for middle row) |
| `fill` | Integer | No | `0` | `0` / `1` | `0`:no tiling;`1`:tile across image |
| `padx` | Integer | No | `0` | `[0, 4096]` (px) | Horizontal spacing when tiling (only with `fill=1`) |
| `pady` | Integer | No | `0` | `[0, 4096]` (px) | Vertical spacing when tiling (only with `fill=1`) |

### Text watermark parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `text` | String | Yes | — | Base64-encoded string | Text content (≤ 64 bytes before encoding) |
| `type` | String | No | `wqy-zenhei` | Base64-encoded font name | Font (e.g., `wqy-zenhei`) |
| `color` | String | No | `000000` | 6-digit RGB hex | Text color |
| `size` | Integer | No | `40` | `(0, 1000]` (px) | Text size |
| `shadow` | Integer | No | `0` | `[0, 100]` (%) | Text shadow transparency |
| `rotate` | Integer | No | `0` | `[0, 360]` (degrees) | Clockwise rotation angle |

### Image watermark parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `image` | String | Yes | — | Base64-encoded string | Watermark image Object path |
| `P` | Integer | No | — | `[1, 100]` (%) | Scale watermark proportionally to source image |

> [!IMPORTANT]
> - `text` and `image` must be Base64 URL-safe encoded
> - Image watermark can only use images in the same storage bucket
> - Maximum 3 different image watermarks per image

## Code Examples

### URL DSL

```
# Text watermark ("Hello": SGVsbG8)
?x-oss-process=image/watermark,text_SGVsbG8

# Image watermark (panda.png: cGFuZGEucG5n)
?x-oss-process=image/watermark,image_cGFuZGEucG5n

# Mixed text and image
?x-oss-process=image/watermark,image_cGFuZGEucG5n,text_SGVsbG8

# Tiled watermark
?x-oss-process=image/watermark,text_Q29weXJpZ2h0,fill_1
```

### processImage (URL string)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/watermark,text_SGVsbG8',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx-kit/core';

// Text watermark
const buf1 = await imgx('./photo.jpg')
  .watermark({ text: 'SGVsbG8' })
  .toBuffer();

// Image watermark
const buf2 = await imgx('./photo.jpg')
  .watermark({ image: 'cGFuZGEucG5n' })
  .toBuffer();

// Mixed
const buf3 = await imgx('./photo.jpg')
  .watermark({ image: 'cGFuZGEucG5n', text: 'SGVsbG8' })
  .toBuffer();

// Tiling
const buf4 = await imgx('./photo.jpg')
  .watermark({ text: 'Q29weXJpZ2h0', fill: 1 })
  .toBuffer();
```

## Edge Cases & Limits

- `text` and `image` must be Base64 URL-safe encoded
- `text` length limit 64 bytes before encoding
- `image` must be in the same bucket
- `fill_1` is mutually exclusive with `g` / `x` / `y`
- General size / pixel limits: see [Getting Started](./index.md)
