---
title: 图片缩放 resize
category: size
order: 1
---

# 图片缩放

> 通过缩放参数,您可以实时调整存储在 OSS 中图片的尺寸,无需下载到本地处理。支持等比例缩放、指定宽高缩放、长短边控制等多种模式。

## 功能说明

- **操作名**:`resize`
- **请求格式**:`?x-oss-process=image/resize,{参数}_{值}[,...]`
- 支持等比例缩放(p)和固定尺寸缩放(w/h)
- 提供 5 种缩放模式(lfit/mfit/fill/pad/fixed)
- 支持长短边控制(l/s)和放大限制(limit)

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `m` | String | 否 | `lfit` | 见下表 | 缩放模式 |
| `w` | Integer | 否 | — | `[1, 16384]`(单位 px) | 目标宽度 |
| `h` | Integer | 否 | — | `[1, 16384]`(单位 px) | 目标高度 |
| `l` | Integer | 否 | — | `[1, 16384]`(单位 px) | 目标长边长度 |
| `s` | Integer | 否 | — | `[1, 16384]`(单位 px) | 目标短边长度 |
| `p` | Integer | 否 | — | `[1, 1000]`(单位 %) | 等比例缩放百分比 |
| `limit` | Integer | 否 | `1` | `0` / `1` | `1`:目标大于原图时返回原图;`0`:允许放大 |
| `color` | String | 否 | `FFFFFF` | 6 位 RGB 十六进制 | `pad` 模式填充颜色 |

### 缩放模式(m)

以原图 200×100 px,目标 150×80 px 为例:

| 模式 | 说明 | 输出尺寸 |
| --- | --- | --- |
| `lfit` | 等比缩放,限制在 w×h 内的最大图片 | 150×75 px |
| `mfit` | 等比缩放,覆盖 w×h 的最小图片 | 160×80 px |
| `fill` | 在 `mfit` 基础上,超出部分居中裁剪 | 150×80 px |
| `pad` | 在 `lfit` 基础上,空白填充指定颜色 | 150×80 px |
| `fixed` | 固定宽高强制缩放,可能变形 | 150×80 px |

> [!NOTE]
> - 仅指定 `w` 或 `h` 时,`lfit/mfit/fixed` 按原图比例等比缩放;`pad/fill` 强制方形
> - 设置了 `w` 或 `h` 时,`l` 和 `s` 参数不生效
> - `p` 参数与 `w/h/l/s` 互斥,优先使用 `w/h/l/s`

## 代码示例

### URL DSL

```
# 等比缩小至 50%
?x-oss-process=image/resize,p_50

# 宽度 200px,高度自适应
?x-oss-process=image/resize,w_200

# 固定 100×100,居中裁剪模式
?x-oss-process=image/resize,m_fill,w_100,h_100
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/resize,p_50',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx-kit/core';

// 等比缩小至 50%
const buf1 = await imgx('./photo.jpg')
  .resize({ p: 50 })
  .toBuffer();

// 宽度 200
const buf2 = await imgx('./photo.jpg')
  .resize({ w: 200 })
  .toBuffer();

// 固定 100×100 居中裁剪
const buf3 = await imgx('./photo.jpg')
  .resize({ m: 'fill', w: 100, h: 100 })
  .toBuffer();
```

## 边界说明

- 原图限制:≤ 20 MB,单边 ≤ 30,000 px,总像素 ≤ 2.5 亿 px
- 处理后限制:单边 ≤ 16,384 px,总像素 ≤ 16,777,216 px
- 动态图(如 GIF)按 `宽 × 高 × 帧数` 计算像素
- 动图不支持 `p` 参数,仅支持指定 w/h 缩小,不支持放大
- `limit_1` 时,目标尺寸大于原图则返回原图分辨率
- 通用大小/像素上限见[快速开始](./index.md)
