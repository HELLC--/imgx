---
title: 内切圆 circle
category: size
order: 4
---

# 内切圆裁剪

> 将图片裁剪为圆形(内切圆),适用于头像、图标等圆形展示场景。

## 功能说明

- **操作名**:`circle`
- **请求格式**:`?x-oss-process=image/circle,r_{半径}`
- 输入正方形或矩形图,输出圆形图
- PNG / WebP / BMP 输出时圆外为透明,JPG 输出时圆外为白色
- 半径超过最小边一半时自动收敛

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `r` | Integer | 是 | — | `[1, 4096]`(单位 px) | 内切圆半径 |

## 代码示例

### URL DSL

```
# 半径 100 px
?x-oss-process=image/circle,r_100

# 半径 100 px,输出 PNG(透明背景)
?x-oss-process=image/circle,r_100/format,png
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './avatar.jpg',
  'image/circle,r_100/format,png',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./avatar.jpg')
  .circle({ r: 100 })
  .format({ type: 'png' })
  .toBuffer();
```

## 边界说明

- 当 `r` > 原图最小边的一半时,自动取 `r = (min(width, height) - 1) / 2`,输出尺寸为 `r×2 + 1`
- JPG 输出无透明通道,圆外填充白色;需透明背景请串联 `/format,png`
- 通用大小/像素上限见[快速开始](./index.md)
