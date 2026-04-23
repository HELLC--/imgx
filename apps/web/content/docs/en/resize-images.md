---
title: Resize
category: size
order: 1
---

# Resize

> Adjust the dimensions of images stored in OSS in real-time, without downloading and processing locally. Supports proportional scaling, fixed-size scaling, long/short edge control, and multiple scaling modes.

## Function

- **Operation:** `resize`
- **URL pattern:** `?x-oss-process=image/resize,{param}_{value}[,...]`
- Supports proportional scaling (p) and fixed-size scaling (w/h)
- Provides 5 scaling modes (lfit/mfit/fill/pad/fixed)
- Supports long/short edge control (l/s) and enlargement limiting (limit)

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `m` | String | No | `lfit` | See table below | Scaling mode |
| `w` | Integer | No | — | `[1, 16384]` (px) | Target width |
| `h` | Integer | No | — | `[1, 16384]` (px) | Target height |
| `l` | Integer | No | — | `[1, 16384]` (px) | Target long-edge length |
| `s` | Integer | No | — | `[1, 16384]` (px) | Target short-edge length |
| `p` | Integer | No | — | `[1, 1000]` (%) | Proportional scaling percentage |
| `limit` | Integer | No | `1` | `0` / `1` | `1`:return original if target exceeds source;`0`:allow enlargement |
| `color` | String | No | `FFFFFF` | 6-digit RGB hex | Fill color for `pad` mode |

### Scaling modes (m)

Example: source 200×100 px, target 150×80 px:

| Mode | Description | Output size |
| --- | --- | --- |
| `lfit` | Proportional scale, largest image fitting within w×h | 150×75 px |
| `mfit` | Proportional scale, smallest image covering w×h | 160×80 px |
| `fill` | Based on `mfit`, excess cropped at center | 150×80 px |
| `pad` | Based on `lfit`, blank filled with color | 150×80 px |
| `fixed` | Fixed w×h forced scaling, may distort | 150×80 px |

> [!NOTE]
> - When only `w` or `h` is specified, `lfit/mfit/fixed` scale proportionally; `pad/fill` force square
> - When `w` or `h` is set, `l` and `s` have no effect
> - `p` is mutually exclusive with `w/h/l/s`; `w/h/l/s` take precedence

## Code Examples

### URL DSL

```
# Proportional scale to 50%
?x-oss-process=image/resize,p_50

# Width 200px, height auto
?x-oss-process=image/resize,w_200

# Fixed 100×100, center-crop mode
?x-oss-process=image/resize,m_fill,w_100,h_100
```

### processImage (URL string)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/resize,p_50',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx-kit/core';

// Proportional scale to 50%
const buf1 = await imgx('./photo.jpg')
  .resize({ p: 50 })
  .toBuffer();

// Width 200
const buf2 = await imgx('./photo.jpg')
  .resize({ w: 200 })
  .toBuffer();

// Fixed 100×100 center-crop
const buf3 = await imgx('./photo.jpg')
  .resize({ m: 'fill', w: 100, h: 100 })
  .toBuffer();
```

## Edge Cases & Limits

- Source limits: ≤ 20 MB, side ≤ 30,000 px, total pixels ≤ 250 M
- Output limits: side ≤ 16,384 px, total pixels ≤ 16,777,216
- Animated images (e.g., GIF) count pixels as `width × height × frames`
- Animated images do not support `p`, only w/h reduction, no enlargement
- With `limit_1`, target larger than source returns original resolution
- General size / pixel limits: see [Getting Started](./index.md)
