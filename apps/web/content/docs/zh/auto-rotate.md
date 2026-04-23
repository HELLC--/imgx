---
title: 自适应旋转 auto-orient
category: transform
order: 1
---

# 自适应旋转

> 根据图片 EXIF 中的 Orientation 信息,自动校正图片方向。适用于手机等移动设备拍摄的带旋转元数据的图片。

## 功能说明

- **操作名**:`auto-orient`
- **请求格式**:`?x-oss-process=image/auto-orient,{value}`
- 读取 EXIF Orientation 字段并旋转像素到正向
- 处理后图片不再携带 Orientation 元数据

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `[value]` | Integer | 是 | — | `0` / `1` | `0` 保持原图方向;`1` 自适应旋转 |

## 代码示例

### URL DSL

```
# 自适应旋转
?x-oss-process=image/auto-orient,1

# 缩放并自适应旋转
?x-oss-process=image/resize,w_100/auto-orient,1
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './phone-photo.jpg',
  'image/auto-orient,1',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx/core';

const buf = await imgx('./phone-photo.jpg')
  .autoOrient({ value: 1 })
  .toBuffer();
```

## 边界说明

- 原图不含 EXIF Orientation 时,该操作不产生任何效果
- 处理后图片会重新压缩,文件大小可能与原图不同
- 大多数图片查看器会自行根据 EXIF 渲染,因此你看到的"原图"通常已被本地软件旋转过
- 通用大小/像素上限见[快速开始](./index.md)
