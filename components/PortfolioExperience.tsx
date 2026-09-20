"use client";

import { ArrowDown, ArrowRight, ExternalLink, Play } from "lucide-react";
import { useState } from "react";
import { TokenIntro } from "./TokenIntro";
import { LongPoster, type PosterProject } from "./LongPoster";
import { LanyardTag } from "./LanyardTag";
import { YanGlyph3D } from "./YanGlyph3D";
import { InlineVideo } from "./InlineVideo";

import { projects, type Project } from "@/data/projects";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function CaseLink({ href, label = "WATCH FULL VIDEO" }: { href: string; label?: string }) {
  return <a className="case-link" href={href} target="_blank" rel="noreferrer"><Play size={14} fill="currentColor" />{label}<ExternalLink size={13} /></a>;
}

function SectionHeading({ index, eyebrow, title }: { index: string; eyebrow: string; title: string }) {
  return <header className="section-heading"><p>{index} / {eyebrow}</p><h2>{title}</h2></header>;
}

function FlowDiagram({ items, dark = false }: { items: Array<{ label: string; body: string }>; dark?: boolean }) {
  return <div className={`flow-diagram ${dark ? "is-dark" : ""}`}>{items.map((item, index) => <div className="flow-node-wrap" key={item.label}><div className="flow-node"><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong><p>{item.body}</p></div>{index < items.length - 1 && <ArrowRight className="flow-arrow" />}</div>)}</div>;
}

function CaseHero({ project }: { project: Project }) {
  return <header className="case-hero"><div className="case-hero-meta"><p>{project.number} / {project.category}</p><h2>{project.title}</h2><span>{project.chinese}</span></div><a className="case-cover-link" href={project.link} target="_blank" rel="noreferrer"><img src={project.cover} alt={`${project.title} project cover`} /><span className="cover-play"><Play size={16} fill="currentColor" /> VIEW FILM</span></a></header>;
}

function ProjectDetailHeader({ number, title, chinese, method, methodCn, cover, link }: { number:string; title:string; chinese:string; method:string; methodCn:string; cover:string; link:string }) {
  const project = projects.find((item) => item.number === number);
  return <><header className="project-detail-header"><div><span>{number}</span><h2>{title}</h2><strong>{chinese}</strong></div><aside><span>{method}</span><span>{methodCn}</span></aside></header>{project?.video ? <InlineVideo className="project-film-cover" src={project.video} poster={cover} title={title} /> : <a className="project-film-cover external-film-cover" href={link} target="_blank" rel="noreferrer"><img src={cover} alt={`${title} 项目封面`} /><span><Play size={15} fill="currentColor" /> {number === "02" ? "WATCH LIVE VIDEO ↗" : "VIEW ON REDNOTE ↗"}</span><small>{number === "02" ? "视频号 · 现场影像" : "小红书 · External"}</small><em>点击封面{number === "02" ? "观看现场视频" : "前往小红书"}</em></a>}</>;
}

function WorkflowNote({ steps }: { steps:string[] }) {
  return <section className="project-workflow"><header><span>WORKFLOW / 工作流</span></header><ol>{steps.map((step,index)=><li key={step}><span>{String(index+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol></section>;
}

function Intro() {
  return <><TokenIntro onComplete={() => document.getElementById("welcome")?.scrollIntoView({ behavior: "smooth" })} /><section id="welcome" className="welcome-poster" aria-label="Welcome to the AI world of Yan"><div className="welcome-editorial"><h1>WELCOME TO THE<br />AI WORLD OF</h1></div><div className="yan-poster-letters"><div className="yan-glyph yan-glyph-y"><YanGlyph3D src="/assets/glyphs/yan-y.svg" label="Y" /><aside><strong>LIU LUYAN / 刘禄妍</strong><span>DIGITAL MEDIA ART</span><span>GUANGZHOU ACADEMY OF FINE ARTS</span><span>广州美术学院</span><span>2024—2028</span></aside></div><div className="yan-glyph yan-glyph-a"><YanGlyph3D src="/assets/glyphs/yan-a.svg" label="A" /><aside><strong>AI-NATIVE ARTIST &amp; DESIGNER</strong></aside></div><div className="yan-glyph yan-glyph-n"><YanGlyph3D src="/assets/glyphs/yan-n.svg" label="N" /><aside><span>EACH TOKEN HOLDS A PROJECT ↗</span></aside></div></div></section></>;
}

function CaseNavigation({ current, onOpen, onBack }: { current:string; onOpen:(id:string)=>void; onBack:()=>void }) {
  const index = projects.findIndex(project => project.id === current);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  return <nav className="case-navigation" aria-label="Project navigation"><button onClick={() => onOpen(previous.id)}>← {previous.title}</button><button onClick={onBack}>BACK TO INDEX</button><button onClick={() => onOpen(next.id)}>{next.title} →</button></nav>;
}

function NextProject({ current }: { current: string }) {
  const index = projects.findIndex((project) => project.id === current);
  const next = projects[index + 1];
  if (!next) return <div className="selected-projects-end"><span>END OF SELECTED PROJECTS</span><strong>06 / 06</strong></div>;
  return <button className="next-project" type="button" onClick={() => document.getElementById(`case-${next.id}`)?.scrollIntoView({ behavior: "smooth" })}><span>NEXT PROJECT</span><strong>{next.number} / {next.title}</strong><em>{next.chinese} <ArrowRight size={18} /></em></button>;
}

function MoreWork() {
  const films = [
    ["《普罗米修斯》", "/assets/films/prometheus.png", "/videos/普罗米修斯.mp4", "https://xhslink.cn/o/9vCNau7LL5X"],
    ["《牧羊梦游》", "/assets/films/shepherd.png", "/videos/牧羊梦游.mp4", "https://xhslink.cn/o/8GBXNceX015"],
    ["《即刻》", "/assets/films/anytime.png", "/videos/即刻.mp4", "https://xhslink.cn/o/6YjetFKIlGk"],
  ];
  const experiences = [
    ["AI＋AR／VR 铃兰花", "/assets/experiments/ai-ar.jpg", "https://xhslink.cn/o/1fSEDAfU7FU"], ["AI＋Blender《仲夏夜之梦》", "/assets/experiments/lily.png", "https://xhslink.cn/o/2LNTFA3sVB1"], ["AI＋Blender《白夜行》", "/assets/experiments/white-night.png", "https://xhslink.cn/o/6ngGtWXVInr"], ["《时间真的可以治愈一切吗？》", "/assets/experiments/time-heals.jpg", "https://xhslink.cn/o/50CS6dcmHf0"],
  ];
  return <section id="more-work" className="more-work"><SectionHeading index="" eyebrow="MORE FILMS" title="MORE FILMS / 影像与短片。" /><div className="more-film-grid">{films.map(([title, image, video, href]) => <div className="more-film-item" key={title}><InlineVideo src={video} poster={image} title={title} /><span>{title}<a href={href} target="_blank" rel="noreferrer" aria-label={`${title} external reference`}><ExternalLink size={14} /></a></span></div>)}</div>
    <div className="more-explore-transition"><span>MORE TO EXPLORE</span><small>继续浏览</small></div><div className="experiments-heading"><p>MORE EXPERIENCE</p><span>更多项目经历。</span></div><div className="experiment-grid">{experiences.map(([title, image, href]) => <a key={title} href={href} target="_blank" rel="noreferrer"><img src={image} alt="" /><span>{title}<strong>VIEW ON REDNOTE ↗</strong><small>小红书 · External</small></span></a>)}</div><div className="text-experiments"><span>O12《就这样带着刺痛的完结》</span><span>P003《雨是神明的烟花》</span></div>
  </section>;
}

function FilmDissolve() {
  const [position, setPosition] = useState(0); const frames = ["/assets/guozi/cover.webp", "/assets/guozi/02.webp", "/assets/guozi/03.webp"];
  return <div className="film-dissolve" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPosition(clamp((e.clientX - r.left) / r.width)); }} onPointerLeave={() => setPosition(0)}>{frames.map((frame, index) => <img key={frame} src={frame} alt={`Guozi film frame ${index + 1}`} style={{ opacity: clamp(1 - Math.abs(position - index / 2) * 2.15) }} />)}<div className="film-scrub"><span style={{ transform: `translateX(${position * 100}%)` }} /><small>MOVE TO DISSOLVE BETWEEN FRAMES</small></div></div>;
}

export function PortfolioExperience() {
  const [selectedTag, setSelectedTag] = useState<PosterProject | null>(null);
  const [openedProject, setOpenedProject] = useState<string | null>(null);
  const selectedDetails = projects.find((project) => project.id === selectedTag?.id);
  const tagProject = selectedTag && selectedDetails ? {
    ...selectedTag,
    chinese: selectedDetails.chinese,
    copy: selectedDetails.copy.join(" "),
    workflow: selectedDetails.workflow,
    role: selectedDetails.role,
    tools: selectedDetails.tools,
    sticker: `/assets/project-marks/${selectedTag.id}-sticker.png`,
  } : null;
  const enterSelectedProject = () => { if (!selectedTag) return; const id=selectedTag.id; setSelectedTag(null); setOpenedProject(id); window.setTimeout(() => document.getElementById(`case-${id}`)?.scrollIntoView({ behavior: "smooth" }), 80); };
  const openCase = (id:string) => { setOpenedProject(id); window.setTimeout(() => document.getElementById(`case-${id}`)?.scrollIntoView({ behavior:"smooth" }), 60); };
  const backToIndex = () => { setOpenedProject(null); document.getElementById("work")?.scrollIntoView({ behavior:"smooth" }); };
  return <main>
    <header className="site-header"><a href="#top" className="site-mark">YAN / 2026</a><nav><a href="#work">WORK</a><a href="#more-work">MORE</a><a href="#about">ABOUT</a></nav><a className="header-contact" href="mailto:yan18960824862@outlook.com">CONTACT ↗</a></header>
    <Intro /><LongPoster onSelect={setSelectedTag} activeProject={openedProject} />
    {tagProject && <LanyardTag key={tagProject.id} project={tagProject} onClose={() => setSelectedTag(null)} onEnter={enterSelectedProject} />}

    {openedProject === "space-field" && <section id="case-space-field" className="case-section case-space space-field-detail">
      <header className="space-field-header"><div><span>01</span><h2>SPACE &amp; FIELD</h2><strong>空间与场域主视觉</strong></div><aside><span>AI CODING / GENERATIVE VISUAL / REAL-TIME</span><span>AI 编程 · 生成式视觉 · 实时生成</span></aside></header>
      <InlineVideo className="space-field-hero" src={projects[0].video!} poster="/assets/space/project-cover.png" title="Space and Field" />
      <div className="space-workflow-title"><span>WORKFLOW / 工作流</span><p>从可修改的 SVG 字形出发，进入三维、实时运动与最终输出。</p></div>
      <section className="space-workflow-section"><div className="space-workflow-copy"><span>01 / SVG / FORM</span><h3>先把字设计好，再让它进入三维。</h3><p>AI 可以快速生成拼豆文字，但生成出来的字形往往缺少排版控制，也容易趋向模板化。</p><p>我先在 Figma 中自己设计拼豆字形，调整每个圆点的位置、颜色、疏密和整体结构，再导出 SVG，作为后续 3D 与动态生成的视觉基础。</p></div><figure className="space-figma-shot"><img src="/assets/space/figma-svg-workspace.png" alt="Figma 拼豆 SVG 排版截图" /><figcaption>FIGMA / SVG DESIGN SOURCE</figcaption></figure></section>
      <section className="space-workflow-section space-tool-section"><div className="space-workflow-copy"><span>02 / SVG → 3D</span><h3>让 SVG 直接长成立体结构。</h3><p>我用 AI 辅助代码搭建 SVG 解析与转换工具，读取 SVG 中圆点的位置和颜色，再把二维圆点直接转化为可控制的 3D 圆柱。</p></div><div className="space-tool-frame"><iframe src="/space-field-tool/index.html" title="SVG to 3D cylinder interactive tool" loading="lazy" allow="clipboard-read; clipboard-write" /><p>REAL INTERACTIVE TOOL / SVG → 3D FORM</p></div></section>
      <section className="space-workflow-section space-motion-proof"><div className="space-workflow-copy"><span>03 / REAL-TIME MOTION</span><h3>同一套结构，可以继续产生不同的运动。</h3><p>在同一个生成系统里继续调整运动方式、节奏和视觉效果，让静态 SVG 不只得到一个三维结果，而是可以持续产生不同的实时动态，并进一步形成 AI Motion。</p></div><figure><img src="/assets/space/tool-motion-interface.png" alt="真实 3D 圆柱工具 Motion 与 Physics 参数界面" /></figure></section>
      <section className="space-output"><div className="space-workflow-copy"><span>04 / OUTPUT</span><h3><span>SVG、三维结构与实时运动。</span><span>最后回到真实输出。</span></h3></div><div className="space-output-boards">{[1,2,3,4].map((i) => <figure key={i}><img src={`/assets/space/output-board-${i}.png`} alt={`Space and Field 展板 ${i}`} /><figcaption>OUTPUT BOARD / 0{i}</figcaption></figure>)}</div></section><NextProject current="space-field" />
    </section>}

    {openedProject === "graduation-vj" && <section id="case-graduation-vj" className="case-section project-detail case-vj">
      <ProjectDetailHeader number="02" title="GRADUATION VJ" chinese="毕业展开幕式 VJ 视觉" method="GENERATIVE VISUAL / AUDIO-REACTIVE / REAL-TIME" methodCn="生成式视觉 · 音频响应 · 实时交互" cover={projects[1].cover} link={projects[1].link} />
      <WorkflowNote steps={projects[1].workflow} />
      <section className="real-tool-section"><div><span>REAL INTERACTIVE VJ WEBSITE</span><p>这里直接展示项目中真实使用的交互网页，保留原始画面、控件、动画与实时变化。最终输出整理为完整视频，在开幕式大屏播放。</p></div><iframe src="/vj-live/index.html" title="Graduation VJ interactive website" loading="lazy" allow="autoplay" /></section>
      <section className="project-final-output"><header><span>FINAL OUTPUT</span><p>最终将视觉整理为完整视频，用于毕业展开幕式现场大屏播放。</p></header><div className="single-image-flow">{[1,2,3,4,5].map((i) => <img key={i} src={`/assets/vj/frame-0${i}.png`} alt={`VJ 画面 ${i}`} />)}</div><div className="stage-results"><img src="/assets/vj/stage-02.png" alt="开幕式大屏现场 2" /><img src="/assets/vj/stage-03.png" alt="开幕式大屏现场 3" /></div><CaseLink href={projects[1].link} label="WATCH LIVE VIDEO ↗" /></section><NextProject current="graduation-vj" />
    </section>}

    {openedProject === "scenova" && <section id="case-scenova" className="case-section project-detail case-drone"><ProjectDetailHeader number="03" title="SCENOVA" chinese="三维扫描无人机" method="DESIGN EXPLORATION / REFINEMENT / VISUALIZATION" methodCn="方案探索 · 方案深化 · 产品可视化" cover={projects[2].cover} link={projects[2].link} />
      <WorkflowNote steps={projects[2].workflow} />
      <div className="drone-compare"><figure><img src="/assets/drone/internal-frame.png" alt="Original fixed internal frame" /><figcaption>WHAT I HAD / 固定内部框架</figcaption></figure><figure><img src="/assets/drone/design-focus.jpg" alt="Final shell views" /><figcaption>WHAT REMAINED / 最终外壳方向</figcaption></figure></div><figure className="full-board"><img src="/assets/drone/final-board.jpg" alt="SceNova final presentation board" /><figcaption>FINAL BOARD / 图片保持原比例</figcaption></figure><NextProject current="scenova" />
    </section>}

    {openedProject === "morning-tea" && <section id="case-morning-tea" className="case-section project-detail case-tea"><ProjectDetailHeader number="04" title="MORNING TEA ARENA" chinese="《饮茶争先啦》早茶全运会" method="CHARACTER GENERATION / IP VISUAL / CULTURAL PRODUCTS" methodCn="角色生成 · IP 视觉 · 文创产品设计" cover={projects[3].cover} link={projects[3].link} />
      <WorkflowNote steps={projects[3].workflow} />
      <div className="tea-gallery"><img src="/assets/tea/01.webp" alt="Morning Tea Arena concept" /><img src="/assets/tea/02.webp" alt="Character system" /><img src="/assets/tea/03.jpg" alt="Final board" /><img src="/assets/tea/04.webp" alt="Product applications" /></div><div className="award-line"><img src="/assets/tea/award.png" alt="Award certificate" /><p>珠江浪涌绘湾区·十五运体育文创优秀作品和案例评选大赛 / 一等奖</p></div><NextProject current="morning-tea" />
    </section>}

    {openedProject === "liminal-maze" && <section id="case-liminal-maze" className="case-section project-detail case-mapping"><ProjectDetailHeader number="05" title="TOKYO LIGHT & ART FESTIVAL" chinese="东京光影艺术节" method="BLENDER 3D / AI VIDEO GENERATION" methodCn="Blender 三维建模 · AI 视频生成" cover={projects[4].cover} link={projects[4].link} />
      <WorkflowNote steps={projects[4].workflow} />
      <section className="project-final-output"><header><span>FINAL OUTPUT</span></header><div className="mapping-gallery"><img src="/assets/mapping/video-cover.webp" alt="Tokyo Light and Art Festival video cover" /><img src="/assets/mapping/02.png" alt="Tokyo Light and Art Festival scene 2" /><img src="/assets/mapping/03.png" alt="Tokyo Light and Art Festival scene 3" /><img src="/assets/mapping/04.png" alt="Tokyo Light and Art Festival scene 4" /></div><CaseLink href={projects[4].link} label="VIEW FILM" /></section>
      <aside className="related-space-work"><div><p>RELATED SPACE WORK</p><h3>《光御华盏》</h3><span>空间影像 / 2026</span></div><a href="https://xhslink.cn/o/5Q1LggZRKbA" target="_blank" rel="noreferrer"><img src="/assets/light/01.png" alt="Light related spatial work" /><span>OPEN ↗</span></a></aside><NextProject current="liminal-maze" />
    </section>}

    {openedProject === "guozi" && <section id="case-guozi" className="case-section project-detail case-guozi"><ProjectDetailHeader number="06" title="GUOZI" chinese="二手玫瑰《果子》MV" method="IMAGE GENERATION / VIDEO GENERATION / MUSIC-DRIVEN STORYTELLING" methodCn="AI 生图 · AI 视频生成 · 音乐驱动叙事" cover={projects[5].cover} link={projects[5].link} />
      <WorkflowNote steps={projects[5].workflow} />
      <section className="project-final-output"><header><span>FINAL MV</span></header><FilmDissolve /><CaseLink href={projects[5].link} label="VIEW FILM" /></section><NextProject current="guozi" />
    </section>}

    {openedProject && <CaseNavigation current={openedProject} onOpen={openCase} onBack={backToIndex} />}

    <section id="about" className="about-section">
      <div className="about-title">
        <p>08 / ABOUT</p>
        <h2>刘禄妍<br />YAN<br />LIU</h2>
        <span>AI-NATIVE ARTIST &amp; DESIGNER</span>
      </div>
      <figure>
        <img src="/assets/about/portrait.png" alt="Portrait of Yan Liu" />
        <figcaption>GUANGZHOU / 2026</figcaption>
      </figure>
      <div className="about-copy">
        <p className="about-lead">我把 AI 当作创作过程的一部分。<br />在生成、判断与再设计之间不断调整，让技术真正服务于表达。</p>
        <p className="about-section-label">EDUCATION</p>
        <dl>
          <div><dt>2024—2028</dt><dd>广州美术学院 / 数字媒体艺术</dd></div>
          <div><dt>2025.07—09</dt><dd>香港科技大学（广州）<br />AI 美学与理论传播、无人机外壳、抖音 AI 创作者项目</dd></div>
          <div><dt>2025.12—2026.01</dt><dd>深圳流思数字科技<br />AI 视频实习</dd></div>
          <div><dt>2026.08</dt><dd>香港科技大学（广州）<br />VR 科研 / 虚拟空间、原型与实验</dd></div>
        </dl>
        <div className="about-awards">
          <p>SELECTED AWARDS</p>
          <div className="award-year">
            <span>2026</span>
            <ul>
              <li>2026 TapNow Hackathon <strong>Best Visual Performance</strong></li>
              <li>全国大学生城市设计大赛 <strong>国赛二等奖</strong></li>
              <li>“三维扫描无人机” — 2026 米兰设计周 <strong>省二等奖</strong></li>
              <li>2026 广美毕业展主视觉征集比赛 <strong>优秀奖</strong></li>
            </ul>
          </div>
          <div className="award-year">
            <span>2025</span>
            <ul>
              <li>“珠江浪涌绘湾区 创意燃动十五运——体育文创优秀作品和案例评选大赛” <strong>一等奖</strong></li>
              <li>中国国际“互联网+”大学生创新创业大赛全国总决赛 <strong>全国银奖 · 省赛银奖</strong></li>
              <li>第十五届全国运动会文化创意产品设计大赛 <strong>全国铜奖</strong></li>
              <li>“挑战杯”广东省大学生课外学术科技作品竞赛 <strong>全省铜奖 · 校级二等奖</strong></li>
              <li>“方言电话亭” — 2025 UABB 深港城市\建筑双城双年展（深圳）电话亭重构计划 <strong>入选</strong></li>
              <li>“生息宇域” — 中国建筑模型博物馆地外建筑计划 <strong>入选</strong></li>
            </ul>
          </div>
        </div>
        <div className="about-contact">
          <a href="mailto:yan18960824862@outlook.com">yan18960824862@outlook.com ↗</a>
          <a href="mailto:yan18960824862@gmail.com">yan18960824862@gmail.com ↗</a>
          <a href="tel:+8613599321393">+86 135 9932 1393</a>
          <span>REDNOTE / 我要成为数媒大神</span>
        </div>
      </div>
    </section>
    <MoreWork />
    <footer><a href="#top">BACK TO TOP <ArrowDown className="footer-arrow" /></a><p>YAN LIU © 2026</p><span>DESIGN · CODE · MOTION · SPACE</span></footer>
  </main>;
}
