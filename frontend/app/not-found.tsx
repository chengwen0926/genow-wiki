export default function NotFound() {
  return <main className="wiki-main" style={{ maxWidth: 640, margin: "80px auto" }}>
    <p className="article-eyebrow">404 · GENOW 文档</p><h1 className="text-2xl mb-4">没有找到这篇文档</h1>
    <p className="article-description">链接可能已更新。回到帮助中心，按模块查找需要的使用说明。</p>
    <a href="/" className="primary-link">返回帮助中心 →</a>
  </main>;
}
