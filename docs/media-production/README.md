# 图像与视频说明制作

首批制作日期：2026-10-23；补充截图日期：2026-10-24。成品位于 `assets/tutorials/`，与正文一起静态部署。

## 已覆盖的内容

| 内容 | 位置 | 形式 |
| --- | --- | --- |
| 空白控制台、提交前模型/参数/提示词检查 | 生成第一张图片 | 截图 + 15 秒短片 |
| 模型入口、图片参数、参考图引用 | 控制台图片生成 | 截图 + 15 秒引用短片 |
| 首帧、视频模式、时长与镜头描述 | 控制台视频生成 | 截图 + 15 秒短片 |
| 图片输出连接视频输入，检查下游首帧 | 项目空间与画布 | 截图 + 15 秒短片 |
| 模板浏览、实际拖入与配置检查 | 工作流模板 | 3 张新截图 + 15 秒分步短片，另保留原节点结构示意 |
| 个人素材引用菜单、组合筛选与批量下载选区 | 生成资产与个人素材 | 3 张截图 |
| 焦段、结构化提示词、个人模板库与编辑 | 提示词与模板 | 4 张截图 |
| 接收人搜索、已选标签和分享范围 | 消息通知与素材分享、权限与共享范围 | 2 张局部截图 |

| 控制台三个功能开关 | 登录与个人设置 | 1 张截图 |
| 视频截帧入口与两种保存去向 | 控制台视频生成 | 2 张截图 |
| 置顶配置卡片与复用入口 | 控制台图片生成 | 1 张截图 |
| 邀请状态、角色管理、共享文件夹及目录内素材 | 团队协作与共享素材 | 4 张截图 |
| 发布卡片预览与确认入口 | Playground 作品发布 | 1 张截图 |

共 29 张文档截图、5 条 15 秒 MP4、5 张封面、5 份 WebVTT 字幕。截图支持放大；视频按需播放、离开视口暂停、支持全屏和下载；同页保留文字步骤。

## 场景规范

- 复用当前 genow-v2 的真实 React 组件；头部与空白区是文档演示容器，不是完整生产界面。
- 控制台无生成历史；引用菜单只保留一张咖啡杯示意图；资产演示页仅一张图片和一段相关静态短片；画布只有两个相关节点。
- 新增模板和接收人来自虚构本地数据；截图停在编辑或发送前，不冒充保存或发送成功。弹窗背后的模糊效果由真实产品组件产生。
- 咖啡杯由本项目 SVG 绘制，是示意素材，不代表生成效果。
- 本地接口仅返回虚构数据。POST 仅允许 `docs-workflow` 项目的固定示例模板导入，并返回内存演示数据；其他 POST 返回 405。PATCH 只回显节点配置或返回虚构偏好，不连接业务后端。刷新工作流页恢复空画布。
- 不读取实际账号，不清理或修改用户历史，不提交付费生成任务。
- 视频由截图、步骤文字和高亮框组成，标注为“分步讲解”，不伪装为连续实录。
- 模型列表仅反映制作时的组件；文档提醒读者以账号可用模型为准。

## 重拍截图

在项目根目录运行：

```sh
node docs/media-production/serve-capture.mjs ../genow-v2/frontend
```

依赖已安装的 genow-v2 前端；启动器会在系统临时目录新建隔离 Next 应用，监听本机 3116，不改业务项目。

- `http://localhost:3116/?scene=empty`：空白控制台。
- `http://localhost:3116/?scene=image`：图片提示词，点击模型/参数入口。
- `http://localhost:3116/?scene=reference`：仅一张参考图，待提示词加载后输入 `@` 并选择图片。
- `http://localhost:3116/?scene=video-frame`：首帧场景，点击模式/参数入口。
- `http://localhost:3116/canvas`：将图片节点右侧端口拖到视频节点左侧端口，打开视频节点并等待“已保存”。

首批浏览器截图尺寸为 1280×800。2026-10-24 补充截图使用默认 1280×720 浏览器画面；分享弹窗在浏览器截图时截取 720×290 的相关区域，避免把大量空白压缩进文章，未重绘界面。确认所有图标和图片加载完成，再保存到 `video/assets/`；需要显示在文档中的截图同步到 `assets/tutorials/`。首批组件源文件的 SHA-256 记录在 `provenance.json`，补充批次记录在 `provenance-2026-10-24.json`，其中同时保存图片哈希。生成器与组件来自不同仓库，升级产品后应重新核对截图。

## 重拍补充截图（2026-10-24）

本批用静态截图解释入口和待提交状态，不新增视频。无需调用真实生成或消息接口。

1. 打开 `http://localhost:3116/?scene=empty`，点击“提示词生成”。填入手册中的玻璃鸢尾花描述，展开焦段菜单，保存 `prompt-focal.jpg`。
2. 选择 35 mm 和“逆光”，关闭菜单，保存 `prompt-ready.jpg`。不点击生成或提示词优化。
3. 点击“模板”加号，切换“我的模板”，保存 `prompt-templates.jpg`。列表仅一份“月光玻璃花园”示例。
4. 点击“新建”，填写名称和主体、场景、视觉、限制四段正文，保存 `prompt-template-edit.jpg`。不点击“保存”。
5. 在新标签页打开 `http://localhost:3116/share`，输入“演示”，展开候选列表，保存 `share-search.jpg`（1280×720 画面中的 x=280、y=240、w=720、h=290）。
6. 选择“演示审核员”，点击标题旁“分享给用户说明”，保存 `share-ready.jpg`（x=280、y=200、w=720、h=290）。不点击“发送分享”。

新增截图放在 `assets/tutorials/`，通过普通 Markdown 图片语法嵌入文章，沿用点击放大。正文明确解释演示场景、虚构账号和未提交状态。同步核对了当前焦段选项、模板保存/删除入口，以及分享弹窗没有留言和回执入口的边界；其他未拍摄章节不代表完成全面界面审计。

## 功能开关、资产、工作流与截帧补充批次

本批通过 Chrome 操作真实 `SettingsPanel`、生成资产页面、`CanvasEditor` 和 `MediaLightbox`。采用浏览器当前视口拍摄完整 JPEG，再裁取功能区域；不改变组件样式，不重绘界面。本轮没有可靠确认 75% 缩放，因此不把截图标注为 75% 或 MacBook 原生录屏。原图宽 2560，高度随 Chrome 工具栏状态为 1262 或 1318；具体尺寸及裁取范围记录在 `capture/crops-2026-10-24-next.json`。Chrome 局部截图接口出现重复拼接，已改用完整截图裁取，并逐张检查。

1. `/settings`：显示虚构账号及三个开启的开关，保存 `settings-panels-full.jpg`。
2. `/assets?type=all&favorite=1`：显示控制台图片和视频、收藏筛选；保存 `assets-filters-full.jpg`。
3. 点击下载图标，再选择两项素材，确认“下载 (2)”，保存 `assets-download-full.jpg`。停在下载前。
4. `/workflow`：打开工作流模板，展开唯一模板简介，保存 `workflow-library-full.jpg`。将卡片拖至空白区域，保存 `workflow-imported-full.jpg`；点击上游图片节点，保存 `workflow-config-full.jpg`。导入接口只作用于此隔离页面，没有提交生成。
5. `/frame`：本地四秒静态咖啡杯短片，保存 `frame-entry-full.jpg`；点击“截取当前帧”，核对时刻与两个按钮，保存 `frame-actions-full.jpg`。不点击加入素材库。四秒是示意文件时长，不代表模型支持四秒生成。

将完整截图保存在同一个目录，再运行：

```sh
node docs/media-production/crop-screenshots.mjs /path/to/full-screenshots
```

裁取脚本使用项目已有 Sharp，只提取矩形区域，不合成、滤镜或重绘。生成八张正文截图，并把三张工作流镜头同步到独立视频工程。哈希和实际组件来源见 `provenance-2026-10-24-next.json`。示意短片由 `capture/cup.svg` 转为静帧后用 FFmpeg 编码成四秒 H.264，非 AI 生成。

### 重导出工作流短片

`workflow-video/` 是独立 15 秒工程，不修改原四条视频母版。先在本机提供有授权的中文字体；macOS 可在本地渲染时复制字体文件，字体本身已忽略 Git 提交：

```sh
mkdir -p docs/media-production/workflow-video/assets/fonts
cp '/System/Library/Fonts/STHeiti Light.ttc' docs/media-production/workflow-video/assets/fonts/STHeiti-Light.ttc
cd docs/media-production/workflow-video
npx hyperframes@0.8.186 check --json
npx hyperframes@0.8.186 snapshot --review
npx hyperframes@0.8.186 preview --background
npx hyperframes@0.8.186 render --quality delivery --output workflow-master.mp4
cd ../../..
python3 docs/media-production/export-tutorials.py --group workflow
npm run verify-tutorials -- --probe
npm run build
```

沿用现有静音分步短片风格；每步五秒，配中文文字和 WebVTT 字幕，明确不是连续录屏。`SPEC.md` 与 `REVIEW.md` 保存在该工程中。

## 修改与导出首批视频

`video/index.html` 为 60 秒制作母版，12 个场景分别在 `video/compositions/`。`stories.json` 记录镜头文字与高亮坐标；改文字时同时更新 HTML、字幕和正文步骤。`BRIEF.md`、`SPEC.md`、`REVIEW.md` 记录约束和检查结果。

需要 Node.js 22+、FFmpeg、HyperFrames 0.8.186。GSAP 已本地保存。中文字体使用 macOS 的 STHeitiSC-Light；在其他系统渲染前需提供有授权的中文字体，并更新 @font-face。

```sh
cd docs/media-production/video
npx hyperframes@0.8.186 check --json
npx hyperframes@0.8.186 snapshot --review
npx hyperframes@0.8.186 preview --background
npx hyperframes@0.8.186 render --quality delivery --output tutorials-master.mp4
cd ../../..
python3 docs/media-production/export-tutorials.py
npm run verify-tutorials -- --probe
npm run build
```

默认导出组 `base` 仅切分首批四条短片，`--group workflow` 只导出新增工作流短片；各组按 manifest 声明时长累计切分，生成 H.264 / yuv420p MP4，并启用 faststart。`--probe` 额外使用 FFprobe 校验视频尺寸、编码和时长。常规构建只校验资源存在、封面尺寸及字幕时间，不要求 FFmpeg。

## 验证记录

HyperFrames 的结构、运行时、布局、运动、对比度检查通过；保留母版的静音提示，因为成品用于帮助文档中的静音按需观看。细小参数在手机竖屏中需全屏查看，正文与静态截图提供相同信息。最终视频经过 FFprobe 校验和解码抽帧检查；站点构建检查文档、链接、媒体和搜索索引。

## 置顶、协作与发布补充批次

新增六张截图，继续复用真实 React 组件和样式，使用独立本地演示数据：一个团队项目、三位已加入成员、两位候选用户、三个文件夹、一张咖啡杯示意素材和一条置顶配置。没有向业务后端发送邀请、改权限、移动文件、复用配置或发布作品。

本轮 Chrome 完整截图为 1512 × 827 像素；仅矩形裁取，无放大或重新绘制。浏览器截图可用，但 macOS 锁屏阻止了原生应用截图，故不声称为 Retina 原生截图，也没有验证 75% 缩放。正文图片现在以原图像素宽度为上限，避免窄面板被拉伸而模糊。原始图与裁取图的哈希、组件来源见 `provenance-2026-10-24-collaboration.json`。

启动独立环境后，在 Chrome 中按以下顺序重拍：

1. `/team` → “邀请项目成员”：显示一位待邀请用户和一位“等待接受”用户，保存 `team-invite-full.jpg`，不发送或取消邀请。
2. 关闭邀请 → “管理项目成员”：显示所有者、编辑者和只读成员，保存 `team-roles-full.jpg`，不更改权限。
3. 关闭管理 → “共享素材”：显示三个文件夹，保存 `shared-folders-full.jpg`；进入“产品原图”，保存 `shared-folder-detail-full.jpg`。
4. `/pins?scene=image` → 聚焦“置顶”并按 Enter 展开，保存 `console-pin-full.jpg`。复用回调刻意不提交，不演示回填成功；截图只用于辨认配置与按钮。
5. `/publish` → “上传到 Playground”：保存 `playground-preview-full.jpg`，不点击“确认上传”。当前真实弹窗只有预览与确认/关闭，正文已移除“公开范围提示”存在于界面的错误暗示。

```sh
node docs/media-production/crop-collaboration-screenshots.mjs /path/to/full-screenshots
npm run build
npm test
```

裁取坐标见 `capture/crops-2026-10-24-collaboration.json`。这组内容适合静态对照，本轮不增加与截图重复的步骤短片；原有五条视频保持可用。

本批验证：生产构建通过（27 个静态路由、19 篇搜索文章）；现有 5 项测试通过；六张新图全部加载，三个章节的图片放大窗口可打开；团队截图显示宽度不超过原图宽度。原有五条视频、封面与字幕随构建完成校验。

## 全手册补充批次（2026-10-25）

对 19 篇正式文章逐小节核对，记录见 [覆盖表](coverage-complete.md)。新增 39 张矩形裁取截图：36 张操作画面，以及共享移动的 3 张分步源图（其中完成图也用于文章）。素材库累计 68 张截图、7 条 15 秒短片、7 张封面和 7 份字幕。文章继续使用 ImageCard / VideoCard；所有图片以原始宽度为上限，可点击放大。

本批使用 Chrome 在本机呈现当前 genow-v2 真实 React 组件。完整截图存在 2560×1318、1920×1102、1512×827 / 771 等尺寸；不声称全部为 macOS Retina 录屏或已核验 75% 缩放。仅矩形裁取，无重绘、补帧或 UI 合成。咖啡杯是明确标注的示意素材，统计和错误均为虚构演示数据。

独立环境新增 `complete-page.tsx`、`complete-data.ts`、`complete-api.ts`，分为个人、创作、协作和管理员场景。只在内存保存标记图、空节点、连线与素材目录移动，重启即重置；其余提交被阻止。没有新增业务 API，也未修改 Genow 生产组件。

### 重拍路径与停留点

启动 `node docs/media-production/serve-capture.mjs ../genow-v2/frontend` 后，以 Chrome 打开 `http://localhost:3116`：

| 分组 | 路径 | 操作与截图 |
| --- | --- | --- |
| 个人 | `/complete?scene=nav` | 导航；头像中切到用量统计、模型设置；不填密钥 |
| 创作 | `/complete?scene=project` | 填项目名称，停在创建前 |
| 创作 | `/complete?scene=paint` | 标记圆形→保存新节点→连接图像节点并填要求；不生成。选节点点击删除，停在确认前 |
| 创作 | `/complete?scene=copy` | 真实组件呈现已核对的复制结果：原图旁是同类型空节点；演示位置分开便于比较 |
| 创作 | `/?scene=video-frame`、`/?scene=video-smart` | 核对首尾帧、智能参考；清空提示词拍必填缺失 |
| 创作 | `/complete?scene=vidu`、`kling` | 新建主体表单填写名称／外观；不上传或创建资源 |
| 创作 | `/assets?type=all&favorite=1` | 删除选区→确认按钮前；切到个人画布来源拍空筛选 |
| 创作 | `/complete?scene=failure` | 展示明确标注的演示错误 |
| 协作 | `/team` | 参考素材展开菜单；共享素材根目录的杯子拖入产品原图→进入核对 |
| 协作 | `/complete?scene=notifications`、`shareview` | 通知邀请按钮；内容分享已发送；接收方预览。无真实消息发送 |
| 协作 | `/complete?scene=playground` | 三个分类与作品详情；不真实发布 |
| 管理员 | `/complete?scene=users` | 新建表单、信息修改中的独立保存容量；不提交 |
| 管理员 | `dashboard`、`models`、`usage`、`storage`、`errors` | 均为 `/complete?scene=…`；模型切分类显示排序手柄；存储打开运行详情；错误按 docs_demo 搜索并展开 |
| 管理员 | `templates`、`template`、`announcement` | 系统模板启用状态；工作流已保存状态；公告草稿受众与时间及已发布详情；不提交公告 |

当前消息中心已移除私信撰写，因此按现有“收到的／已发送”替换原计划中的私信截图。涂抹标记保存不调用模型，个人密钥启停／删除、模型排序、Kling 必填视角及 Playground 分类说明同步更新。

保存对应 `*-full.jpg`，按 `capture/crops-complete.json` 裁取。源文件尺寸变化时必须重新审查矩形，不可沿用错误坐标：

```sh
node docs/media-production/crop-complete-screenshots.mjs /path/to/full-screenshots
```

`provenance-complete.json` 保存源图尺寸、裁取矩形、原图／成品 SHA-256 与代码版本；`source-components-complete.json` 记录实际组件和演示文件的哈希。

### 重导出两条新短片

`complete-video/` 是独立 30 秒工程，前 15 秒为涂抹标记，后 15 秒为共享整理。每步 5 秒，静音中文讲解，真实截图按原始像素限制显示。修改后同步正文、WebVTT、SPEC 和 REVIEW。

```sh
mkdir -p docs/media-production/complete-video/assets/fonts
cp '/System/Library/Fonts/STHeiti Light.ttc' docs/media-production/complete-video/assets/fonts/STHeiti-Light.ttc
cd docs/media-production/complete-video
npx hyperframes@0.8.186 check --json
npx hyperframes@0.8.186 snapshot --review
npx hyperframes@0.8.186 preview --background --port 3127
npx hyperframes@0.8.186 render --quality delivery --fps 30 --output complete-master.mp4
cd ../../..
python3 docs/media-production/export-tutorials.py --group complete
npm run verify-tutorials -- --probe
npm test
npm run build
```

中文字体需由本机合法提供，不提交系统字体。`--group complete` 不覆盖前五条视频。编辑预览也可在 [HyperFrames 桌面应用](https://hyperframes.dev/studio/download) 中继续。

### 本批验收结果

- 现有 5 项测试通过；生产构建通过，导出 27 个静态路由，Pagefind 收录 19 篇正式文章。
- 全部 7 条视频的媒体、封面、字幕与导出校验通过。两条新增视频由 FFprobe 确认为 H.264、1920×1080、30 fps、15.000 秒、无音轨。
- 逐张审阅本批 39 张截图并修正裁取边界；HyperFrames 检查及分步、接缝、手机审阅通过，仅保留符合要求的静音提示。
- Chrome 实测画布章节锚点、图片放大、按钮关闭及 Esc 关闭；新增涂抹视频完整播放到 15 秒，原生播放器可选择简体中文，字幕轨道加载成功。
- 390×844 窄屏检查：正文宽度与滚动宽度同为 390px，可见图片宽 346px，没有横向溢出或超过原图宽度；结束后恢复浏览器尺寸。
- 下载自动化等待超时，改用 HTTP 下载检查：两条新增 MP4 和两份 VTT 均返回 200，文件字节与 assets 源文件完全一致；不将下载自动化记录为通过。

## 连线切断操作补充（2026-10-28）

在画布章节新增“Ctrl + 右键划动切断多条连线”，同步快捷操作表，并复用 `assets/canvas_mode/切断节点间连线.mp4`。源视频为已有真实录屏，3828×2304、30 fps、约5.687秒；未重绘、转码、重新录制或覆盖文件。视频逐条展示手势，正文明确说明它不是一次切断多条的演示，批量行为依据当前 SliceLayer 实现核对。新增素材数量为0，原有7条15秒分步短片的统计不变。

代码核对：`genow-v2/frontend/src/components/canvas/editor/SliceLayer.tsx` 检查右键与 Ctrl，累计拖动路径，松开右键后收集所有相交且可删除的边；距离不足10个坐标像素时不触发；Esc 在拖动中取消。`CanvasEditor.tsx` 仅在 canEdit 时挂载手势层，handleSlice 逐条删除并移除本地连线，不删除节点。服务器删除失败目前仅记录到控制台，因此正文提示刷新后复查，未宣称已有回滚或用户可见成功提示。

来源校验见 `slice-video-source.json`。使用既有 VideoCard 按需播放、默认静音并提供下载；原录屏有AAC音轨，未将其登记为无音轨的新短片。
