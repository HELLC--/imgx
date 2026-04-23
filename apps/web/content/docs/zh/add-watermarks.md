---
title: 添加水印 watermark
category: security
order: 1
---

# 添加水印

> 为图片添加水印(文字/图片/混合),保护版权和防止盗用。支持自定义水印位置、透明度、字体、颜色,以及水印平铺效果。

## 功能说明

- **操作名**:`watermark`
- **请求格式**:`?x-oss-process=image/watermark,{参数}_{值}[,...]`
- 支持文字水印、图片水印、图文混合水印
- 支持水印平铺
- 关键参数(`text` / `image`)需要 Base64-URL-safe 编码

## 参数说明

### 通用参数

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `t` | Integer | 否 | `100` | `[0, 100]`(单位 %) | 水印透明度 |
| `g` | String | 否 | `se` | 九宫格位置 | `nw/north/ne/west/center/east/sw/south/se` |
| `x` | Integer | 否 | `10` | `[0, 4096]`(单位 px) | 水平边距(仅左/右侧位置有效) |
| `y` | Integer | 否 | `10` | `[0, 4096]`(单位 px) | 垂直边距(仅上/下方位置有效) |
| `voffset` | Integer | 否 | `0` | `[-1000, 1000]`(单位 px) | 中线垂直偏移(仅中间行位置有效) |
| `fill` | Integer | 否 | `0` | `0` / `1` | `0`:不铺满;`1`:铺满原图 |
| `padx` | Integer | 否 | `0` | `[0, 4096]`(单位 px) | 平铺时水平间隔(仅 `fill=1` 时有效) |
| `pady` | Integer | 否 | `0` | `[0, 4096]`(单位 px) | 平铺时垂直间隔(仅 `fill=1` 时有效) |

### 文字水印参数

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `text` | String | 是 | — | Base64 编码字符串 | 文字内容(编码前 ≤ 64 字节) |
| `type` | String | 否 | `wqy-zenhei` | Base64 编码字体名 | 字体(`wqy-zenhei` 等) |
| `color` | String | 否 | `000000` | 6 位 RGB 十六进制 | 文字颜色 |
| `size` | Integer | 否 | `40` | `(0, 1000]`(单位 px) | 文字大小 |
| `shadow` | Integer | 否 | `0` | `[0, 100]`(单位 %) | 文字阴影透明度 |
| `rotate` | Integer | 否 | `0` | `[0, 360]`(单位 °) | 顺时针旋转角度 |

### 图片水印参数

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `image` | String | 是 | — | Base64 编码字符串 | 水印图片 Object 路径 |
| `P` | Integer | 否 | — | `[1, 100]`(单位 %) | 按原图比例缩放水印 |

> [!IMPORTANT]
> - `text` 和 `image` 必须进行 Base64 URL-safe 编码
> - 图片水印仅能使用当前存储空间内的图片
> - 单张图片最多支持 3 张不同的图片水印

## 代码示例

### URL DSL

```
# 文字水印("Hello": SGVsbG8)
?x-oss-process=image/watermark,text_SGVsbG8

# 图片水印(panda.png: cGFuZGEucG5n)
?x-oss-process=image/watermark,image_cGFuZGEucG5n

# 图文混合水印
?x-oss-process=image/watermark,image_cGFuZGEucG5n,text_SGVsbG8

# 平铺水印
?x-oss-process=image/watermark,text_Q29weXJpZ2h0,fill_1
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/watermark,text_SGVsbG8',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx-kit/core';

// 文字水印
const buf1 = await imgx('./photo.jpg')
  .watermark({ text: 'SGVsbG8' })
  .toBuffer();

// 图片水印
const buf2 = await imgx('./photo.jpg')
  .watermark({ image: 'cGFuZGEucG5n' })
  .toBuffer();

// 图文混合
const buf3 = await imgx('./photo.jpg')
  .watermark({ image: 'cGFuZGEucG5n', text: 'SGVsbG8' })
  .toBuffer();

// 平铺
const buf4 = await imgx('./photo.jpg')
  .watermark({ text: 'Q29weXJpZ2h0', fill: 1 })
  .toBuffer();
```

## 边界说明

- `text` 和 `image` 必须 Base64 URL-safe 编码
- `text` 编码前长度上限 64 字节
- `image` 必须为同一 bucket 下的图片
- `fill_1` 与 `g` / `x` / `y` 互斥
- 通用大小/像素上限见[快速开始](./index.md)
