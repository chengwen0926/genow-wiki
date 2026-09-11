# Genow Wiki

基于 Next.js、React 和 Markdown 的静态文档站。文章、完整目录和独立路由在构建时生成，生产环境只需要静态文件托管，无需 Python、FastAPI 或 Next.js 服务进程。

## 开发与构建

需要 Node.js 22.13+ 和 npm。在项目根目录运行：

```bash
npm run setup
npm run dev
```

`npm run setup` 安装 `frontend/` 中锁定版本的依赖，首次启动或依赖更新后执行即可。也可以在 `frontend/` 中使用 `npm ci` 和 `npm run dev`。

开发地址为 `http://localhost:3002`，端口占用时可使用 `npm run dev -- --port 3003`。启动时同步媒体，开发期间自动同步媒体文件的增删改；Markdown 修改通过开发服务器重新渲染。

```bash
npm test
npm run build
npm run typecheck
npm run preview
```

`build` 包含媒体同步、静态导出和导出内容检查。产物位于 `frontend/out/`。`preview` 使用 Next.js 自带的静态文件库，仅为本地验收服务，绑定 `127.0.0.1`，默认端口 3002，被占用时自动尝试下一个端口；也可指定 `npm run preview -- --port 3003`。支持视频 Range 请求、目录索引与 404。

构建固定使用 Webpack，避免当前环境中 Turbopack 的临时端口限制。Node.js 仅用于开发、构建和本地预览；生产托管无需安装 npm 依赖。

## 内容维护

- `content/`：Markdown 文章，支持嵌套目录。每篇文章生成 `/wiki/<slug>/`，首页展示排序后的第一篇文章。
- `assets/`：图片和 MP4 视频源文件，Markdown 中继续使用 `/media/...` 链接。
- `frontend/lib/content.mjs`：文章排序、标题、资源校验和图片尺寸读取。当前顺序为控制台、画布、历史、草稿、其他。
- `frontend/lib/markdown.mjs`：基于 Markdown AST 生成标题 ID 和目录，重复标题自动加后缀。
- `frontend/public/media/`：同步生成的媒体目录，不应手动编辑，不提交到 Git。

文件存在一级标题时用作文章名称；没有一级标题时回退到文件名，`other` 显示为“其他”。更新时间来自 Git 最后修改时间，构建环境没有 Git 历史时省略。尚未提交的修改不会更新这个时间；CI 需要完整历史时使用完整检出。

视频默认点击播放，只在进入视口或用户操作后挂载资源地址，使用原生播放控件。离开视口或标签页进入后台时暂停，不自动恢复。图片懒加载并预留尺寸，点击后可放大，按 Escape 关闭。禁用 JavaScript 时仍能阅读正文和导航，视频提供直接链接。

添加或修改内容后必须重新构建发布。当前方案假定站点部署在域名根目录；子路径部署需要同时调整页面和媒体路径，尚未支持。

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

建议按发布版本保存完整产物，先上传到新版本目录，验证后原子切换 `current` 指向；回滚时切回上一版本。页面和媒体必须一起切换。旧页面仍可能请求上一版哈希资源，有持续访问需求时保留上一版 `/_next/static/` 文件至缓存过渡期结束。CI 可在内容提交后于根目录执行 `npm run setup`、`npm test`、`npm run build` 并发布；本项目未配置远程发布目标。

## 验证记录

详见 [轻量化优化方案](docs/wiki-optimization-plan.md) 和 [实施验证记录](docs/wiki-optimization-results.md)。
