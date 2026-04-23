---
title: 圆角矩形 rounded-corners
category: size
order: 5
---

# 圆角矩形

> 将图片裁剪为圆角矩形形式,适用于卡片式 UI、缩略图展示等场景。

## 功能说明

- **操作名**:`rounded-corners`
- **请求格式**:`?x-oss-process=image/rounded-corners,r_{半径}`
- 支持透明圆角(PNG / WebP / BMP)
- JPG 输出时圆角外填充白色
- 半径超出时按最大内切圆处理

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `r` | Integer | 是 | — | `[1, 4096]`(单位 px) | 圆角半径 |

## 代码示例

### URL DSL

```
# 圆角半径 30 px
?x-oss-process=image/rounded-corners,r_30

# 先裁剪再加圆角,输出 PNG
?x-oss-process=image/crop,w_100,h_100/rounded-corners,r_10/format,png
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './card.jpg',
  'image/rounded-corners,r_30',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./card.jpg')
  .roundedCorners({ r: 30 })
  .toBuffer();
```

## 边界说明

- 当 `r` > 原图最小边的一半时,按最大内切圆处理(`r = min(width, height) / 2`)
- JPG 输出无透明通道,圆角外填充白色;需透明背景请串联 `/format,png`
- GIF 格式暂不支持圆角矩形操作
- 通用大小/像素上限见[快速开始](./index.md)
