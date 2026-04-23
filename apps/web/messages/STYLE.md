# imgx web 翻译风格指南

本指南是所有 `apps/web/messages/**/*.json` 文案与 `app/[locale]/**` 内联文案的硬性约束。新增/修改任何 key,先读这份文件。

## 中文

- 开发者口吻,简洁直白。避免英译中腔:不要"基于 X 的 Y 库",改"为 Y 设计的 X""X 驱动的 Y"
- 按钮、菜单、tab、表单 label 不带句号;描述性整句保留句号
- 技术名词保留英文:URL、Builder、API、WebP、TypeScript、sharp、libvips、Node.js
- 动词直用,不堆砌:"处理图片" 而非 "进行图片处理";"压缩" 而非 "做压缩处理"
- 不要"您",统一"你"
- 数字与英文之间空格:`Node.js 18+`、`12 个操作`

## 英文

- 遵循 Microsoft Writing Style Guide
- UI label 用 sentence case(仅首字母大写),按钮用动词原型:"Run"、"Copy"、"Get started"
- 描述整句完整句号;UI label / 短语不加句号
- 主动语态优先,简短直接;避免 "It is recommended to..."、"You can..."
- 数字、复数、时间走 ICU,不要拼接

## Key 命名

- `camelCase`,层次 ≤ 2 层
- 语义化:`home.heroTitle` 而非 `home.t1`
- 占位符统一 ICU `{name}`、`{count, plural, ...}`;禁止 `%s` / `{0}`
- 命名空间一一对应一个 JSON 文件:`common`、`home`、`playground`、`docs`、`errors`、`metadata`
- 同一概念在两端 locale key **必须完全一致**;`tests/i18n.test.ts` 会强校验

## ICU 格式约定

所有日期/时间/数字走 ICU,禁止字符串拼接。规范化 skeleton:

- 日期(短):`{date, date, yMMMd}` → zh `2024年1月5日` / en `Jan 5, 2024`
- 日期(完整):`{date, date, full}`
- 时间:`{time, time, short}` → zh 24h `14:30` / en 12h `2:30 PM`(不指定 hourCycle,跟随 locale 默认)
- 数字:`{n, number}`;百分比 `{p, number, percent}`;字节走自定义 helper(不在 ICU 内)
- 货币:本项目无定价文案;新增前先与维护者确认

## 复数

- en:使用 `{count, plural, one {…} other {…}}`,必要时加 `=0`
- zh:只允许 `other`,可加 `=0` / `=1` 特例处理 UX(如"暂无结果" vs "1 项")。**不要**为 zh 写 `one`,会被 i18n 测试拒绝
- 两端必须使用同一 key,但分支可以不同

## Key 层级

- 完整路径形如 `<namespace>.<group>.<leaf>`,层级 ≤ 3 层(命名空间算 1 层)
- 单一命名空间内若只有少量 key,可省略 group:`common.cancel`、`home.heroTitle`
- 组名用名词或场景:`playground.toolbar.export`、`errors.network.timeout`

## 命名空间

初始命名空间(可扩展):`common`、`home`、`playground`、`docs`、`errors`、`metadata`。

新增命名空间需:
1. 在 `apps/web/i18n/request.ts` 注册并合并加载
2. 同步在 `messages/zh/` 和 `messages/en/` 创建同名 JSON
3. 在本指南此列表中追加

## 错误文案

`errors.*` 适用于面向用户的错误提示:

- 中性、克制,不带 "Sorry"/"抱歉";不要责备用户("Invalid input" 而非 "You entered invalid input")
- 结构:一句标题 + 可选一句操作建议;两句都加句号
- 不要原样透出后端/异常信息;若需保留技术细节,放 `errors.<x>.detail` 单独 key
- 服务端消息走插值 `{message}`,文案模板需自洽:`"上传失败:{message}"`

## 品牌与产品名

- 产品名 `imgx` 全小写,即使句首
- 一级模块名 `Playground`、`Builder`、`Studio` **不翻译**,中英文均保留英文写法
- 三方品牌按官方写法:`Node.js`、`TypeScript`、`sharp`(全小写)、`libvips`、`WebP`

## Rich Text

next-intl 富文本只允许使用消息内嵌标签(`<link>`、`<bold>`、`<br/>` 等),由 `t.rich` 在组件侧映射为真实 React 节点。

- **禁止**在 JSON 中写裸 HTML(`<a href>`、`<span>`)
- **禁止**用 `\n` 控制布局,改用 `<br/>` 或拆分多 key
- 标签名小写,与组件侧 `t.rich(key, { link: ... })` 对应

## Review checklist

提交前自查:
- [ ] 没有句号/感叹号风格不一致
- [ ] 没有"基于…的"开头
- [ ] 没有 placeholders 残留(`TODO`、`xxx`、`待译`)
- [ ] 中英文两端 key 数量、路径完全一致
