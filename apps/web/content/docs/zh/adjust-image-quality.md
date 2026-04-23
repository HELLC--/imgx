---
title: 质量调节 quality
category: effect
order: 2
---

# 质量调节

> 通过质量变换参数,您可以实时调整图片的压缩质量,在画质和文件体积之间取得最佳平衡。

## 功能说明

- **操作名**:`quality`
- **请求格式**:`?x-oss-process=image/quality,{参数}_{值}`
- 支持相对质量(q)和绝对质量(Q)调节
- 仅对 JPG / WebP 有效,PNG / GIF 等无损格式无效
- `q` 与 `Q` 同时存在时 `Q` 优先

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `q` | Integer | 否 | — | `[1, 100]`(单位 %) | 相对质量:在原图质量基础上按百分比压缩 |
| `Q` | Integer | 否 | — | `[1, 100]`(单位 %) | 绝对质量:直接指定目标质量 |

> [!NOTE]
> - `q` 相对质量:原图 80%,设置 `q_90` 输出 72%(80% × 90%)
> - `Q` 绝对质量:原图 ≥ 目标值时压缩至目标值,< 目标值时保持原图质量
> - JPG 格式 `q` 为相对质量;WebP 格式 `q` 等同 `Q`(绝对质量)
> - `q` 与 `Q` 同时存在时,`Q` 优先

## 代码示例

### URL DSL

```
# 相对质量 90%
?x-oss-process=image/quality,q_90

# 绝对质量 75%
?x-oss-process=image/quality,Q_75
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/quality,q_90',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx/core';

// 相对质量
const buf1 = await imgx('./photo.jpg')
  .quality({ q: 90 })
  .toBuffer();

// 绝对质量
const buf2 = await imgx('./photo.jpg')
  .quality({ Q: 75 })
  .toBuffer();
```

## 边界说明

- 仅对 JPG / WebP 有效
- PNG / GIF 等无损格式不受影响
- `q` 与 `Q` 同时存在时 `Q` 优先
- 通用大小/像素上限见[快速开始](./index.md)
