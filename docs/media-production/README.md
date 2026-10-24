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
