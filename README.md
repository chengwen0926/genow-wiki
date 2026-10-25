# Genow Wiki

基于 Next.js、React 和 Markdown 的 Genow 用户手册与帮助中心。文章、导航、媒体和搜索索引在构建时生成。推荐使用根目录的 `python setup.py` 一键安装、构建和启动，保留旧版 `3002` 端口入口。

Python 负责启动流程，Node.js 提供静态文件服务；新版无需 FastAPI、8002 后端或 API 地址配置。也可将构建产物交给 Nginx 等静态服务器托管，此时运行网站无需 Python 或 Node.js。

## 快速开始：一键启动

需要 Python 3.9+、Node.js 22.13+ 和 npm。`python` 应指向 Python 3；如系统使用 `python3`，将下文的 `python` 替换为 `python3`。

首次获取项目：

```bash
git clone https://github.com/chengwen0926/genow-wiki.git
cd genow-wiki
python setup.py
```

已有项目时，在项目根目录运行：

```bash
python setup.py
```

默认无需交互，依次安装依赖、构建页面/媒体/搜索索引，然后监听 `0.0.0.0:3002`。本机访问 [http://localhost:3002](http://localhost:3002)；内网访问使用实际服务器 IP，例如 `http://服务器IP:3002`，并需确保网络允许访问。不再依赖 uv、FastAPI 或后端配置文件。前端服务日志写入 `log/frontend.log`，安装和构建输出显示在终端；Ctrl+C 或 SIGTERM 会停止本脚本启动的进程。

```bash
python setup.py --dev                         # 开发模式，先构建搜索索引
python setup.py --skip-install --skip-build   # 已安装、已构建时快速重启
python setup.py --port 3004                   # 显式使用其他端口
python setup.py --help
```

更新代码或文档后应重新构建；`--skip-build` 会继续提供已有产物。启动前检查端口，冲突时退出，不自动结束其他服务或换端口。脚本保持前台运行，服务器长期运行应使用现有进程管理器管理。

## 更新与重启

在原部署目录更新时，先按 Ctrl+C 或通过现有进程管理器停止旧 Wiki 服务，再执行：

```bash
git pull --ff-only origin main
python setup.py
```

这会重新安装锁定依赖、构建最新文档并启动服务。仅重启、代码和构建产物未变化时，可以使用：

```bash
python setup.py --skip-install --skip-build
```

`log/frontend.log` 保存服务启动与运行日志，安装和构建错误直接显示在终端。脚本运行期间不要关闭终端；长期运行可沿用现有进程管理器，工作目录设为本项目根目录，启动命令设为 `python setup.py`。若发布流程已经完成安装与构建，进程管理器可使用上述快速重启命令。

## 开发与构建（分步命令）

需要 Node.js 22.13+ 和 npm。在项目根目录运行：

```bash
npm run setup
npm run build
npm run dev
```

`npm run setup` 安装 `frontend/` 中锁定版本的依赖，首次启动或依赖更新后执行即可。开发前先构建一次，确保搜索索引可用；`python setup.py --dev` 会自动完成这三个步骤。也可以在 `frontend/` 中使用 `npm ci` 和 `npm run dev`。

开发地址为 `http://localhost:3002`，端口占用时可使用 `npm run dev -- --port 3003`。启动时同步媒体，开发期间自动同步媒体文件的增删改；Markdown 修改通过开发服务器重新渲染。

```bash
npm test
npm run build
npm run typecheck
npm run preview
```

`build` 包含媒体同步、静态导出、Pagefind 中文索引生成和导出内容检查。产物位于 `frontend/out/`。`preview` 使用 Next.js 自带的静态文件库，仅为本地验收服务，绑定 `127.0.0.1`，默认端口 3002，被占用时自动尝试下一个端口；也可指定 `npm run preview -- --port 3003`。支持视频 Range 请求、目录索引与 404。

构建固定使用 Webpack，避免当前环境中 Turbopack 的临时端口限制。直接使用 Nginx 等静态托管时，Node.js 仅用于开发和构建；下方兼容旧端口的 npm start 方式仍需 Node.js 和前端依赖。

## 内容维护

- `content/`：Markdown 文章，支持嵌套目录。每篇文章生成 `/wiki/<slug>/`，首页提供快速开始、功能入口和全部指南。
- `assets/`：图片和 MP4 视频源文件，Markdown 中继续使用 `/media/...` 链接。
- `frontend/lib/content.mjs`：文章排序、标题、资源校验和图片尺寸读取。根据文章元数据和 `content/navigation.json` 中的模块顺序组织内容。
- `frontend/lib/markdown.mjs`：基于 Markdown AST 生成标题 ID 和目录，重复标题自动加后缀。
- `frontend/public/media/`：同步生成的媒体目录，不应手动编辑，不提交到 Git。

文章优先使用 frontmatter 的 `title`，否则使用一级标题，再回退到文件名。更新时间来自 Git 最后修改时间，构建环境没有 Git 历史时省略。尚未提交的修改不会更新这个时间；CI 需要完整历史时使用完整检出。

视频默认点击播放，只在进入视口或用户操作后挂载资源地址，使用原生播放控件。离开视口或标签页进入后台时暂停，不自动恢复。图片懒加载并预留尺寸，点击后可放大，按 Escape 关闭。禁用 JavaScript 时仍能阅读正文和导航，视频提供直接链接。

添加或修改内容后必须重新构建发布。当前方案假定站点部署在域名根目录；子路径部署需要同时调整页面、媒体和搜索索引路径，尚未支持。

## 文档组织与搜索

当前帮助中心包含 19 篇用户文章，来源于 genow-v2 用户手册，分为开始使用、创作功能、协作与发布、案例与排查、管理员指南、速查与参考。后续以本仓库 `content/` 为唯一编辑来源；genow-v2 单文件手册保留为迁移时的归档依据。代码定位信息见 [维护依据](docs/manual-maintenance.md)。

文章示例：

```markdown
---
title: "控制台图片生成"
description: "添加参考图，调整参数并比较结果。"
group: "create"
order: 4
keywords: "参考图 比例 分辨率"
---
# 控制台图片生成

## 添加参考图

操作步骤……
```

`group` 必须对应 `content/navigation.json` 的模块 ID；模块内按数值 `order` 排序。`keywords` 保留为搜索元数据，关键词检索主要依据标题、简介与正文。`hidden: true` 用于不出现在导航和搜索中的兼容页面，**不提供访问控制**。现有管理员文章也是静态公开内容；若需要登录限制，必须在部署层同时保护页面、搜索索引和媒体。

首页参考 Linear 官网，采用深色背景、顶部导航、大标题与分区卡片；文章页在桌面端采用三栏布局，窄屏使用抽屉导航和可展开的页内目录。搜索通过 `⌘K` / `Ctrl K` 打开，支持上下键选择、回车跳转和 Escape 关闭。默认深色，保留浅色切换，主题偏好保存在浏览器本地。

Pagefind 1.5.2 Extended 在构建后扫描 `out/wiki/`，仅索引带 `data-pagefind-body` 的正文，排除导航、页脚及旧版兼容页。搜索脚本按需加载，结果支持中文分词、摘要高亮和章节锚点；无需搜索后端。

开发搜索使用最近一次构建生成的索引：首次运行或更新文章后先执行 `npm run build`，再启动 `npm run dev`。页面开发会实时更新，但搜索索引不会热更新。验收时推荐 `npm run preview -- --port 3004`，避免与业务应用的 3002 端口冲突。`frontend/public/pagefind/` 和 `frontend/out/pagefind/` 都是生成文件，不应手工编辑或提交。

旧版 `console-mode`、`canvas-mode`、`history`、`sketch-mode`、`other` 地址保留为新版引导页，原始内容位于 `docs/legacy/`。这些旧资料与截图未重新核对当前界面，不直接显示在用户导航中。

## 保留原域名与旧启动方式

新版支持继续运行 `python setup.py`，默认入口仍是 `0.0.0.0:3002`。原进程管理器使用此命令时无需改为 npm 命令，但需确认 Python 指向 Python 3.9+，且其运行环境能找到 Node.js 和 npm。

如果原域名仍转发到同一服务器的 3002 端口，并以域名根路径提供网站，通常无需更改域名或反向代理。HTTPS 仍由原入口处理；启动脚本不会配置 DNS、证书或反向代理。原域名是否接通，需要启动后实际访问验证。

| 启动方式 | 用途 | 默认监听 | 端口被占用时 |
| --- | --- | --- | --- |
| `python setup.py` | 安装、构建并启动，推荐使用 | `0.0.0.0:3002` | 报错退出，不结束其他进程 |
| `python setup.py --skip-install --skip-build` | 使用已有构建快速重启 | `0.0.0.0:3002` | 报错退出，不结束其他进程 |
| `npm start` | 已安装、已构建时单独启动 | `0.0.0.0:3002` | 报错退出，不自动换端口 |
| `npm run preview` | 仅供本机验收 | `127.0.0.1:3002` | 自动尝试下一个端口 |

保留原代理时继续使用 3002；显式改用其他端口后，原代理也需对应调整。不要使用会自动换端口的 `preview` 替代原部署入口。

常见问题：

- **端口被占用**：确认占用者是否为旧 Wiki 服务，再通过其终端或进程管理器停止它。脚本不会强制结束占用进程。
- **找不到构建产物或更新后仍是旧内容**：运行 `python setup.py`，不要携带 `--skip-build`。静态页面、媒体和搜索索引都需要重新构建。
- **本机可访问，原域名不可访问**：确认当前是在原服务器上启动，并监听 3002。此时仍需检查原入口的转发、网络或缓存；仅恢复端口不能保证域名链路正常。
- **关闭终端后网站停止**：启动脚本以前台方式运行，需要现有 systemd、PM2 或面板进程管理器保持运行。

上线后检查原域名首页、文章直接访问与刷新、搜索、图片和视频。持续访问场景建议在独立版本目录完成构建，再切换服务，避免在正在服务的 `out/` 上构建。

## 静态部署

将 `frontend/out/` 的全部内容作为一个版本上传到 Nginx、对象存储静态网站或其他静态托管平台。不要只上传 HTML，也不要使用把所有未知路径重写为首页的 SPA 配置。

Nginx 示例：

```nginx
server {
    listen 80;
    server_name wiki.example.com;
    root /srv/genow-wiki/current;
    index index.html;
    error_page 404 /404.html;

    location / {
        try_files $uri $uri/ =404;
        add_header Cache-Control "no-cache";
    }

    location /_next/static/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

HTML 和未带哈希的媒体使用可重新验证缓存；带哈希的 JS/CSS 使用长期缓存。托管平台需支持目录索引、中文编码路径、自定义 404 和 MP4 Range 请求。启用 gzip 或 Brotli 时优先压缩 HTML/CSS/JS，不重复压缩视频。

建议按发布版本保存完整产物，先上传到新版本目录，验证后原子切换 `current` 指向；回滚时切回上一版本。页面、媒体和 `pagefind/` 搜索索引必须一起切换。旧页面仍可能请求上一版哈希资源，有持续访问需求时保留上一版 `/_next/static/` 文件至缓存过渡期结束。CI 可在内容提交后于根目录执行 `npm run setup`、`npm test`、`npm run build` 并发布；本项目未配置远程发布目标。

## 验证记录

本次文档中心改造见 [帮助中心实施记录](docs/help-center-implementation.md)。

详见 [轻量化优化方案](docs/wiki-optimization-plan.md) 和 [实施验证记录](docs/wiki-optimization-results.md)。

### 教学图像与视频

19 篇正式文章已完成媒体覆盖核对，素材库现有 68 张独立演示截图（含短片分步源图）和 7 条 15 秒步骤短片，成品保存在 `assets/tutorials/`。视频提供封面、中文字幕、同页文字步骤及下载入口。截图不包含其他生成历史。补充素材覆盖提示词与模板、素材分享、控制台功能开关、资产筛选与下载、工作流拖入和视频截帧，以及置顶配置、团队邀请与角色、共享文件夹和 Playground 发布预览；使用示意素材和虚构账号。本轮新增 39 张截图及两条短片，补齐个人设置、画布标记、参考模式、协作通知、管理员操作与排错；案例及术语复用相关素材。来源、重拍方法和视频源文件见 [制作说明](docs/media-production/README.md)，逐小节记录见 [媒体覆盖表](docs/media-production/coverage-complete.md)。
