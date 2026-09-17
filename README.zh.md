# FastH3 有损消融与 attention BF16 回退

七组完整 prompt、seed 1101、1280×704、24 fps、4 次 DiT 均与原页面一致。保留原有六列 42 段 MP4 的字节，每组最后追加「DiT MXFP8 · QKVO BF16」，共 49 段视频。

新增版本在「DiT MXFP8 · O BF16」基础上，将 Q/K/V 也恢复为原始 BF16：50 层的 Q/K/V/O 合计 200 个 attention 投影全部调用原始 UnquantizedLinearMethod；两层 FFN 合计 100 个投影继续使用相同 MXFP8 方法。BF16 权重来自原始 checkpoint，不是量化后反量化。VSA 稀疏选择、attention kernel、gate、通信、VAE、音频和输出处理均保持一致。

每个请求、每个 rank 均核验 4 次 DiT、100 个 MXFP8 FFN 投影各调用 4 次、200 个 BF16 attention 投影各调用 4 次。新增 56 份调用审计通过，全部 49 段视频完整解码通过，均为 361 帧。输入仍为 VAE 对齐的 362 帧，保留原版混流处理。

42 个有损视频均与同组 Original 做全帧 PSNR / SSIM，另有 7 个 Original 自检。解码域为 8-bit YUV420p，因此包括 MP4 编码影响；不缩放、不裁剪、不搜索时间偏移。生成轨迹变化会降低像素相似度，指标不直接代表主观画质。逐片 PSNR 由全视频加权 MSE 转换为 dB；SSIM 使用 FFmpeg All。汇总值为 7 个 case 的算术平均。完整数值、分量及逐帧日志见 metrics-summary.json、metrics.csv、metrics-per-frame.zip、METRICS.zh.md。

历史 ZIP 仍为标注的原有 35 段视频，新视频可从每张卡片下载。此页面是质量消融，运行计时含首次编译，不能当作最快组合链路的实时性能测试。
