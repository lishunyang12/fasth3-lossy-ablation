# FastH3 有损消融与早期去噪保护

在已有七组完整 prompt、seed 1101、1280×704、24 fps、4 次 DiT 的对照上新增两组。每组末尾依次追加「MXFP8 · 首步原版」「Sage · 首步原版」，共 63 段视频；此前 49 段保留原始字节。

用户提出前 10% 原版、后 90% 有损。当前实际只有 4 次 DiT forward，保护一个完整早期去噪步的最小粒度为 25%。本轮采用第 1 次原版、第 2–4 次对应有损方法，明确标注 25% / 75%（按 forward 次数）。未增加采样步数、未插入 sigma，也不是每一步的前几层保护；本轮结果不能冒充精确 10% / 90% 的结果。

MXFP8 组：首步全部使用原始 BF16 Q/K/V/O 和 FFN 投影；后 3 步的全部 300 个 DiT 投影使用与页面 DiT MXFP8 相同的有损实现。VSA attention 始终为原版。

Sage 组：首步使用原版 Triton VSA attention，后 3 步的 50 层 attention 使用与页面 Sage Attention 相同的 kernel。所有线性投影始终为原始 BF16。两个版本分别测试，不叠加 MXFP8 与 Sage。

每个 case、每个 rank、每个去噪步均核验 300 个线性投影和 50 次 attention 的实际执行模式。新增 112 份 rank/request 审计通过。两组的首步输入和 video/audio velocity 的 SHA-256 在全部 7 个 case 中一致，确认从相同原版首步出发。已有有损实现和上游源码保持字节不变。

所有 63 段视频完整解码通过，均为 361 帧。全部 56 个有损视频按同组 Original 的完整 361 帧测量 PSNR/SSIM，另有 7 个原版自检。指标在解码的 8-bit YUV420p 上计算，包括编码影响；不缩放、不裁剪、不搜索时间偏移。指标代表对原版的相似度，不直接等同于主观画质；有限 case 和固定 seed 也不能单独证明一般性的早期敏感性规律。

逐片 PSNR 由全视频加权 MSE 转换为 dB；SSIM 使用 FFmpeg All。汇总为 7 个 case 分数的算术平均。完整指标及逐帧日志见 metrics-summary.json、metrics.csv、metrics-per-frame.zip、METRICS.zh.md。

历史 ZIP 仍为原有 35 段，新视频可在卡片下载。此轮保留质量核验与首步 tensor 导出开销，计时不能当作最快链路的实时性能基准。
