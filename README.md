# 匡匡翻译器 · 版面模型 CDN 分块仓库

匡匡翻译器（pdf2zh-web）的 DocLayout-YOLO 版面模型分块，托管于本仓库，通过 **jsDelivr** 免费 CDN 加速国内客户端下载。

## 文件说明

```
model-chunks/
  manifest.json                清单（总大小/SHA-256/每块信息）
  chunk-00.bin ~ chunk-04.bin  模型分块（每块 <20MB，jsDelivr 单文件限制）
scripts/
  split-model.mjs              切分脚本（模型更新时重新切分用）
```

- 源文件：`doclayout_yolo_docstructbench_imgsz1024.onnx.gz`（61.84MB，gzip 压缩）；
- 分块：5 块（4×15MiB + 1.9MiB），manifest.json 含每块 SHA-256 用于完整性校验；
- **jsDelivr 用法**（本仓库 push 到 GitHub 公开仓库后）：

```
https://cdn.jsdelivr.net/gh/<GitHub用户名>/<仓库名>@master/model-chunks/manifest.json
https://cdn.jsdelivr.net/gh/<GitHub用户名>/<仓库名>@master/model-chunks/chunk-00.bin
# ...
```

前端（doclayout-worker.js）配置 `window.__KK_MODEL_CDN__` = `https://cdn.jsdelivr.net/gh/<用户>/<仓库>@master/model-chunks/` 后，
按清单并行/顺序下载分块 → SHA-256 校验 → 拼接 → gzip 解压 → 加载模型；
分块下载失败自动回退本地路径。

## 更新模型（模型文件变更时）

```bash
# 1. 替换模型源文件到原项目 public/models/doclayout/ 下同名文件
# 2. 重新切分（生成新的 manifest.json + chunk-*.bin，覆盖本仓库 model-chunks/）
node scripts/split-model.mjs
# 3. commit + push 到 GitHub 公开仓库
git add -A && git commit -m 'update model' && git push
# 4. （可选）刷新 jsDelivr 缓存：https://purge.jsdelivr.net/gh/<用户>/<仓库>@master/ 或换 tag
```

## 注意事项

- 仓库必须**公开**（jsDelivr 不服务私有仓库）；
- 单文件 <20MB（jsDelivr 限制），本仓库分块 15MiB 满足；
- jsDelivr 缓存默认 12 小时，更新模型后可用 purge 接口或换分支/tag 立即生效；
- 切分脚本依赖 Node.js（`node scripts/split-model.mjs`，需在含 public/models 的项目目录运行）。