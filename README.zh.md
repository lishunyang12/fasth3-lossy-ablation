# FastH3 首步原版，后三步 MXFP8 + Sage

每个 case 顶部新增一条组合视频，共 7 个 prompt × 10 个版本 = 70 段。此前 63 段视频保持原始字节。

新增组合版共有 4 次 DiT forward。第 1 步：300 个 Q/K/V/O 与 FFN 投影使用原始 BF16，50 次 fine sparse attention 使用原版 Triton VSA，不使用 Sage。第 2–4 步：同时启用现有 DiT MXFP8 与 Sage Attention。原版视频/音频 VAE、checkpoint、稀疏选择、采样、通信、完整 prompt、seed 1101 和 1280×704 输出设置不变。

这次是两项有损方法的组合实验。此前 MXFP8 首步原版与 Sage 首步原版是分别启用单项方法的对照。保护一个完整步骤对应 25% / 75%，未改变原始 4 步采样轨迹。

新增 56 份 rank/request 审计逐步验证投影与 attention 的实际调度。每个 rank 每条请求：首步 300 个 BF16 投影与 50 次原版 VSA，后三步每个投影调用 MXFP8 3 次，Sage 合计 150 次。7 个 case 的首步输入与 video/audio velocity 哈希均与此前两个已验证的首步原版对照完全一致。

新增 7 段视频完成全帧视频与音频解码。每条有损视频对同 prompt 的 Original 测量 PSNR/SSIM：完整 361 帧、24 fps、解码后 8-bit YUV420p，不缩放、不裁剪、不搜索时间偏移。指标含编码影响，表示对原版相似度，不等同于主观画质。此前指标在重新核验视频 SHA256 后复用。

本次使用原版 VAE 的质量实验脚本，保留调度审计、首步 tensor 导出及首次编译开销。运行时间不是已优化实时服务的延迟基准，不能据此声称组合版已达到实时。

所有 MP4 保留原始字节，可从每张卡片下载；历史 ZIP 仍是原有 35 段。新增 7 段使用同一 GitHub 仓库的 combined-first-step-20260918 release assets 托管，以保持 Pages 站点低于 1 GB；原有 63 段地址不变。详见 execution-manifest.json、validation.json、validation-combined.json 与 metrics-summary.json。
