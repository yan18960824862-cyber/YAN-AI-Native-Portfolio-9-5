import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "public/assets/lanyard/cards");
const cards = [
  ["space-field", "PARTICLE FIELD", "01", ["SVG 主视觉排版", "AI 辅助代码搭建", "网页实时生成", "AI Motion 制作"]],
  ["graduation-vj", "GRADUATION VJ", "02", ["视觉方向确定", "Blender + TD 动态制作", "AI 辅助网页开发", "音乐实时交互", "大屏视频输出"]],
  ["scenova", "SCENOVA", "03", ["场景与功能定义", "结构问题拆解", "AI 大量方案探索", "筛选与方案深化", "UI + 效果图 + 宣传视频"]],
  ["morning-tea", "MORNING TEA ARENA", "04", ["早茶 × 全运会世界观", "AI 角色视觉探索", "角色故事与关系", "IP 视觉体系", "盲盒 + 包袋 + 文创延展"]],
  ["liminal-maze", "TOKYO LIGHT &amp; ART FESTIVAL", "05", ["Blender 三维搭建", "3D 渲染作为 AI 参考", "AI 动态影像生成", "卡点剪辑", "蒙版 + 投影输出"]],
  ["guozi", "GUOZI", "06", ["音乐与故事方向", "AI 生图寻找视觉", "生成反推故事发展", "AI 动态镜头生成", "音乐 + 画面剪辑"]],
];

const esc = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

for (const [id, title, number, steps] of cards) {
  const visual = join(root, `${id}-front.png`);
  const data = readFileSync(visual).toString("base64");
  const timeline = steps.map((step, index) => {
    const y = 1120 + index * 96;
    return `<g><text x="122" y="${y}" class="step-no">${String(index + 1).padStart(2, "0")}</text><line x1="180" y1="${y - 6}" x2="218" y2="${y - 6}"/><text x="246" y="${y}" class="step">${esc(step)}</text>${index < steps.length - 1 ? `<line class="thread" x1="140" y1="${y + 22}" x2="140" y2="${y + 72}"/>` : ""}</g>`;
  }).join("");
  const sharedStyle = `<style>text{fill:#292927;font-family:Inter Tight,Arial,PingFang SC,Microsoft YaHei,sans-serif}.title{font-size:64px;font-weight:700;letter-spacing:-2px}.meta,.step-no{font-family:IBM Plex Mono,Menlo,monospace;font-size:22px;letter-spacing:2px}.step{font-size:31px;font-weight:500;letter-spacing:-.5px}line{stroke:#9b9993;stroke-width:1}.thread{stroke:#d5d3ce}</style>`;
  const front = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1680" viewBox="0 0 1200 1680"><rect width="1200" height="1680" fill="#fff"/><image href="data:image/png;base64,${data}" x="72" y="46" width="1056" height="760" preserveAspectRatio="xMidYMin slice"/><rect x="0" y="760" width="1200" height="920" fill="#fff"/>${sharedStyle}<text x="96" y="900" class="title">${title}</text><text x="98" y="968" class="meta">${number} / PROCESS</text><line x1="98" y1="1015" x2="1102" y2="1015"/>${timeline}</svg>`;
  const backTimeline = steps.map((step, index) => `<text x="130" y="${600 + index * 110}" class="step-no">${String(index + 1).padStart(2, "0")}</text><text x="245" y="${600 + index * 110}" class="step">${esc(step)}</text>`).join("");
  const back = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1680" viewBox="0 0 1200 1680"><rect width="1200" height="1680" fill="#fff"/>${sharedStyle}<text x="98" y="180" class="meta">${number} / PROCESS NOTE</text><text x="96" y="300" class="title">${title}</text><line x1="98" y1="390" x2="1102" y2="390"/>${backTimeline}<text x="98" y="1550" class="meta">DRAG TO MOVE · CLICK TO ENTER ↗</text></svg>`;
  writeFileSync(join(root, `${id}-front.svg`), front);
  writeFileSync(join(root, `${id}-back.svg`), back);
}
