# 图像与视频说明制作

制作日期：2026-10-23。成品位于 `assets/tutorials/`，与正文一起静态部署。

## 已覆盖的内容

| 内容 | 位置 | 形式 |
| --- | --- | --- |
| 空白控制台、提交前模型/参数/提示词检查 | 生成第一张图片 | 截图 + 15 秒短片 |
| 模型入口、图片参数、参考图引用 | 控制台图片生成 | 截图 + 15 秒引用短片 |
| 首帧、视频模式、时长与镜头描述 | 控制台视频生成 | 截图 + 15 秒短片 |
| 图片输出连接视频输入，检查下游首帧 | 项目空间与画布 | 截图 + 15 秒短片 |
| 上下游节点结构 | 工作流模板 | 结构截图；不冒充模板导入过程 |
| 个人素材引用菜单 | 生成资产与个人素材 | 仅一张示例素材的截图 |

共 9 张文档截图、4 条 15 秒 MP4、4 张封面、4 份 WebVTT 字幕。截图支持放大；视频按需播放、离开视口暂停、支持全屏和下载；同页保留文字步骤。

## 场景规范

- 复用当前 genow-v2 的真实 React 组件；头部与空白区是文档演示容器，不是完整生产界面。
- 控制台无生成历史；素材列表只保留一张咖啡杯示意图；画布只有两个相关节点。
- 咖啡杯由本项目 SVG 绘制，是示意素材，不代表生成效果。
- 本地接口仅返回虚构数据。POST 返回 405；节点 PATCH 只回显配置，不连接业务后端。
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

浏览器截图尺寸为 1280×800。确认所有图标和图片加载完成，再保存到 `video/assets/`；需要显示在文档中的截图同步到 `assets/tutorials/`。当前组件源文件的 SHA-256 记录在 `provenance.json`。生成器与组件来自不同仓库，升级产品后应重新核对截图。

## 修改与导出视频

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

导出脚本按 manifest 顺序切分四条短片，生成 H.264 / yuv420p MP4，并启用 faststart。`--probe` 额外使用 FFprobe 校验视频尺寸、编码和时长。常规构建只校验资源存在、封面尺寸及字幕时间，不要求 FFmpeg。

## 验证记录

HyperFrames 的结构、运行时、布局、运动、对比度检查通过；保留母版的静音提示，因为成品用于帮助文档中的静音按需观看。细小参数在手机竖屏中需全屏查看，正文与静态截图提供相同信息。最终视频经过 FFprobe 校验和解码抽帧检查；站点构建检查文档、链接、媒体和搜索索引。
