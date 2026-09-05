import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [docxPath, outputDirectory] = process.argv.slice(2);
if (!docxPath || !outputDirectory) {
  throw new Error("Usage: node scripts/extract-project-marks.mjs <source.docx> <output-directory>");
}

const unzipOptions = { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 };
const xml = execFileSync("unzip", ["-p", docxPath, "word/document.xml"], unzipOptions);
const text = [...xml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
  .map((match) => match[1])
  .join("")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"')
  .replaceAll("&amp;", "&");

const svgs = [...text.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map((match) => match[0]);
if (svgs.length !== 6) throw new Error(`Expected 6 SVG blocks, found ${svgs.length}.`);

mkdirSync(outputDirectory, { recursive: true });
const slugs = ["space-field", "graduation-vj", "scenova", "morning-tea", "liminal-maze", "guozi"];
const stickerNumbers = [1, 2, 4, 3, 5, 6];
for (let index = 0; index < slugs.length; index += 1) {
  writeFileSync(join(outputDirectory, `${slugs[index]}.svg`), svgs[index]);
  const image = execFileSync("unzip", ["-p", docxPath, `word/media/image${stickerNumbers[index]}.png`], { maxBuffer: 16 * 1024 * 1024 });
  writeFileSync(join(outputDirectory, `${slugs[index]}-sticker.png`), image);
}
