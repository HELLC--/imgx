---
title: 索引切割 indexcrop
category: size
order: 3
---

# 索引切割

> 将图片按照固定长度沿 x 轴或 y 轴等分切割,并返回指定索引的区域。适用于雪碧图拆分、长图分段展示等场景。

## 功能说明

- **操作名**:`indexcrop`
- **请求格式**:`?x-oss-process=image/indexcrop,{参数}_{值}[,...]`
- 沿 x 轴或 y 轴等分切割
- 返回指定索引的区域(从 0 开始)
- x 与 y 互斥,同时指定时 y 优先

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `x` | Integer | 条件必填 | — | `[1, 图片宽度]`(单位 px) | x 轴切割区域长度(与 `y` 互斥) |
| `y` | Integer | 条件必填 | — | `[1, 图片高度]`(单位 px) | y 轴切割区域长度(与 `x` 互斥) |
| `i` | Integer | 否 | `0` | `[0, 区域数)` | 返回的区域索引(从 0 开始) |

## 代码示例

### URL DSL

```
# 沿 x 轴以 100px 为单位切割,取第 1 块
?x-oss-process=image/indexcrop,x_100,i_0

# 沿 y 轴以 200px 为单位切割,取第 3 块
?x-oss-process=image/indexcrop,y_200,i_2
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './sprite.jpg',
  'image/indexcrop,x_100,i_0',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./sprite.jpg')
  .indexcrop({ x: 100, i: 0 })
  .toBuffer();
```

## 边界说明

- 必须指定 `x` 或 `y` 之一,不可同时省略
- 同时指定 `x` 和 `y` 时,以 `y` 为准
- 索引超出实际区域数量时,返回原图
- 通用大小/像素上限见[快速开始](./index.md)
