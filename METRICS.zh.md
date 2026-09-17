# PSNR / SSIM 算法对比

已完成 49 段视频的测试：42 个有损视频各与同组 Original 比较，7 个 Original 自检均为 PSNR ∞、SSIM 1。

使用 FFmpeg 的 psnr、ssim 过滤器，对解码后的 8-bit YUV420p 逐帧比较，1280×704、24 fps、完整 361 帧。输入从同一个零时间戳开始，不缩放、不裁剪、不插帧、不搜索最佳时间偏移，没有排除末帧。PSNR average 由所有帧、各平面像素数加权的 MSE 转换成 dB；SSIM All 为 FFmpeg 平面加权、帧均值。音频不参与这两个指标。

指标包含视频编码影响，衡量相对 Original 的像素相似度，不直接等同于主观质量。同 seed 下的生成轨迹也可能不同。

| 版本 | 7 case 平均 PSNR / dB | 7 case 平均 SSIM |
|---|---:|---:|
| DiT MXFP8 | 16.3294 | 0.566774 |
| Sage Attention | 18.2753 | 0.622704 |
| VAE MXFP8 | 39.4112 | 0.962671 |
| VAE NVFP4 | 37.1810 | 0.952888 |
| DiT MXFP8 · O BF16 | 16.5881 | 0.572477 |
| DiT MXFP8 · QKVO BF16 | 17.3670 | 0.596293 |

这里是逐 case 分数的算术平均，不是将所有视频拼接后重算的 pooled PSNR。每条视频的 SHA-256、逐帧结果与 Y/U/V 分量见 [JSON](metrics-summary.json)、[CSV](metrics.csv)、[逐帧日志](metrics-per-frame.zip)。

算法定义：[FFmpeg PSNR](https://ffmpeg.org/ffmpeg-filters.html#psnr)、[FFmpeg SSIM](https://ffmpeg.org/ffmpeg-filters.html#ssim)。
