# PSNR / SSIM

63 个有损视频对同组 Original，另有 7 个原版自检。完整 361 帧、1280×704、24 fps、8-bit YUV420p。FFmpeg PSNR average 使用全视频平面加权 MSE，SSIM 使用 All；包含编码影响，不代表主观画质排序。前 63 个指标已复核视频哈希，新计算组合版 7 个指标。

| 版本 | 平均 PSNR / dB | 平均 SSIM |
|---|---:|---:|
| MXFP8 + Sage · 首步原版 | 19.7621 | 0.669343 |
| DiT MXFP8 | 16.3294 | 0.566774 |
| Sage Attention | 18.2753 | 0.622704 |
| VAE MXFP8 | 39.4112 | 0.962671 |
| VAE NVFP4 | 37.1810 | 0.952888 |
| DiT MXFP8 · O BF16 | 16.5881 | 0.572477 |
| DiT MXFP8 · QKVO BF16 | 17.3670 | 0.596293 |
| MXFP8 · 首步原版 | 19.7543 | 0.668078 |
| Sage · 首步原版 | 22.5444 | 0.758959 |

汇总为 7 个 case 分数的算术平均。新增组合版：首步 BF16 + 原版 VSA，后三步 MXFP8 + Sage，VAE 原版。

[逐 case CSV](metrics.csv) / [JSON](metrics-summary.json) / [逐帧日志](metrics-per-frame.zip)
