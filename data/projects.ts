export type ProjectReadingDetails = {
  workflow: string[];
  role: string;
  tools: string[];
};

export type Project = ProjectReadingDetails & {
  number: string;
  id: string;
  category: string;
  title: string;
  chinese: string;
  copy: string[];
  cover: string;
  link: string;
  treatment: string;
  video?: string;
};

// Reading metadata is summarized from the existing project pages and card text.
export const projects: Project[] = [
  { number: "01", id: "space-field", category: "AI × VISUAL SYSTEM", title: "SPACE & FIELD", chinese: "空间与场域拼豆主视觉系统", copy: ["我先在 Figma 里把字排好，再把 SVG 接进自己搭的三维工具。", "改字、改厚度、改运动，都不用重新做一遍。"], cover: "/assets/project-marks/space-field-sticker.png", link: "https://xhslink.cn/o/436r0oH693t", treatment: "poster", video: "/videos/01-space-field.mp4", workflow: ["SVG 主视觉排版","AI 辅助代码搭建","网页实时生成","AI Motion 制作"], role: "主视觉排版、生成工具搭建与动态视觉制作", tools: ["Figma","SVG","AI 辅助编程","Three.js"] },
  { number: "02", id: "graduation-vj", category: "AI × REAL-TIME SYSTEM", title: "GRADUATION VJ", chinese: "毕业季开幕式实时视觉系统", copy: ["最后交付是一条开幕式 VJ，", "但画面是在一套 Three.js 实时系统里一点点调出来的。"], cover: "/assets/vj/stage-cover.png", link: "https://weixin.qq.com/sph/AdPHIeILrL", treatment: "stage", workflow: ["先确定开幕式的整体视觉方向和动态语言","结合 Blender 和 TouchDesigner 制作不同的动态视觉素材","用 AI 辅助写代码，把视觉做成可以响应音乐的交互网页","根据音乐和现场节奏继续调整画面与动态","最后整理、剪辑成开幕式大屏播放的视频"], role: "实时视觉系统搭建与开幕式动态视觉制作", tools: ["Blender","TouchDesigner","Three.js","AI 辅助编程"] },
  { number: "03", id: "scenova", category: "AI × PRODUCT", title: "SCENOVA", chinese: "三维扫描无人机", copy: ["内部框架已经确定。", "我要做的是给它加一套能挡雨、够轻，而且方便换电池的外壳。"], cover: "/assets/drone/design-focus.jpg", link: "https://xhslink.cn/o/Aj5mp4dc8V4", treatment: "product", video: "/videos/03-scenova.mp4", workflow: ["先明确无人机的目标应用场景、需要解决的问题和功能需求","根据已有内部结构，分别研究散热位置、卡扣形式、外壳形态和组合方式","利用 AI 快速生成大量设计方向，把不同可能性尽量铺开","从大量结果里筛选真正有价值的部分，继续调整比例、结构关系和外观语言","最终继续完成整体视觉呈现与项目输出"], role: "无人机外壳设计探索与方案深化", tools: ["AI 辅助设计","结构与外观可视化"] },
  { number: "04", id: "morning-tea", category: "AI × CHARACTER", title: "MORNING TEA ARENA", chinese: "早茶运动场", copy: ["三天里，我们把早茶点心和不同的体育动作配成角色，", "再把它们放进一座三层蒸笼运动场。"], cover: "/assets/tea/01.webp", link: "https://xhslink.cn/o/5hm7HNx2dzS", treatment: "character", workflow: ["从广式早茶和全运会两个主题出发，搭建整个 IP 的世界观","把蒸笼设定成运动场，把不同的早茶变成运动员","使用 AI 快速探索角色造型、表情和不同视觉方向","继续完善角色背景、人物关系和故事设定，形成完整的 IP 世界","最后延展到盲盒、包袋以及不同的文创产品"], role: "角色与 IP 视觉设计、文创延展", tools: ["AI 图像生成","角色与 IP 视觉设计"] },
  { number: "05", id: "liminal-maze", category: "MOTION × SPACE", title: "LIMINAL MAZE", chinese: "Tokyo 3D Mapping", copy: ["建筑不是一块普通屏幕。", "画面要对准它的边缘、窗口和中轴，远距离看也要成立。"], cover: "/assets/mapping/cover.png", link: "https://xhslink.cn/o/3cdyF9ClixM", treatment: "mapping", video: "/videos/05-liminal-maze.mp4", workflow: ["先在 Blender 中搭建三维场景，确定空间结构、构图和镜头运动","将 Blender 渲染出来的视频和图片，直接作为 AI 视频生成的输入参考","在已经确定的空间与镜头基础上，继续使用 AI 生成动态影像","根据音乐进行卡点剪辑","通过蒙版处理，制作成最终可以用于投影的视频"], role: "三维场景与投影影像制作", tools: ["Blender","AI 视频生成","剪辑与投影蒙版"] },
  { number: "06", id: "guozi", category: "AI × FILM", title: "GUOZI", chinese: "《二手玫瑰的果子》", copy: ["AI 很快给出很多画面。", "真正麻烦的是让人物、场景和光线，一直属于同一部片子。"], cover: "/assets/guozi/cover.webp", link: "https://xhslink.cn/o/6j2yFt8nRMM", treatment: "film", video: "/videos/06-guozi.mp4", workflow: ["先从二手玫瑰《果子》的音乐出发，根据音乐的情绪和节奏确定一个初步的故事方向","使用 AI 生图，寻找人物、场景和关键视觉","生成过程中出现的新画面，也会反过来影响和改变故事的发展","确定视觉方向后，继续将关键画面生成动态镜头","最后通过剪辑，把故事、画面和音乐重新组织成完整 MV"], role: "音乐影像视觉探索与动态剪辑", tools: ["AI 图像生成","AI 视频生成","音乐剪辑"] },
];
