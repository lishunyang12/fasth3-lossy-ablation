# FastH3 有损消融与 DiT O projection BF16 回退

沿用原页面七组完整 prompt、seed 1101、1280×704、24 fps、四次 DiT、相同上游完整 checkpoint 与运行配置。原有五列和 35 段 MP4 保持字节不变；每组末尾追加「DiT MXFP8 · O BF16」。

新增列以页面的 DiT MXFP8 为对照，仅将每个 DiT block 的 attention `to_out` / `proj_o` 恢复为原始 BF16。50 层的 Q/K/V 与 FFN input/output 合计 250 个投影继续使用原来 MXFP8 方法，50 个 O projection 调用原始 UnquantizedLinearMethod。权重来自原始 BF16 checkpoint，不是量化后反量化。没有加入 Sage、VAE NVFP4 或最快组合链路的其他改动。

每个请求、每个 rank 都验证 4 次 DiT、250 个 MXFP8 投影各 4 次以及 50 个 BF16 O 各 4 次，新增 56 份调用审计通过。所有 42 条视频完整解码通过，均 361 帧。输入仍为 VAE 对齐的 362 帧，原版混流输出处理保持一致。

所有有损版本补充对 Original 的 PSNR / SSIM：完整 361 帧，相同时间戳，不缩放、不裁剪、不搜索偏移。使用解码 MP4 的 8-bit YUV420p，因此含编码影响。生成轨迹变化会降低像素指标，分数不直接代表主观质量。逐片 PSNR 为全视频加权 MSE 的 dB 转换，SSIM 为 FFmpeg All；汇总表为 7 个 case 分数的算术平均。参见 metrics-summary.json、metrics.csv、METRICS.zh.md 和 metrics-per-frame.zip。

原有 ZIP 仍是标注的 35 段历史发布；新视频可从各卡片直接下载。原版计时包含首次编译，不将这些消融样片的运行时间当作实时性能结论。
