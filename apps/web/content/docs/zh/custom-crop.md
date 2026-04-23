---
title: 自定义裁剪 crop
category: size
order: 2
---

# 自定义裁剪

> 通过自定义裁剪功能,您可以指定起始坐标、宽高和裁剪原点,从原图中获取指定区域的图片。

## 功能说明

- **操作名**:`crop`
- **请求格式**:`?x-oss-process=image/crop,{参数}_{值}[,...]`
- 支持坐标裁剪(x, y, w, h)
- 支持九宫格原点裁剪(g + w + h)
- 支持人脸裁剪(g_face)和智能裁剪(g_auto)

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `w` | Integer | 否 | 图片宽度 | `[0, 图片宽度]`(单位 px) | 裁剪宽度 |
| `h` | Integer | 否 | 图片高度 | `[0, 图片高度]`(单位 px) | 裁剪高度 |
| `x` | Integer | 否 | `0` | `[0, 图片宽度]`(单位 px) | 裁剪起点横坐标 |
| `y` | Integer | 否 | `0` | `[0, 图片高度]`(单位 px) | 裁剪起点纵坐标 |
| `g` | String | 否 | `nw` | 见下表 | 裁剪原点位置 |
| `p` | Integer | 否 | `100` | `[1, 200]`(单位 %) | 人脸区域倍率(仅 `g_face` 时生效) |

### 裁剪原点(`g` 参数)

九宫格原点分布:

```
┌──────────┬──────────┬──────────┐
│    nw    │  north   │    ne    │
│  (左上)  │  (中上)  │  (右上)  │
├──────────┼──────────┼──────────┤
│   west   │  center  │   east   │
│  (左中)  │  (中部)  │  (右中)  │
├──────────┼──────────┼──────────┤
│    sw    │  south   │    se    │
│  (左下)  │  (中下)  │  (右下)  │
└──────────┴──────────┴──────────┘
```

| 值 | 说明 |
| --- | --- |
| `nw` / `north` / `ne` | 上排原点(左上 / 中上 / 右上) |
| `west` / `center` / `east` | 中排原点(左中 / 中部 / 右中) |
| `sw` / `south` / `se` | 下排原点(左下 / 中下 / 右下) |
| `face` | 以最大人脸为中心裁剪(需 IMM 权限) |
| `auto` | 算法自动推荐裁剪区域(需 IMM 权限,忽略 w/h/p) |

> [!IMPORTANT]
> 使用 `g_face` / `g_auto` 需要:
> - 已绑定 IMM Project
> - 不支持匿名访问
> - 拥有 IMM 处理权限

## 代码示例

### URL DSL

```
# 从 (800, 500) 开始裁剪 300×300 px
?x-oss-process=image/crop,x_800,y_500,w_300,h_300

# 从右下角裁剪 900×900 px
?x-oss-process=image/crop,g_se,w_900,h_900

# 人脸裁剪
?x-oss-process=image/crop,g_face,w_400,h_400
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/crop,x_800,y_500,w_300,h_300',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx-kit/core';

// 坐标裁剪
const buf1 = await imgx('./photo.jpg')
  .crop({ x: 800, y: 500, w: 300, h: 300 })
  .toBuffer();

// 九宫格原点裁剪
const buf2 = await imgx('./photo.jpg')
  .crop({ g: 'se', w: 900, h: 900 })
  .toBuffer();
```

## 边界说明

- 起点坐标超出原图范围时返回 `BadRequest: Advance cut's position is out of image.`
- 裁剪范围超出原图边界时,自动裁剪至原图边缘
- `w` / `h` 不能超过 16,384 px
- `g_face` / `g_auto` 需要 IMM 权限,否则返回错误
- 通用大小/像素上限见[快速开始](./index.md)
