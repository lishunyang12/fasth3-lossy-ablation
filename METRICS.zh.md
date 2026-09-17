# FastH3 对原版 PSNR / SSIM

对当前页面 7 组 prompt 的每个视频，与该组 Original 解码后的完整视频逐帧比较。已完成全部 42 个视频（含 7 个 Original 自检），35 个有损视频均已与原版比较。新增列仅回退 DiT O projection，输出与其他版本同为 361 帧。

使用 FFmpeg 8-bit YUV420p 的 `psnr` 和 `ssim` 过滤器，1280×704、24 fps，时间戳从 0 起对应；不缩放、不裁剪画面、不搜索最佳时间偏移。所有视频均比较完整 361 帧。PSNR 为所有帧加权 MSE 转换后的 dB 值；SSIM All 为 FFmpeg 平面加权、帧均值。另保存 Y/U/V 分量、逐帧日志、原文件 SHA256 和完整命令。

Original 自检均为 PSNR ∞、SSIM 1。这里比较的是已经编码的 MP4，包含视频编码影响；生成轨迹分歧会显著降低像素指标，因此不能用这些分数直接排序主观画质，也不是音频质量指标。

| 现有有损版本 | 7 case PSNR 均值（dB） | 7 case SSIM 均值 |
|---|---:|---:|
| dit_mxfp8 | 16.3294 | 0.566774 |
| sage_attention | 18.2753 | 0.622704 |
| vae_mxfp8 | 39.4112 | 0.962671 |
| vae_nvfp4 | 37.1810 | 0.952888 |

此表为各 case 分数的算术平均，不是将七条视频拼接后重算的 pooled PSNR。逐 case 数值见 [CSV](metrics.csv) 和 [JSON](metrics-summary.json)。

实现定义：[FFmpeg PSNR](https://ffmpeg.org/ffmpeg-filters.html#psnr)、[FFmpeg SSIM](https://ffmpeg.org/ffmpeg-filters.html#ssim)。

新增 DiT MXFP8 · O BF16：7 个 case 平均 PSNR **16.5881 dB**，平均 SSIM **0.572477**。
