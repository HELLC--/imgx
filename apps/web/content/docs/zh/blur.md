---
title: 图片模糊 blur
category: effect
order: 1
---

# 图片模糊

> 对图片进行高斯模糊处理,支持整体模糊和按人脸区域局部模糊,适用于隐私保护、多图层合成等场景。

## 功能说明

- **操作名**:`blur`
- **请求格式**:`?x-oss-process=image/blur,{参数}_{值}[,...]`
- 整体高斯模糊,半径与标准差独立可调
- 可选按 IMM 人脸识别结果定位最大人脸或全部人脸
- 支持自定义人脸模糊区域倍率

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `r` | Integer | 是 | — | `[1, 50]` | 模糊半径,值越大越模糊 |
| `s` | Integer | 是 | — | `[1, 50]` | 正态分布标准差,值越大越模糊 |
| `g` | String | 否 | — | `face` / `faces` | 模糊作用范围:最大人脸 / 所有人脸 |
| `p` | Integer | 否 | `100` | `[1, 200]`(单位 %) | 人脸区域倍率(仅 `g` 生效时) |

> [!IMPORTANT]
> 使用 `g_face` / `g_faces` 需要:
> - 已绑定 IMM Project
> - 不支持匿名访问
> - 拥有 IMM 处理权限

## 代码示例

### URL DSL

```
# 整体模糊
?x-oss-process=image/blur,r_10,s_10

# 模糊最大人脸
?x-oss-process=image/blur,r_10,s_10,g_face
```

### processImage(URL 字符串)

```ts
import { processImage } from '@imgx-kit/core';

const buf = await processImage(
  './photo.jpg',
  'image/blur,r_10,s_10',
);
```

### imgx 链式 API

```ts
import { imgx } from '@imgx-kit/core';

const buf = await imgx('./photo.jpg')
  .blur({ r: 10, s: 10 })
  .toBuffer();
```

## 边界说明

- `r` / `s` 越界(`< 1` 或 `> 50`)将返回参数错误
- `g_face` 与 `g_faces` 不可同时出现,以最后一个为准
- 不传 `g` 时,`p` 无效
- 通用大小/像素上限见[快速开始](./index.md)
