# FastH3 原版：四项单独有损消融

用户最终要求为 7 个 prompt × 5 个版本 = 35 个视频，每个版本一条视频；同一 prompt 统一 seed 1101。

共同基线是 FastVideo 上游 commit `3196835913ce9e97b23888b32643a1207cc5ee70`，官方完整 FastH3 VSA-DataFree checkpoint revision `b65818d41939b5085451074fe8ca8b799f8d4921`。不使用之前的 vLLM-Omni 重实现、融合 LoRA 或通信调度优化。复用已经验证的原版源码；唯一共同兼容修改是输入校验允许 362 帧，以满足 15 秒的 VAE 帧数对齐，原版编码和混流逻辑不改。

共同配置：1280×704，24 fps，362 输入帧，5 个 sigma 网格点（4 次 DiT），seed 1101，原版 `all` profile，Triton VSA tile64 / sparsity0.9，FA4 关闭，8 卡 SP+FSDP、TP1，原版 NCCL all-to-all，原版并行 VAE gather 及 VAE 编译。原版在当前 GPU 上自行禁用不兼容的 DiT regional compile；五组一致。所有组使用同一 Python/Torch/CUDA 运行环境。

| 版本 | 唯一有损变量 |
|---|---|
| original | 无：原版 |
| dit_mxfp8 | 50 个 DiT block 的 Q/K/V/O 和两层 FF，共 300 个独立投影，A8W8 MXFP8 |
| sage_attention | VSA fine sparse attention 的 QK INT8、PV FP8 |
| vae_mxfp8 | 36 个视频 VAE decoder block 的 Q/K/V/O 和两层 FF，共 216 个独立投影，A8W8 MXFP8 |
| vae_nvfp4 | 同样的 216 个视频 VAE decoder 投影，A4W4 NVFP4 |

DiT 保留原版 BF16 FSDP 参数、分片和通信，收到未分片权重后再量化该次 GEMM，不融合 QKV、不改 gate/AdaLN、refiner、输入输出投影。VAE 从原版 FP32 权重量化，保持 FP16 autocast 的输入输出边界，保留原来的分开 Q/K/V、attention、卷积、norm、激活、空间分块、时间分块和音频 VAE。Sage 保留原版的 mask、稀疏度、pooling、coarse、gate 与通信，只替换 fine kernel。

量化适配器位于实验目录，通过 Python 启动时安装，原版源码和模型文件不改。逐 rank 审计实际调用数量，并记录 VAE 输入 latent 哈希，检验两组 VAE 消融的上游输入与原版一致。`qualification.json` 记录真实 GPU GEMM、Sage ragged mask 与编译 VAE 接口的数值检查；这不是视频质量结论。

`prompts/` 保存用户提供的完整文本，仅补全第 3、5、7 个 prompt 字段名缺失的首字母 i，移除组号标签，没有 padding 或截断。`manifest.json` 保存 prompt 哈希和共同参数。

运行：先执行 `qualify.py`，通过后执行 `python -B run_all.py`。各组产物在 `runs/<arm>/`；日志、调用审计与最终视频分开保存。首个请求含编译，各组计时仅供运行记录，不能当作纯量化性能基准。

