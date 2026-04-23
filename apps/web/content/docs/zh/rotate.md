---
title: 手动旋转 rotate
category: transform
order: 2
---

# 手动旋转

> 将图片按指定角度顺时针旋转。

## 功能说明

- **操作名**:`rotate`
- **请求格式**:`?x-oss-process=image/rotate,{角度}`
- 顺时针旋转指定角度
- 宽高自适应包含旋转结果
- 非 90° 倍数旋转时画布扩大

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `[value]` | Integer | 是 | — | `[0, 360]` | 旋转角度(°) |

## 代码示例

### URL DSL

```
# 顺时针旋转 90°
?x-oss-process=image/rotate,90

# 顺时针旋转 70°
?x-oss-process=image/rotate,70
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/rotate,90',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./photo.jpg')
  .rotate({ value: 90 })
  .toBuffer();
```

## 边界说明

- 角度 > 90° 且非 90° 倍数时画布扩大,边角填充背景色
- 0° / 360° 不产生效果
- 图片宽或高不能超过 4,096 px
- GIF 动图旋转后会变成静态图
- 通用大小/像素上限见[快速开始](./index.md)
