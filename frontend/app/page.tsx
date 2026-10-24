import { getWiki } from "@/lib/wiki";
import { SiteFrame } from "@/components/SiteFrame";
import { Icon } from "@/components/Icons";

export const metadata = { title: "帮助中心", description: "从第一张图片到团队创作，查找 Genow 的操作指南、完整案例和常见问题。" };
const cards = [
  ["image", "图片生成", "从文字和参考图出发，调整参数，逐步完善画面。", "create/images"],
  ["video", "视频生成", "使用首尾帧与参考素材，让静态画面动起来。", "create/videos"],
  ["canvas", "画布与工作流", "连接节点，在同一张画布中组织创作过程。", "create/canvas"],
  ["team", "团队协作", "共享素材，明确权限，与成员一起完成交付。", "collaborate/teams"],
];
const steps = [
  ["01", "file", "描述想法", "写下画面主体、场景与光线。"],
  ["02", "image", "生成图片", "选择模型，调整比例并提交。"],
  ["03", "book", "保存作品", "检查结果，下载并继续创作。"],
];

export default async function HomePage() {
  const { tree, pages } = await getWiki();
  return <SiteFrame tree={tree} home>
    <article className="home-content">
      <header className="home-header">
        <a className="hero-eyebrow" href="/wiki/start/overview/"><span className="status-dot"/>GENOW V2 · 使用指南 <span aria-hidden="true">→</span></a>
        <h1>让创作，<br/>从这里开始。</h1>
        <div className="hero-bottom"><p>从第一张图片到团队协作。<br/>让每一个想法，都有清晰的下一步。</p><div className="hero-actions"><a className="primary-link" href="/wiki/start/first-image/">开始阅读 <Icon name="arrow" size={16}/></a><a className="text-link" href="#guides">浏览全部文档 <span aria-hidden="true">↗</span></a></div></div>
      </header>
      <section id="start" className="start-panel">
        <div className="panel-toolbar"><span><Icon name="canvas" size={14}/>从想法到作品</span><span>入门路径 / 01</span></div>
        <div className="start-copy"><div><span className="section-kicker">快速开始</span><h2>生成你的第一张图片</h2></div><a className="text-link" href="/wiki/start/first-image/">查看操作步骤 <Icon name="arrow" size={15}/></a></div>
        <div className="creation-path">{steps.map(([number,icon,title,description]) => <a key={number} href="/wiki/start/first-image/" className="creation-step"><div className="step-heading"><Icon name={icon} size={21}/><span>{number}</span></div><h3>{title}</h3><p>{description}</p></a>)}</div>
      </section>
      <section id="explore" className="home-section"><div className="section-heading"><div><span className="section-kicker">01 / 功能指南</span><h2>找到适合你的创作方式。</h2></div><p>从单次生成，到完整的创作流程。</p></div><div className="feature-grid">{cards.map(([icon,title,description,slug],i) => <a className="feature-card" key={slug} href={`/wiki/${slug}/`}><div className="feature-top"><Icon name={icon} size={24}/><span>0{i+1}</span></div><h3>{title}<Icon name="arrow" size={16}/></h3><p>{description}</p></a>)}</div></section>
      <section id="guides" className="home-section"><div className="section-heading"><div><span className="section-kicker">02 / 文档目录</span><h2>每一步，都有迹可循。</h2></div><p>{pages.filter((p) => !p.hidden).length} 篇指南，覆盖从入门到交付。</p></div><div className="guide-groups">{tree.map((group) => <div key={group.name}><h3>{group.title}<span>{String(group.children.length).padStart(2,"0")}</span></h3><ul>{group.children.map((p) => <li key={p.slug}><a href={`/wiki/${p.slug}/`}>{p.title}<span aria-hidden="true">↗</span></a></li>)}</ul></div>)}</div></section>
      <a href="/wiki/practice/examples/" className="example-banner"><div><span className="section-kicker">03 / 实践案例</span><h2>从一个想法，走到一次交付。</h2><p>跟随产品宣传图、短视频和团队项目的完整案例，开始实践。</p></div><span className="example-arrow"><Icon name="arrow" size={24}/></span></a>
      <footer className="home-footer"><span>Genow <span className="footer-divider">/</span> 帮助中心</span><span>为创作提供清晰指引。<br/>示例项目和素材名称均为虚构。</span><a href="/wiki/practice/troubleshooting/">需要帮助？ ↗</a></footer>
    </article>
  </SiteFrame>;
}
