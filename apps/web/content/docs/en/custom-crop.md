---
title: Crop
category: size
order: 2
---

# Crop

> With custom crop, you can specify starting coordinates, width, height, and crop origin to extract a specified region from the original image.

## Function

- **Operation name**: `crop`
- **Request format**: `?x-oss-process=image/crop,{param}_{value}[,...]`
- Supports coordinate cropping (x, y, w, h)
- Supports nine-grid origin cropping (g + w + h)
- Supports face cropping (g_face) and smart cropping (g_auto)

## Parameters

| Param | Type | Required | Default | Range | Description |
| --- | --- | --- | --- | --- | --- |
| `w` | Integer | No | Image width | `[0, image width]` (unit: px) | Crop width |
| `h` | Integer | No | Image height | `[0, image height]` (unit: px) | Crop height |
| `x` | Integer | No | `0` | `[0, image width]` (unit: px) | Crop starting x-coordinate |
| `y` | Integer | No | `0` | `[0, image height]` (unit: px) | Crop starting y-coordinate |
| `g` | String | No | `nw` | See table below | Crop origin position |
| `p` | Integer | No | `100` | `[1, 200]` (unit: %) | Face region multiplier (only effective when `g_face`) |

### Crop origin (`g` parameter)

Nine-grid origin layout:

```
┌──────────┬──────────┬──────────┐
│    nw    │  north   │    ne    │
│  (top    │  (top    │  (top    │
│   left)  │  center) │  right)  │
├──────────┼──────────┼──────────┤
│   west   │  center  │   east   │
│ (middle  │ (middle  │ (middle  │
│  left)   │ center)  │  right)  │
├──────────┼──────────┼──────────┤
│    sw    │  south   │    se    │
│ (bottom  │ (bottom  │ (bottom  │
│  left)   │ center)  │  right)  │
└──────────┴──────────┴──────────┘
```

| Value | Description |
| --- | --- |
| `nw` / `north` / `ne` | Top row origins (top-left / top-center / top-right) |
| `west` / `center` / `east` | Middle row origins (middle-left / middle-center / middle-right) |
| `sw` / `south` / `se` | Bottom row origins (bottom-left / bottom-center / bottom-right) |
| `face` | Crop centered on largest face (requires IMM permissions) |
| `auto` | Algorithm auto-recommends crop region (requires IMM permissions, ignores w/h/p) |

> [!IMPORTANT]
> Using `g_face` / `g_auto` requires:
> - Bound IMM Project
> - No anonymous access support
> - IMM processing permissions

## Code Examples

### URL DSL

```
# Crop 300×300 px starting from (800, 500)
?x-oss-process=image/crop,x_800,y_500,w_300,h_300

# Crop 900×900 px from bottom-right corner
?x-oss-process=image/crop,g_se,w_900,h_900

# Face crop
?x-oss-process=image/crop,g_face,w_400,h_400
```

### processImage (URL string)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/crop,x_800,y_500,w_300,h_300',
);
```

### imgx chain API

```ts
import { imgx } from '@imgx/core';

// Coordinate crop
const buf1 = await imgx('./photo.jpg')
  .crop({ x: 800, y: 500, w: 300, h: 300 })
  .toBuffer();

// Nine-grid origin crop
const buf2 = await imgx('./photo.jpg')
  .crop({ g: 'se', w: 900, h: 900 })
  .toBuffer();
```

## Edge Cases & Limits

- Starting coordinates outside original image range returns `BadRequest: Advance cut's position is out of image.`
- When crop range exceeds original image boundary, automatically crops to image edge
- `w` / `h` cannot exceed 16,384 px
- `g_face` / `g_auto` require IMM permissions, otherwise returns error
- See [Getting Started](./index.md) for general size/pixel limits
