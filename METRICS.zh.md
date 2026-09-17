# PSNR / SSIM

共 63 条比较：56 个有损视频对同组 Original，以及 7 个 Original 自检（PSNR ∞、SSIM 1）。完整 361 帧、1280×704、24 fps、解码后的 8-bit YUV420p；零时间戳对齐，不缩放、不裁剪、不插帧、不搜索时间偏移，音频不参与指标。PSNR average 为全视频按平面像素数加权的 MSE 转换成 dB；SSIM All 为 FFmpeg 平面加权帧均值。指标包含 MP4 编码影响，不直接代表主观画质。

| 版本 | 平均 PSNR / dB | 平均 SSIM |
|---|---:|---:|
| DiT MXFP8 | 16.3294 | 0.566774 |
| Sage Attention | 18.2753 | 0.622704 |
| VAE MXFP8 | 39.4112 | 0.962671 |
| VAE NVFP4 | 37.1810 | 0.952888 |
| DiT MXFP8 · O BF16 | 16.5881 | 0.572477 |
| DiT MXFP8 · QKVO BF16 | 17.3670 | 0.596293 |
| MXFP8 · 首步原版 | 19.7543 | 0.668078 |
| Sage · 首步原版 | 22.5444 | 0.758959 |

汇总为逐 case 分数的算术平均，不是 pooled PSNR。首步保护是 1/4 原版、3/4 有损，不能当作精确 10% / 90%。参见 [逐 case CSV](metrics.csv)、[完整 JSON](metrics-summary.json)、[逐帧日志](metrics-per-frame.zip)。

定义：[FFmpeg PSNR](https://ffmpeg.org/ffmpeg-filters.html#psnr)、[SSIM](https://ffmpeg.org/ffmpeg-filters.html#ssim)。
