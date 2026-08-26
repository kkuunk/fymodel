// 切分模型为 <20MB 块（jsDelivr 单文件限制），生成 manifest.json + chunk-*.bin
// 用法：node scripts/split-model.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "public", "models", "doclayout", "doclayout_yolo_docstructbench_imgsz1024.onnx.gz");
const OUT = path.join(ROOT, "model-chunks");
const CHUNK_SIZE = 15 * 1024 * 1024; // 15MiB（<20MB jsDelivr 限制，留余量）
const data = readFileSync(SRC);
mkdirSync(OUT, { recursive: true });
const chunks = [];
let offset = 0, i = 0;
while (offset < data.length) {
  const end = Math.min(offset + CHUNK_SIZE, data.length);
  const buf = data.subarray(offset, end);
  const name = `chunk-${String(i).padStart(2, "0")}.bin`;
  writeFileSync(path.join(OUT, name), buf);
  chunks.push({ name, size: buf.length, sha256: createHash("sha256").update(buf).digest("hex") });
  offset = end;
  i++;
}
const manifest = {
  name: "doclayout_yolo_docstructbench_imgsz1024.onnx.gz",
  size: data.length,
  sha256: createHash("sha256").update(data).digest("hex"),
  chunkSize: CHUNK_SIZE,
  chunks,
};
writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("切分完成: " + chunks.length + " 块, 总 " + data.length + " 字节 → " + OUT);
for (const c of chunks) console.log("  " + c.name + " " + c.size + "B");