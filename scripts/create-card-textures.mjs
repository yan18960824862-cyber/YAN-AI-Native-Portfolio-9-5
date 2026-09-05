import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const cards=[
 ['01','space-field','SPACE & FIELD','AI / VISUAL SYSTEM','From handmade type to a reusable SVG, 3D and motion workflow.'],
 ['02','graduation-vj','GRADUATION VJ','REAL-TIME / AUDIO / 3D','A live Three.js system used to tune the final opening VJ.'],
 ['03','scenova','SCENOVA','AI / PRODUCT / 3D','A light, rain-ready shell built around a fixed scanning-drone frame.'],
 ['04','morning-tea','MORNING TEA ARENA','AI / CHARACTER / IP','Cantonese dim sum and sports combined into one character world.'],
 ['05','liminal-maze','LIMINAL MAZE','MOTION / SPACE / MAPPING','Motion composed for the scale, edges and rhythm of architecture.'],
 ['06','guozi','GUOZI','AI / FILM / DIRECTION','An AI film shaped through continuity, selection, rhythm and editing.']
];
mkdirSync('public/assets/lanyard/cards',{recursive:true});
for(const [no,id,title,category,copy] of cards){
 const sticker=`public/assets/project-marks/${id}-sticker.png`,front=`public/assets/lanyard/cards/${id}-front.png`,back=`public/assets/lanyard/cards/${id}-back.png`;
 execFileSync('convert',['-size','1200x1680','xc:#ffffff','(',sticker,'-resize','1040x980>',')','-gravity','north','-geometry','+0+150','-composite','-fill','#343230','-font','DejaVu-Sans-Bold','-pointsize','72','-gravity','southwest','-annotate','+74+230',`${no}  ${title}`,'-font','DejaVu-Sans','-pointsize','25','-annotate','+78+158',category,front]);
 execFileSync('convert',['-size','1200x1680','xc:#ffffff','-fill','#343230','-font','DejaVu-Sans-Bold','-pointsize','74','-gravity','northwest','-annotate','+76+120',`${no}  ${title}`,'-font','DejaVu-Sans','-pointsize','27','-annotate','+80+245',category,'-pointsize','38','-gravity','center','-annotate','+0+0',copy,'-font','DejaVu-Sans-Bold','-pointsize','28','-gravity','southwest','-annotate','+80+110','OPEN PROJECT  ↗',back]);
}
