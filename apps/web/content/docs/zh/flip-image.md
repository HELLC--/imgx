---
title: 图片翻转 flip
category: transform
order: 3
---

# 图片翻转

> 对图片进行垂直翻转、水平翻转或双向翻转。

## 功能说明

- **操作名**:`flip`
- **请求格式**:`?x-oss-process=image/flip,{value}`
- 支持垂直翻转(上下镜像)
- 支持水平翻转(左右镜像)
- 支持双向翻转(等同旋转 180°)

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `[value]` | Integer | 是 | — | `0` / `1` / `2` | `0`:垂直翻转;`1`:水平翻转;`2`:双向翻转 |

## 代码示例

### URL DSL

```
# 垂直翻转(上下镜像)
?x-oss-process=image/flip,0

# 水平翻转(左右镜像)
?x-oss-process=image/flip,1

# 双向翻转(等同旋转 180°)
?x-oss-process=image/flip,2
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/flip,1',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./photo.jpg')
  .flip({ value: 1 })
  .toBuffer();
```

## 边界说明

- 输出尺寸与原图相同
- 通用大小/像素上限见[快速开始](./index.md)
